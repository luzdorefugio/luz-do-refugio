import { Component, EventEmitter, Input, OnInit, ChangeDetectorRef, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order } from '../../../../../core/models/order.model';
import { Product } from '../../../../../core/models/product.model';
import { CommonService, EnumResponse } from '../../../../../core/services/common.service';
import { OrderService } from '../../../../../core/services/order.service';
import { ProductService } from '../../../../../core/services/product.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private orderService = inject(OrderService);
    private productService = inject(ProductService);
    private commonService = inject(CommonService);
    private notify = inject(NotificationService);

    // Recebe null (Criar) ou um Objeto Resumo (Editar/Ver)
    @Input() order: Order | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();

    isLoading = false;
    products = signal<Product[]>([]);
    cartItems = signal<any[]>([]);

    // Lista completa vinda da API
    statusOptions = signal<EnumResponse[]>([]);

    // --- NOVO: Lista filtrada apenas para o formulário de CRIAÇÃO ---
    createStatusOptions = computed(() => {
        const allowedForCreation = ['PENDING', 'PAID', 'DELIVERED'];
        // Filtra a lista completa para mostrar apenas os permitidos
        return this.statusOptions().filter(opt => allowedForCreation.includes(opt.key));
    });

    createForm!: FormGroup;
    itemForm!: FormGroup;

    // Calcula o total do carrinho em tempo real
    totalCreateAmount = computed(() => {
        return this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
    });

    ngOnInit() {
        this.loadStatusOptions();

        if (this.order) {
            // --- MODO VISUALIZAÇÃO / EDIÇÃO ---
            this.fetchOrderDetails(this.order.id);
        } else {
            // --- MODO CRIAÇÃO ---
            this.loadProducts();
            this.initForms();
        }
    }

    private loadStatusOptions() {
        this.commonService.getOrderStatus().subscribe({
            next: (types) => this.statusOptions.set(types),
            error: (err) => this.notify.apiError(err, 'Erro ao carregar status das ordens.')
        });
    }

    // Filtra as opções baseado no diagrama de estados para EDIÇÃO
    getAvailableStatusOptions() {
        if (!this.order) return [];

        const current = this.order.status;
        const allOptions = this.statusOptions();

        return allOptions.filter(opt => {
            if (opt.key === current) return true;
            switch (current) {
                case 'PENDING':
                    return ['PAID', 'CANCELLED', 'DELIVERED'].includes(opt.key);
                case 'PAID':
                    return ['SHIPPED', 'DELIVERED', 'RETURNED'].includes(opt.key);
                case 'SHIPPED':
                    return ['DELIVERED', 'RETURNED'].includes(opt.key);
                case 'DELIVERED':
                    return ['RETURNED'].includes(opt.key);
                case 'CANCELLED':
                    return ['PENDING'].includes(opt.key);
                case 'RETURNED':
                    return ['PAID'].includes(opt.key);
                default:
                    return false;
            }
        });
    }

    private fetchOrderDetails(id: string) {
        this.isLoading = true;
        this.orderService.getOrderById(id).subscribe({
            next: (fullOrder) => {
                this.order = fullOrder;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.notify.error('Não foi possível carregar os detalhes da encomenda.');
                this.isLoading = false;
            }
        });
    }

    private initForms() {
        this.createForm = this.fb.group({
            customerName: ['', Validators.required],
            customerEmail: ['', [Validators.email]],
            customerPhone: [''],
            customerNif: [''],
            address: [''],
            city: [''],
            zipCode: [''],
            paymentMethod: ['numerario', Validators.required],
            channel: ['DIRECT', Validators.required],
            status: ['PAID', Validators.required], // Valor por defeito
            withoutBox: [false],
            withoutCard: [false]
        });

        this.itemForm = this.fb.group({
            productId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
    }

    private loadProducts() {
        this.productService.getAllProducts().subscribe({
            next: (data) => this.products.set(data),
            error: (err) => console.error('Erro ao carregar produtos', err)
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
        if (await this.notify.confirm('Remover item do carrinho?')) {
            this.cartItems.update(items => items.filter((_, i) => i !== index));
        }
    }

    submitCreate() {
        if (this.createForm.invalid || this.cartItems().length === 0) {
            this.createForm.markAllAsTouched();
            this.notify.error('Verifique os campos obrigatórios e adicione produtos.');
            return;
        }

        this.isLoading = true;
        const rawForm = this.createForm.getRawValue();

        const payload = {
            channel: rawForm.channel,
            status: rawForm.status,
            withoutBox: rawForm.withoutBox,
            withoutCard: rawForm.withoutCard,
            total: this.totalCreateAmount(),
            customer: {
                name: rawForm.customerName,
                email: rawForm.customerEmail,
                phone: rawForm.customerPhone,
                nif: rawForm.customerNif,
                address: rawForm.address,
                city: rawForm.city,
                zipCode: rawForm.zipCode
            },
            payment: {
                paymentMethod: rawForm.paymentMethod
            },
            items: this.cartItems().map(item => ({
                productId: item.productId,
                name: item.productName,
                price: item.price,
                quantity: item.quantity
            }))
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

    async onStatusChange(event: Event) {
        if (!this.order) return;

        const select = event.target as HTMLSelectElement;
        const newStatus = select.value;
        const oldStatus = this.order.status;

        let message = `Mudar estado para ${newStatus}?`;

        if (newStatus === 'CANCELLED') {
            message = `⚠️ ATENÇÃO: Ao CANCELAR, os artigos voltam para o stock e NÃO há reembolso. Tem a certeza?`;
        } else if (newStatus === 'RETURNED') {
             message = `⚠️ ATENÇÃO: Ao DEVOLVER, os artigos voltam para o stock e será gerado um REEMBOLSO. Tem a certeza?`;
        }

        const confirmed = await this.notify.confirm(message, 'Sim, confirmar');

        if (confirmed) {
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
                    this.notify.apiError(err, 'Não foi possível mudar o estado');
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
                this.notify.error('Erro ao atualizar estado da fatura');
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
