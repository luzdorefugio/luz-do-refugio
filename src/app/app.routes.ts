import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // 3. Rota da Loja (ex: /loja/...)
  { path: 'loja', loadChildren: () => import('./features/shop/shop.routes').then(m => m.SHOP_ROUTES) },
  { path: '', redirectTo: 'loja', pathMatch: 'full' },
  { path: '**', redirectTo: 'loja' }
];
