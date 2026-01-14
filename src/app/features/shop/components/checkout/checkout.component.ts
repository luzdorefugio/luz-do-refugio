import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// --- IMPORTS ---
import { Promotion } from '../../../../core/models/promotion.model';
import { ShippingMethod } from '../../../../core/models/shipping.model';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PromotionService } from '../../../../core/services/promotion.service';
import { ShippingService } from '../../../../core/services/shipping.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  // --- INJEÇÃO ---
  cartService = inject(CartService);
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private promotionService = inject(PromotionService);
  private shippingService = inject(ShippingService);
  private destroyRef = inject(DestroyRef);

  // --- STATE ---
  currentStep = signal(1);
  isLoading = signal(false);
  isLoadingCoupon = signal(false);
  errorMessage = signal('');
  isGiftMode = signal(false);
  currentUser = signal<any>(null);

  // --- DATA ---
  shippingMethods = signal<ShippingMethod[]>([]);
  selectedShipping = signal<ShippingMethod | null>(null);
  couponCode = signal('');
  discountAmount = signal(0);
  couponApplied = signal(false);
  activePromotion = signal<Promotion | null>(null);

  preMadeMessages = [
    "Ilumina o teu dia! Com muito carinho.",
    "Para a pessoa que ilumina a minha vida. Feliz Dia dos Namorados!",
    "Que esta luz te traga paz e serenidade. Parabéns!",
    "Um pequeno gesto para um grande coração.",
    "Obrigado por seres luz no meu caminho."
  ];

  // --- COMPUTEDS ---
  currentShippingCost = computed(() => {
    const method = this.selectedShipping();
    if (!method) return 0;
    const subtotal = this.cartService.subTotal();
    if (subtotal >= 50 && method.name.toLowerCase().includes('registado')) {
      return 0;
    }
    return method.price;
  });

  totalAmount = computed(() => {
    const subtotal = this.cartService.subTotal();
    const shipping = this.currentShippingCost();
    const discount = this.discountAmount();
    return Math.max(0, subtotal + shipping - discount);
  });

  // --- FORMULÁRIO ---
  checkoutForm = this.fb.group({
    shipping: this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      country: ['Portugal', Validators.required]
    }),
    billing: this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      nif: [''],
      useShippingAddress: [true],
      address: [''],
      zipCode: [''],
      city: [''],
      hasNif: [false]
    }),
    gift: this.fb.group({
      isGift: [false],
      messageText: ['', [Validators.maxLength(250)]],
      messageType: ['custom'],
      fromName: [''],
    }),
    payment: this.fb.group({
      paymentMethod: ['MBWAY', Validators.required],
      coupon: ['']
    })
  });

  get giftMessageControl() {
    return this.checkoutForm.get('gift.messageText');
  }

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/loja']);
      return;
    }

    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set(user);
      this.fillFormForPersonalUse(user);
    }

    this.setupBillingValidation();
    this.loadShippingMethods();
  }

  // --- LÓGICA DE MODOS ---

  setMode(isGift: boolean) {
    this.isGiftMode.set(isGift);
    this.checkoutForm.get('gift.isGift')?.setValue(isGift);

    const user = this.currentUser();
    const billingGroup = this.checkoutForm.get('billing');

    if (isGift) {
      this.checkoutForm.get('shipping')?.reset({ country: 'Portugal' });
      if (user) {
        billingGroup?.patchValue({
          fullName: user.name,
          email: user.email,
          nif: user.nif,
          useShippingAddress: false,
          address: '',
          city: '',
          zipCode: '',
          hasNif: false
        });

        this.checkoutForm.get('gift.fromName')?.setValue(user.name);
      } else {
        // Se não tiver user, usamos 'as any' para evitar erro de partial
        billingGroup?.patchValue({ useShippingAddress: false } as any);
      }

    } else {
      // === MODO PESSOAL ===
      if (user) {
        this.fillFormForPersonalUse(user);
      }

      // CORREÇÃO 2: Usar 'as any' para fazer patch apenas do booleano
      billingGroup?.patchValue({
        useShippingAddress: true
      } as any);

      this.checkoutForm.get('gift.messageText')?.setValue('');
    }
  }

  private fillFormForPersonalUse(user: any) {
    this.checkoutForm.patchValue({
      shipping: {
        fullName: user.name,
        address: user.address,
        city: user.city,
        zipCode: user.zipCode,
        phone: user.phone,
        country: 'Portugal'
      },
      billing: {
        email: user.email,
        nif: user.nif
      }
    });
  }

  private setupBillingValidation() {
      const billingGroup = this.checkoutForm.get('billing');
      const useShippingCtrl = billingGroup?.get('useShippingAddress');

      useShippingCtrl?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val: boolean | null) => {
          const useShipping = !!val;

          const addressFields = ['address', 'zipCode', 'city'];
          addressFields.forEach(fieldName => {
            const control = billingGroup?.get(fieldName);
            if (useShipping) {
              control?.clearValidators();
              control?.setValue('');
            } else {
              control?.setValidators([Validators.required]);
            }
            control?.updateValueAndValidity();
          });

          const nameControl = billingGroup?.get('fullName');
          if (!useShipping || this.isGiftMode()) {
              nameControl?.setValidators([Validators.required]);
          } else {
              nameControl?.clearValidators();
          }
          nameControl?.updateValueAndValidity();
        });

      useShippingCtrl?.updateValueAndValidity();
  }

  loadShippingMethods() {
    this.shippingService.getActiveMethods().subscribe({
      next: (methods) => {
        this.shippingMethods.set(methods);
        if (methods.length > 0) this.selectShipping(methods[0]);
      },
      error: () => {
        this.shippingMethods.set([
           { id: 'standard', name: 'Envio Standard', description: '3-5 dias', price: 3.50, active: true }
        ]);
        this.selectShipping(this.shippingMethods()[0]);
      }
    });
  }

  selectShipping(method: ShippingMethod) {
    this.selectedShipping.set(method);
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
        if (promo.minOrderAmount && subTotal < promo.minOrderAmount) {
          this.handleCouponError(`Mínimo de ${promo.minOrderAmount}€ necessário.`);
          return;
        }

        let discount = 0;
        const shipping = this.currentShippingCost();

        switch (promo.discountType) {
          case 'PERCENTAGE': discount = subTotal * (promo.discountValue / 100); break;
          case 'FIXED_AMOUNT': discount = promo.discountValue; break;
          case 'FREE_SHIPPING': discount = shipping; break;
        }

        if (discount > subTotal + shipping) discount = subTotal + shipping;

        this.discountAmount.set(discount);
        this.couponApplied.set(true);
        this.activePromotion.set(promo);
        this.isLoadingCoupon.set(false);
      },
      error: () => this.handleCouponError('Código inválido ou expirado.')
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

  goToStep(step: number) {
    if (step === 3 && this.currentStep() === 2) {
      const shipping = this.checkoutForm.get('shipping');
      const billing = this.checkoutForm.get('billing');

      if (shipping?.invalid) {
        shipping.markAllAsTouched();
        return;
      }
      if (billing?.invalid) {
        billing.markAllAsTouched();
        return;
      }
    }
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const shippingMethod = this.selectedShipping();
    if (!shippingMethod) {
        alert('Selecione um método de envio.');
        return;
    }

    this.isLoading.set(true);

    const formValues = this.checkoutForm.getRawValue();
    const shippingData = formValues.shipping!;
    let billingData = formValues.billing!;
    const giftData = formValues.gift!;

    // Helper para dividir o nome
    const splitName = (fullName: string) => {
        const parts = fullName ? fullName.trim().split(' ') : [];
        if (parts.length === 0) return { firstName: '', lastName: '' };
        const firstName = parts[0];
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
        return { firstName, lastName };
    };

    // MERGE DE MORADA SE "IGUAL"
    if (billingData.useShippingAddress) {
      billingData = {
        ...billingData,
        fullName: this.isGiftMode() ? billingData.fullName : shippingData.fullName,
        address: shippingData.address,
        city: shippingData.city,
        zipCode: shippingData.zipCode,
      };
    }

    const shippingNames = splitName(shippingData.fullName || '');
    const billingNames = splitName(billingData.fullName || '');

    const orderPayload = {
      customer: {
        fullName: billingData.fullName,
        email: billingData.email,
        phone: shippingData.phone,
        nif: billingData.nif,
        shippingAddress: {
            street: shippingData.address,
            city: shippingData.city,
            zip: shippingData.zipCode,
            country: shippingData.country
        },
        billingAddress: {
            street: billingData.address,
            city: billingData.city,
            zip: billingData.zipCode,
            country: 'Portugal'
        }
      },

      giftDetails: this.isGiftMode() ? {
          isGift: true,
          fromName: giftData.fromName || billingData.fullName,
          toName: shippingData.fullName,
          message: giftData.messageText
      } : null,

      payment: {
          method: formValues.payment?.paymentMethod,
      },

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

    this.orderService.createOrderShop(orderPayload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.cartService.clearCart();
        this.router.navigate(['/loja/sucesso'], { queryParams: { id: response.id } });
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao processar encomenda. Tente novamente.');
      }
    });
  }

  isFieldInvalid(path: string): boolean {
    const field = this.checkoutForm.get(path);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }
}
