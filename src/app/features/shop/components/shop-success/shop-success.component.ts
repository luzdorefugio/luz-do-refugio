import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';

@Component({
    selector: 'app-shop-success',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './shop-success.component.html'
})
export class ShopSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('id');
    if (orderId) {
      this.orderService.getOrderById(orderId).subscribe({
        next: (data) => {
          this.order.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }
}
