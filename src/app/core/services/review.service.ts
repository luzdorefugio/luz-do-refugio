import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model'; // Garante que o nome do model está certo

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
    private http = inject(HttpClient);

    // Endpoints base (assumindo que environment.apiUrl é algo como 'http://localhost:8080/api')
    private apiAdminUrl = `${environment.apiUrl}/admin/reviews`;
    private apiShopUrl = `${environment.apiUrl}/shop/reviews`;

    // ==========================================
    // SHOP (Público)
    // ==========================================

    /** Busca apenas as reviews ativas para mostrar no site */
    getAllShop(): Observable<Review[]> {
        return this.http.get<Review[]>(this.apiShopUrl);
    }

    /** Cria uma nova review (usado pelo cliente no site) */
    createPublic(review: Partial<Review>): Observable<Review> {
        return this.http.post<Review>(this.apiShopUrl, review);
    }

    // ==========================================
    // ADMIN (Backoffice)
    // ==========================================

    /** Busca TODAS as reviews (ativas e inativas) para gestão */
    getAllAdmin(): Observable<Review[]> {
        return this.http.get<Review[]>(this.apiAdminUrl);
    }

    /** Atualiza o texto ou rating de uma review existente */
    update(id: string, review: Partial<Review>): Observable<Review> {
        return this.http.put<Review>(`${this.apiAdminUrl}/${id}`, review);
    }

    /** "Apaga" (Soft Delete) - esconde da loja */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiAdminUrl}/${id}`);
    }

    /** Restaura uma review escondida - volta a mostrar na loja */
    restore(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiAdminUrl}/${id}/restore`, {});
    }
}
