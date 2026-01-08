import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // --- ESTADO ---
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);

  // Controlo da Modal
  isModalOpen = false;
  selectedOrder: Order | null = null; // null = Criar, Order = Editar

  private orderService = inject(OrderService);

  ngOnInit() {
    this.loadOrders();
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

  // --- AÇÕES DA MODAL ---

  // 1. Abrir Modal (Criar ou Editar)
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
