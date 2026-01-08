import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockMovement } from '../models/stock-movement.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StockMovementService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;


    getMovements(): Observable<StockMovement[]> {
        return this.http.get<StockMovement[]>(`${this.apiUrl}/stock/movements`);
    }
}
