import { Component, EventEmitter, Input, OnInit, ChangeDetectorRef, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../../../../core/models/order.model';
import { Product } from '../../../../../core/models/product.model';
import { CommonService, EnumResponse } from '../../../../../core/services/common.service';
import { OrderService } from '../../../../../core/services/order.service';
import { ProductService } from '../../../../../core/services/product.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private orderService = inject(OrderService);
    private productService = inject(ProductService);
    private commonService = inject(CommonService);
    private notify = inject(NotificationService);

    @Input() order: Order | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();

    isLoading = false;
    products = signal<Product[]>([]);
    cartItems = signal<any[]>([]);
    statusOptions = signal<EnumResponse[]>([]);

    // Opções de estado apenas para criação
    createStatusOptions = computed(() => {
        const allowedForCreation = ['PENDING', 'PAID', 'DELIVERED'];
        return this.statusOptions().filter(opt => allowedForCreation.includes(opt.key));
    });

    createForm!: FormGroup;
    itemForm!: FormGroup;

    totalCreateAmount = computed(() => {
        const itemsTotal = this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shippingCost = this.createForm?.get('shippingCost')?.value || 0;
        return itemsTotal + shippingCost;
    });

    ngOnInit() {
        this.loadStatusOptions();
        if (this.order) {
            this.fetchOrderDetails(this.order.id);
        } else {
            this.loadProducts();
            this.initForms();
            this.setupFormListeners(); // Ativa validações dinâmicas
        }
    }

    private loadStatusOptions() {
        this.commonService.getOrderStatus().subscribe({
            next: (types) => this.statusOptions.set(types),
            error: (err) => this.notify.apiError(err, 'Erro ao carregar status.')
        });
    }

    getAvailableStatusOptions() {
        if (!this.order) return [];
        const current = this.order.status;
        const allOptions = this.statusOptions();

        return allOptions.filter(opt => {
            if (opt.key === current) return true;
            switch (current) {
                case 'PENDING': return ['PAID', 'CANCELLED', 'DELIVERED'].includes(opt.key);
                case 'PAID': return ['SHIPPED', 'DELIVERED', 'RETURNED'].includes(opt.key);
                case 'SHIPPED': return ['DELIVERED', 'RETURNED'].includes(opt.key);
                case 'DELIVERED': return ['RETURNED'].includes(opt.key);
                case 'CANCELLED': return ['PENDING'].includes(opt.key);
                case 'RETURNED': return ['PAID'].includes(opt.key);
                default: return false;
            }
        });
    }

    private fetchOrderDetails(id: string) {
        this.isLoading = true;
        this.orderService.getOrderByIdAdmin(id).subscribe({
            next: (fullOrder) => {
                this.order = fullOrder;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.notify.error('Erro ao carregar detalhes.');
                this.isLoading = false;
            }
        });
    }

    private initForms() {
        this.createForm = this.fb.group({
            // --- Dados Pessoais & Envio ---
            customerName: [''],
            customerEmail: [''],
            customerPhone: [''],
            customerNif: [''],

            // Morada de Envio
            address: [''],
            city: [''],
            zipCode: [''],

            // --- Faturação Diferente ---
            hasDifferentBilling: [false],
            billingAddress: [''],
            billingCity: [''],
            billingZipCode: [''],

            // --- Gift ---
            isGift: [false],
            giftFromName: [''],
            giftToName: [''],
            giftMessage: [''],
            giftHidePrice: [false],

            // --- Pagamento & Logística ---
            paymentMethod: ['numerario', Validators.required],
            shippingMethod: ['Correio Normal'],
            shippingCost: [0], // Novo campo
            channel: ['DIRECT', Validators.required],
            status: ['PAID', Validators.required],

            // --- Extras ---
            withoutBox: [false],
            withoutCard: [false]
        });

        this.itemForm = this.fb.group({
            productId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
    }

    // Configura validação dinâmica (Ex: Billing obrigatório se checkbox marcada)
    private setupFormListeners() {
        const billingCheck = this.createForm.get('hasDifferentBilling');

        billingCheck?.valueChanges.subscribe((isChecked: boolean) => {
            const fields = ['billingAddress', 'billingCity', 'billingZipCode'];

            fields.forEach(field => {
                const control = this.createForm.get(field);
                if (isChecked) {
                    control?.setValidators([Validators.required]);
                } else {
                    control?.clearValidators();
                    control?.setValue(''); // Limpa valor ao esconder
                }
                control?.updateValueAndValidity();
            });
        });

        // Recalcular total se mudar o custo de envio
        this.createForm.get('shippingCost')?.valueChanges.subscribe(() => {
            // Apenas para disparar o computed 'totalCreateAmount'
            this.cartItems.update(v => [...v]);
        });
    }

    private loadProducts() {
        this.productService.getAllProducts().subscribe({
            next: (data) => this.products.set(data),
            error: (err) => console.error('Erro produtos', err)
        });
    }

    addCartItem() {
        if (this.itemForm.invalid) return;
        const { productId, quantity } = this.itemForm.value;
        const product = this.products().find(p => p.id === productId);

        if (product) {
            this.cartItems.update(items => [...items,
                {
                    productId: product.id,
                    productName: product.name,
                    price: Number(product.price),
                    quantity: Number(quantity)
                }
            ]);
            this.itemForm.reset({ quantity: 1, productId: '' });
        }
    }

    async removeCartItem(index: number) {
        this.cartItems.update(items => items.filter((_, i) => i !== index));
    }

    submitCreate() {
        if (this.createForm.invalid || this.cartItems().length === 0) {
            this.createForm.markAllAsTouched();
            this.notify.error('Preencha os campos obrigatórios e adicione produtos.');
            return;
        }
        this.isLoading = true;
        const raw = this.createForm.getRawValue();
        const billingAddr = raw.hasDifferentBilling ? {
            street: raw.billingAddress,
            city: raw.billingCity,
            zip: raw.billingZipCode,
            country: 'Portugal'
        } : {
            street: raw.address,
            city: raw.city,
            zip: raw.zipCode,
            country: 'Portugal'
        };

        const payload = {
            customer: {
                fullName: raw.customerName,
                email: raw.customerEmail,
                phone: raw.customerPhone,
                nif: raw.customerNif,

                shippingAddress: {
                    street: raw.address,
                    city: raw.city,
                    zip: raw.zipCode,
                    country: 'Portugal'
                },
                billingAddress: billingAddr
            },
            giftDetails: raw.isGift ? {
                isGift: true,
                fromName: raw.giftFromName,
                toName: raw.giftToName,
                message: raw.giftMessage,
                hidePrice: raw.giftHidePrice
            } : null,

            payment: {
                method: raw.paymentMethod
            },
            channel: raw.channel,
            status: raw.status,
            shippingMethod: raw.shippingMethod,
            shippingCost: raw.shippingCost,
            items: this.cartItems().map(item => ({
                productId: item.productId,
                name: item.productName,
                price: item.price,
                quantity: item.quantity
            })),
            total: this.totalCreateAmount(),
            withoutBox: raw.withoutBox,
            withoutCard: raw.withoutCard
        };

        this.orderService.createOrderAdmin(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.notify.success('Venda registada com sucesso!');
                this.save.emit();
            },
            error: (err) => {
                this.isLoading = false;
                this.notify.apiError(err, 'Erro ao criar venda');
            }
        });
    }

    // --- MÉTODOS DE EDIÇÃO / ESTADO (Mantidos) ---
    async onStatusChange(event: Event) {
        if (!this.order) return;
        const select = event.target as HTMLSelectElement;
        const newStatus = select.value;
        const oldStatus = this.order.status;

        let message = `Mudar estado para ${newStatus}?`;
        if (newStatus === 'CANCELLED') message = `⚠️ ATENÇÃO: Ao CANCELAR, os artigos voltam para stock. Confirmar?`;
        else if (newStatus === 'RETURNED') message = `⚠️ ATENÇÃO: Ao DEVOLVER, os artigos voltam para stock. Confirmar?`;

        if (await this.notify.confirm(message)) {
            this.isLoading = true;
            this.orderService.updateStatus(this.order.id, newStatus).subscribe({
                next: (updatedOrder) => {
                    this.isLoading = false;
                    this.order = updatedOrder;
                    this.notify.success('Estado atualizado!');
                    this.save.emit();
                },
                error: (err) => {
                    this.isLoading = false;
                    select.value = oldStatus;
                    this.notify.apiError(err, 'Erro ao mudar estado');
                }
            });
        } else {
            select.value = oldStatus;
        }
    }

    toggleInvoice() {
        if (!this.order) return;
        const originalState = this.order.invoiceIssued;
        this.order.invoiceIssued = !originalState;
        this.orderService.toggleInvoiceStatus(this.order.id, originalState).subscribe({
            error: () => {
                if (!this.order) return;
                this.order.invoiceIssued = originalState;
                this.notify.error('Erro ao atualizar fatura');
            }
        });
    }

    updateCartCalculations() {
        this.cartItems.update(items => [...items]);
    }

    onClose() {
        this.close.emit();
    }
}
