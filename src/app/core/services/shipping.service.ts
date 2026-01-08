import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShippingMethod } from '../models/shipping.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
    private http = inject(HttpClient);
    private apiAdminUrl = `${environment.apiUrl}/admin/shipping`;
    private apiShopUrl = `${environment.apiUrl}/shop/shipping`;

    getActiveMethods(): Observable<ShippingMethod[]> {
        return this.http.get<ShippingMethod[]>(this.apiShopUrl);
    }

    getAllAdmin() {
        return this.http.get<ShippingMethod[]>(this.apiAdminUrl);
    }

    create(method: Partial<ShippingMethod>): Observable<ShippingMethod> {
        return this.http.post<ShippingMethod>(this.apiAdminUrl, method);
    }

    update(id: string, method: Partial<ShippingMethod>): Observable<ShippingMethod> {
        return this.http.put<ShippingMethod>(`${this.apiAdminUrl}/${id}`, method);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiAdminUrl}/${id}`);
    }
}
