import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderStatusPipe } from '../../../../../shared/pipes/order-status.pipe';
import { OrderService } from '../../../../../core/services/order.service';
import { Order } from '../../../../../core/models/order.model';
import { OrderFormComponent } from '../order-form/order-form.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderFormComponent, OrderStatusPipe],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
    private orderService = inject(OrderService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    orders = signal<Order[]>([]);
    isLoading = signal<boolean>(true);

    // Variáveis de Estado do Modal
    isModalOpen = false; // Pode ser booleano normal
    selectedOrder = signal<Order | null>(null); // Signal

    ngOnInit() {
        this.loadOrders();

        // Lógica de Deep Linking (Abrir via URL)
        this.route.queryParams.subscribe(params => {
            const idToOpen = params['openId'];

            if (idToOpen) {
                this.orderService.getOrderById(idToOpen).subscribe({
                    next: (order) => {
                        this.openModal(order); // Reutiliza a função openModal

                        // Limpa URL
                        this.router.navigate([], {
                            relativeTo: this.route,
                            queryParams: { openId: null },
                            queryParamsHandling: 'merge',
                            replaceUrl: true
                        });
                    },
                    error: () => console.warn('Encomenda do link não encontrada.')
                });
            }
        });
    }

    loadOrders() {
        this.isLoading.set(true);
        this.orderService.getAllOrders().subscribe({
            next: (data) => {
                this.orders.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    openModal(order?: Order) {
        // CORREÇÃO: Usar .set()
        this.selectedOrder.set(order || null);
        this.isModalOpen = true;
    }

    handleModalClose() {
        this.isModalOpen = false;
        // CORREÇÃO: Usar .set()
        this.selectedOrder.set(null);
    }

    handleModalSave() {
        this.isModalOpen = false;
        // CORREÇÃO: Usar .set()
        this.selectedOrder.set(null);
        this.loadOrders();
    }
}
