import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private http = inject(HttpClient);
    private apiAdminUrl = `${environment.apiUrl}/admin/orders`;
    private apiShopUrl = `${environment.apiUrl}/shop/orders`;

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiAdminUrl);
    }

    createOrderAdmin(order: any): Observable<any> {
        return this.http.post(this.apiAdminUrl, order);
    }

    createOrderShop(order: any): Observable<any> {
        return this.http.post(this.apiShopUrl, order);
    }

    updateStatus(id: string, status: string): Observable<Order> {
        return this.http.patch<Order>(`${this.apiAdminUrl}/${id}/status`, { status });
    }

    getOrdersByCustomerEmail(email: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiShopUrl}?customerEmail=${email}`);
    }

    getOrderByIdAdmin(orderId: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiAdminUrl}/${orderId}`);
    }

    getOrderByIdShop(orderId: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiShopUrl}/${orderId}`);
    }

    getPendingCount(): Observable<number> {
        return this.http.get<number>(`${this.apiAdminUrl}/count-pending`);
    }

    getPendingOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiAdminUrl}/pending-list`);
    }

    toggleInvoiceStatus(id: string, currentStatus: boolean): Observable<void> {
        const newStatus = !currentStatus;
        return this.http.patch<void>(`${this.apiAdminUrl}/${id}/invoice-status`,
        {}, { params: { issued: newStatus.toString() } }
      );
    }
}
