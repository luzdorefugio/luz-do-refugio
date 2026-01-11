import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, switchMap, of } from 'rxjs';

// --- IMPORTS DOS TEUS MÓDULOS ---
import { Promotion } from '../../../../core/models/promotion.model';
import { ShippingMethod } from '../../../../core/models/shipping.model'; // <--- Import Novo
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PromotionService } from '../../../../core/services/promotion.service';
import { ShippingService } from '../../../../core/services/shipping.service'; // <--- Import Novo

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  // --- INJEÇÃO DE DEPENDÊNCIAS ---
  cartService = inject(CartService);
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private promotionService = inject(PromotionService);
  private shippingService = inject(ShippingService); // <--- Serviço de Envio

  // --- ESTADO DA UI ---
  currentStep = signal(1);
  isLoading = signal(false);
  isLoadingCoupon = signal(false);
  errorMessage = signal('');

  // --- DADOS DE ENVIO ---
  shippingMethods = signal<ShippingMethod[]>([]);
  selectedShipping = signal<ShippingMethod | null>(null);

  // --- DADOS DO CUPÃO ---
  couponCode = signal('');
  discountAmount = signal(0);
  couponApplied = signal(false);
  activePromotion = signal<Promotion | null>(null);


  // --- COMPUTEDS (CÁLCULOS DINÂMICOS) ---

  /**
   * Calcula o custo de envio real.
   * Regra: Se for Standard e > 50€, é grátis.
   * Caso contrário, é o preço da BD.
   */
  currentShippingCost = computed(() => {
    const method = this.selectedShipping();

    // Se ainda não carregou os métodos, custo é 0
    if (!method) return 0;

    const subtotal = this.cartService.subTotal();

    // Regra de negócio: Portes grátis > 50€ (apenas para envio Standard/CTT)
    // Nota: Ajusta o ID 'Correio Registado' conforme o que tens na BD ou usa um código fixo
    if (subtotal >= 50 && method.name.includes('Registado')) {
      return 0;
    }

    return method.price;
  });

  /**
   * Total Final a Pagar
   * (Subtotal + Envios - Descontos)
   */
  totalAmount = computed(() => {
    const subtotal = this.cartService.subTotal();
    const shipping = this.currentShippingCost();
    const discount = this.discountAmount();

    // Math.max garante que nunca cobramos valor negativo
    return Math.max(0, subtotal + shipping - discount);
  });


  // --- FORMULÁRIO ---
  checkoutForm = this.fb.group({
    customer: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      hasNif: [false],
      nif: [''],
      address: ['', Validators.required],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      billingSameAsShipping: [true],
      saveToProfile: [false]
    }),
    payment: this.fb.group({
      paymentMethod: ['MBWAY', Validators.required],
      coupon: ['']
    })
  });

  ngOnInit() {
    // 1. Bloquear se carrinho vazio
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/loja']);
      return;
    }

    // 2. Preencher dados do user logado
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.checkoutForm.patchValue({
        customer: {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          nif: currentUser.nif,
          address: currentUser.address,
          city: currentUser.city,
          zipCode: currentUser.zipCode
        }
      });
    }

    // 3. Carregar métodos de envio
    this.loadShippingMethods();
  }

  loadShippingMethods() {
    this.shippingService.getActiveMethods().subscribe({
      next: (methods) => {
        this.shippingMethods.set(methods);
        // Selecionar o primeiro por defeito
        if (methods.length > 0) {
          this.selectShipping(methods[0]);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar envios', err);
        // Fallback de emergência caso a API falhe
        this.shippingMethods.set([
           { id: 'fallback', name: 'Envio Standard', description: '3-5 dias', price: 3.50, active: true }
        ]);
        this.selectShipping(this.shippingMethods()[0]);
      }
    });
  }

  // --- MÉTODOS DE AÇÃO ---

  selectShipping(method: ShippingMethod) {
    this.selectedShipping.set(method);

    // Se mudar o envio, e tivermos cupão de Portes Grátis, convém revalidar ou avisar
    if (this.activePromotion()?.discountType === 'FREE_SHIPPING') {
       this.removeCoupon();
       this.errorMessage.set('O envio mudou. Por favor, aplique o cupão novamente.');
    }
  }

  applyCoupon() {
    const code = this.couponCode().trim().toUpperCase();
    if (!code) return;

    this.isLoadingCoupon.set(true);
    this.errorMessage.set('');

    this.promotionService.validateCoupon(code).subscribe({
      next: (promo) => {
        const subTotal = this.cartService.subTotal();

        // 1. Validação de Mínimo
        if (promo.minOrderAmount && subTotal < promo.minOrderAmount) {
          this.handleCouponError(`Este cupão requer compras acima de ${promo.minOrderAmount}€.`);
          return;
        }

        // 2. Calcular Desconto
        let discount = 0;
        const currentShipping = this.currentShippingCost();

        switch (promo.discountType) {
          case 'PERCENTAGE':
            discount = subTotal * (promo.discountValue / 100);
            break;
          case 'FIXED_AMOUNT':
            discount = promo.discountValue;
            break;
          case 'FREE_SHIPPING':
            discount = currentShipping; // Desconta o valor exato dos portes
            break;
        }

        // 3. Limite de Segurança (Não descontar mais que o total)
        if (discount > subTotal + currentShipping) {
            discount = subTotal + currentShipping;
        }

        // 4. Sucesso
        this.discountAmount.set(discount);
        this.couponApplied.set(true);
        this.activePromotion.set(promo);
        this.isLoadingCoupon.set(false);
      },
      error: () => {
        this.handleCouponError('Código inválido ou expirado.');
      }
    });
  }

  removeCoupon() {
    this.couponCode.set('');
    this.handleCouponError('');
  }

  private handleCouponError(msg: string) {
    this.couponApplied.set(false);
    this.discountAmount.set(0);
    this.activePromotion.set(null);
    this.errorMessage.set(msg);
    this.isLoadingCoupon.set(false);
  }

  // Validação Visual dos Campos
  isFieldInvalid(path: string): boolean {
    const field = this.checkoutForm.get(path);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }

  // Navegação entre Steps
  goToStep(step: number) {
    // Validar Step 2 (Dados Pessoais) antes de ir para o 3
    if (step === 3 && this.currentStep() === 2) {
      const customerGroup = this.checkoutForm.get('customer');
      if (customerGroup?.invalid) {
        customerGroup.markAllAsTouched();
        return;
      }
    }
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- SUBMETER ENCOMENDA ---
  confirmOrder() {
    // 1. Validar Formulário
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // 2. Validar Envio (A CORREÇÃO DO ERRO DO TYPE NULL ESTÁ AQUI)
    const shippingMethod = this.selectedShipping();
    if (!shippingMethod) {
        alert('Por favor selecione um método de envio.');
        return;
    }

    this.isLoading.set(true);
    const formValues = this.checkoutForm.getRawValue();
    const currentUser = this.authService.currentUser();

    // 3. Atualizar Perfil (Opcional)
    let updateProfile$: Observable<any> = of(null);
    if (currentUser && formValues.customer?.saveToProfile) {
      const profileData = {
        phone: formValues.customer.phone ?? undefined,
        nif: formValues.customer.nif ?? undefined,
        address: formValues.customer.address ?? undefined,
        city: formValues.customer.city ?? undefined,
        zipCode: formValues.customer.zipCode ?? undefined
      };
      updateProfile$ = this.authService.updateProfile(profileData);
    }

    // 4. Criar Encomenda
    updateProfile$.pipe(
      switchMap(() => {
        const orderPayload = {
          customer: formValues.customer,
          payment: formValues.payment,
          total: this.totalAmount(),
          shippingMethod: shippingMethod.name,
          shippingCost: this.currentShippingCost(),
          appliedPromotionCode: this.couponApplied() ? this.couponCode() : null,
          discountAmount: this.discountAmount(),
          items: this.cartService.cartItems().map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        };
        return this.orderService.createOrderShop(orderPayload);
      })
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.cartService.clearCart();
        this.router.navigate(['/loja/sucesso'], { queryParams: { id: response.id } });
      },
      error: (error) => {
        this.isLoading.set(false);
      }
    });
  }

  handleMissingImage(event: any) {
    event.target.src = 'assets/candle-placeholder.jpg';
  }
}
