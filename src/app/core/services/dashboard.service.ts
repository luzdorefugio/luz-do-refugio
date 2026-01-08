import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard-stats.model';
import { SalesByChannel } from '../models/sales-by-channel.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard/stats`);
    }

    getSalesByChannel(): Observable<SalesByChannel[]> {
        return this.http.get<SalesByChannel[]>(`${this.apiUrl}/admin/dashboard/sales-by-channel`);
    }
}
