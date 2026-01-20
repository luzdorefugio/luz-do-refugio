import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrderService } from '../../../../../core/services/order.service';
import { ProductService } from '../../../../../core/services/product.service';
import { Order } from '../../../../../core/models/order.model';

interface CardToPrint {
    productName: string;
    isGift: boolean;
    message: string;
    colorDesc: string;
    giftFrom?: string;
    giftTo?: string;
    giftMessage?: string;
}

@Component({
    selector: 'app-print-card',
    imports: [CommonModule],
    templateUrl: './print-card.component.html',
    styleUrls: ['./print-card.component.scss']
})
export class PrintCardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderService = inject(OrderService);
    private productService = inject(ProductService);
    order = signal<Order | null>(null);
    cards = signal<CardToPrint[]>([]);
    isLoading = signal(true);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.orderService.getOrderByIdAdmin(id).subscribe({
                next: (order) => {
                    this.order.set(order);
                    this.prepareCards(order);
                },
                error: () => this.isLoading.set(false)
            });
        }
    }

    async prepareCards(order: Order) {
        const finalCards: CardToPrint[] = [];

        if (!order.items || order.items.length === 0) {
            this.isLoading.set(false);
            return;
        }
        for (const item of order.items) {
            let pMessage = '';
            let pColor = '';
            if (item.productId) {
                try {
                    const product = await firstValueFrom(this.productService.getProductById(item.productId));
                    if (product) {
                        pMessage = product.cardMessage;
                        pColor = product.cardColorDesc;
                    }
                } catch (e) {
                    console.warn(`Usando texto padrão para ${item.productName}`);
                }
            }
            for (let i = 0; i < item.quantity; i++) {
                finalCards.push({
                    productName: item.productName,
                    isGift: !!order.isGift,
                    message: pMessage,
                    colorDesc: pColor,
                    giftFrom: order.giftFromName,
                    giftTo: order.giftToName,
                    giftMessage: order.giftMessage
                });
            }
        }
        this.cards.set(finalCards);
        this.isLoading.set(false);
    }

    print() {
        window.print();
    }

    goBack() {
        const orderId = this.order()?.id;
        if (orderId) {
            this.router.navigate(['/admin/encomendas'], {
                queryParams: { openId: orderId }
            });
        } else {
            this.router.navigate(['/admin/encomendas']);
        }
    }
}
