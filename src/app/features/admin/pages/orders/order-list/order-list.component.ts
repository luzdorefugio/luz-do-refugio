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
    isModalOpen = false;
    selectedOrder: Order | null = null;

    ngOnInit() {
        this.loadOrders();
        this.route.queryParams.subscribe(params => {
            const idToOpen = params['openId'];
            if (idToOpen && this.orders().length > 0) {
                const orderFound = this.orders().find(o => o.id === idToOpen);
                this.openModal(orderFound);
            }
        });
    }

    loadOrders() {
        this.isLoading.set(true);
        this.orderService.getAllOrders().subscribe({
            next: (data) => {
                this.orders.set(data);
                this.isLoading.set(false);
                const idToOpen = this.route.snapshot.queryParams['openId'];
                if (idToOpen) {
                    const orderFound = this.orders().find(o => o.id === idToOpen);
                    setTimeout(() => {
                        this.openModal(orderFound);
                    }, 0);
                }
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

  openModal(order?: Order) {
    this.selectedOrder = order || null; // Se vier undefined, fica null (modo criar)
    this.isModalOpen = true;
  }

  // 2. Fechar Modal (Chamado pelo (close) do filho)
  handleModalClose() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  // 3. Salvar e Recarregar (Chamado pelo (save) do filho)
  handleModalSave() {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.loadOrders(); // Recarrega a lista para mostrar os dados novos
  }
}
