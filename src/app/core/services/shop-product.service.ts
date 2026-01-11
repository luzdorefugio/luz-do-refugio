import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShopProduct } from '../models/shop-product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShopProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/shop/products`;

     getProducts(): Observable<ShopProduct[]> {
        return this.http.get<ShopProduct[]>(this.apiUrl);
    }

    getProductById(id: string) {
        return this.http.get<ShopProduct>(`${this.apiUrl}/${id}`);
    }
}
