import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion } from '../models/promotion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private http = inject(HttpClient);
  private apiAdminUrl = `${environment.apiUrl}/admin/promotions`;
  private apiShopUrl = `${environment.apiUrl}/shop/promotions`;

  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiAdminUrl);
  }

  getById(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiAdminUrl}/${id}`);
  }

  create(promotion: Partial<Promotion>): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiAdminUrl, promotion);
  }

  update(id: string, promotion: Partial<Promotion>): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiAdminUrl}/${id}`, promotion);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiAdminUrl}/${id}`);
  }

  toggleStatus(id: string, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiAdminUrl}/${id}/status`, { active });
  }

    validateCoupon(code: string): Observable<Promotion> {
        return this.http.get<Promotion>(`${this.apiShopUrl}/validate/${code}`);
    }
}
