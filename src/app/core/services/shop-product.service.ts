import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShopProduct } from '../models/shop-product.model';
import { tap } from 'rxjs/operators'; // <--- IMPORTANTE

@Injectable({ providedIn: 'root' })
export class ShopProductService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/shop/products';
    products = signal<ShopProduct[]>([]);

    getProducts() {
        this.http.get<ShopProduct[]>(this.apiUrl).subscribe(data => this.products.set(data));
    }

    getProductById(id: string) {
        return this.http.get<ShopProduct>(`${this.apiUrl}/${id}`);
    }
}
