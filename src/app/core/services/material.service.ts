import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';
import { environment } from '../../../environments/environment';

// Interface para tipar os dados que vêm do formulário de compra
export interface MaterialPurchaseRequest {
  quantity: number;
  totalCost: number;
  supplierNote?: string;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  // Garante que o URL bate certo com o teu Controller Java
  private apiUrl = `${environment.apiUrl}/materials`;

  // --- CRUD BÁSICO ---

  getAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  create(material: Material): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  update(id: string, material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  // Soft Delete (Desativar)
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  purchaseMaterial(id: string, data: Material): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/purchase`, data);
  }

  restore(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/restore`, {});
  }
}
