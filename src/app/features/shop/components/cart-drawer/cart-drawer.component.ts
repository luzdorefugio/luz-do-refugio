import { Component, inject, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

declare var feather: any;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-drawer.component.html',
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class CartDrawerComponent implements AfterViewChecked {
  cartService = inject(CartService);

  ngAfterViewChecked() {
    if (typeof feather !== 'undefined') feather.replace();
  }
}
