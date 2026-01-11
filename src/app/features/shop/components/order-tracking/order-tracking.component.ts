import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.component.html'
})
export class OrderTrackingComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private orderService = inject(OrderService);
    isLoading = signal(true);
    errorMessage = signal('');
    order = signal<Order | null>(null);

    ngOnInit(): void {
        const orderId = this.route.snapshot.paramMap.get('id');
        if (!orderId) {
            this.handleError('Link inválido. Verifica se copiaste o endereço corretamente.');
            return;
        }
        this.fetchOrder(orderId);
    }

  private fetchOrder(id: string): void {
    // Nota: O teu OrderService precisa de ter este método 'getPublicOrder(id)'
    this.orderService.getOrderByIdSimple(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar encomenda:', err);
        // Personaliza a mensagem se for 404
        if (err.status === 404) {
          this.handleError('Não encontrámos nenhuma encomenda com esse número.');
        } else {
          this.handleError('Ocorreu um erro técnico. Tenta novamente mais tarde.');
        }
      }
    });
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
  }

  // ==========================================
  // 🎨 LÓGICA DA BARRA DE PROGRESSO (HTML)
  // ==========================================
  getStatusStep(status: string): number {
    switch (status) {
      case 'PENDING': return 1;   // Recebido (1)
      case 'PAID': return 2;      // Pago (2)
      case 'SHIPPED': return 3;   // Enviado (3)
      case 'DELIVERED': return 4; // Entregue (4)
      case 'CANCELED': return 0;  // Cancelado
      default: return 1;
    }
  }
}
