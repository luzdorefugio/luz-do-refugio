import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartDrawerComponent } from '../../components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  templateUrl: './shop-layout.component.html'
})
export class ShopLayoutComponent {
    cart = inject(CartService);
    authService = inject(AuthService);
    isMobileMenuOpen = signal(false);

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    // Fecha o menu quando clica num link
    closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    }
}
