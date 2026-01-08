import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';
import { environment } from '../../../environments/environment';

export interface EnumResponse {
  key: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/enums`;

    getMaterialTypes(): Observable<EnumResponse[]> {
        return this.http.get<EnumResponse[]>(`${this.apiUrl}/materials-type`);
    }

    getOrderStatus(): Observable<EnumResponse[]> {
        return this.http.get<EnumResponse[]>(`${this.apiUrl}/order-status`);
    }
}
