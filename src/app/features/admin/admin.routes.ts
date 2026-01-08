import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MaterialListComponent } from './pages/materials/material-list/material-list.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';
import { StockMovementListComponent } from './pages/stock/stock-movement-list/stock-movement-list.component';
import { PromotionsListComponent } from './pages/promotions/promotion-list/promotion-list.component';
import { ShippingListComponent } from './pages/shipping/shipping-list/shipping-list.component';
import { ReviewListComponent } from './pages/reviews/review-list/review-list.component';
import { FinancialListComponent } from './pages/financial/financial-list/financial-list.component';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'materiais', component: MaterialListComponent },
      { path: 'produtos', component: ProductListComponent },
      { path: 'encomendas', component: OrderListComponent },
      { path: 'stock-movements', component: StockMovementListComponent },
      { path: 'promocoes', component: PromotionsListComponent },
      { path: 'envios', component: ShippingListComponent },
      { path: 'reviews', component: ReviewListComponent },
      { path: 'finance', component: FinancialListComponent }
    ]
  }
];
