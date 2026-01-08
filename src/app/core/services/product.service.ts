import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // --- SHOP (Público) ---
    getActiveProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/shop/products`);
    }

    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/shop/products/${id}`);
    }

    // --- ADMIN (Gestão) ---

    // Este deve retornar TODOS (ativos e inativos) para o admin ver o histórico
    getAllProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/admin/products`);
    }

    create(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/admin/products`, product);
    }

    update(id: string, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}`, product);
    }

    // Soft Delete (Desativar)
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/admin/products/${id}`);
    }

    // --- NOVOS MÉTODOS ---

    // Restaurar (Reativar produto inativo)
    restore(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/admin/products/${id}/restore`, {});
    }

    // Produção (Deduz stock de materiais e aumenta stock do produto)
    produce(id: string, quantity: number): Observable<void> {
        // Nota: O backend espera query param ?quantity=X
        return this.http.post<void>(`${this.apiUrl}/admin/products/${id}/produce`, null, {
            params: { quantity: quantity.toString() }
        });
    }
}
