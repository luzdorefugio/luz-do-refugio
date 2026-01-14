import { Component, inject, AfterViewInit, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';

declare var feather: any;

@Component({
    selector: 'app-admin-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styles: []
})
export class HeaderComponent implements AfterViewInit, OnInit, OnDestroy {
    auth = inject(AuthService);
    private orderService = inject(OrderService);
    private intervalId: any;
    pendingCount = signal(0);
    pendingOrdersList = signal<any[]>([]);
     isOpen = signal(false);

    ngOnInit() {
        this.checkNotifications();
        this.intervalId = setInterval(() => {
            this.checkNotifications();
        }, 60000);
    }

    ngAfterViewInit() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    checkNotifications() {
        this.orderService.getPendingCount().subscribe({
            next: (count) => {
                this.pendingCount.set(count);
            },
            error: (err) => console.error('Erro ao verificar contador de encomendas', err)
        });
    }

    toggleDropdown() {
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            this.fetchPendingList();
        }
    }

    fetchPendingList() {
        this.orderService.getPendingOrders().subscribe({
            next: (data) => {
                this.pendingOrdersList.set(data);
            },
            error: (err) => console.error('Erro ao carregar lista de pendentes', err)
        });
    }

    logout() {
        this.auth.logout();
    }
}
