import { Component, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CartDrawerComponent } from '../../components/cart-drawer/cart-drawer.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
    selector: 'app-shop-layout',
    imports: [RouterOutlet, CartDrawerComponent, HeaderComponent, FooterComponent],
    templateUrl: './shop-layout.component.html'
})
export class ShopLayoutComponent {
}
