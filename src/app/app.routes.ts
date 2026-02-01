import { Routes } from '@angular/router';
import { maintenanceGuard } from './core/guards/maintenance.guard';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';

export const routes: Routes = [
    { path: 'brevemente', component: MaintenanceComponent },
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'loja',
        loadChildren: () => import('./features/shop/shop.routes').then(m => m.SHOP_ROUTES)
    },
    {
        path: 'blog',
        loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES)
    },
    { path: '', redirectTo: 'loja', pathMatch: 'full' },
    { path: '**', redirectTo: 'loja' }
];
