import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // Importante para esperar pelos produtos
import { OrderService } from '../../../../../core/services/order.service';
import { ProductService } from '../../../../../core/services/product.service';
import { Order } from '../../../../../core/models/order.model';

// Interface para estruturar o cartão individual
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
  standalone: true,
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
    cards = signal<CardToPrint[]>([]); // Lista final de cartões
    isLoading = signal(true);

    // Textos Padrão (Fallback)
    defaultMessage = "Traga a calma da praia para o seu refúgio. Que esta chama lhe dê conforto e envolva o seu cantinho num aroma especial.";
    defaultColorDesc = "O tom azul representa o vasto oceano. O dourado é a areia. E o branco é o céu que liga tudo com o cheiro do mar.";

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.orderService.getOrderById(id).subscribe({
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

        // Iterar sobre cada item da encomenda
        for (const item of order.items) {
            let pMessage = this.defaultMessage;
            let pColor = this.defaultColorDesc;

            // Tentar buscar textos personalizados do Produto
            if (item.productId) {
                try {
                    // Nota: Assume que getProductById retorna um Observable
                    const product = await firstValueFrom(this.productService.getProductById(item.productId));
                    if (product) {
                        pMessage = product.cardMessage || this.defaultMessage;
                        pColor = product.cardColorDesc || this.defaultColorDesc;
                    }
                } catch (e) {
                    console.warn(`Usando texto padrão para ${item.productName}`);
                }
            }

            // Gerar 1 cartão por cada unidade comprada
            for (let i = 0; i < item.quantity; i++) {
                finalCards.push({
                    productName: item.productName, // Para debug no ecrã
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
