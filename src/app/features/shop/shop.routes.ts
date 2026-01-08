import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './components/shop-layout/shop-layout.component';
import { ShopLoginComponent } from './components/shop-login/shop-login.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShopAccountComponent } from './components/shop-account/shop-account.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { ShopSuccessComponent } from './components/shop-success/shop-success.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ShippingComponent } from './components/shipping/shipping.component';
import { TermsComponent } from './components/terms/terms.component';
import { authGuard } from '../../core/guards/auth.guard';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: 'login', component: ShopLoginComponent },
      { path: 'sobre', component: AboutComponent },
      { path: 'contactos', component: ContactComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'sucesso', component: ShopSuccessComponent },
      { path: 'produto/:id', component: ProductDetailComponent },
      { path: 'envios-devolucoes', component: ShippingComponent },
      { path: 'termos-condicoes', component: TermsComponent },
      { path: 'minha-conta', component: ShopAccountComponent, canActivate: [authGuard] }
    ]
  }
];
