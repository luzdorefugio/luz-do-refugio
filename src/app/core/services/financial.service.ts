import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Financial } from '../models/financial.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private apiUrl = `${environment.apiUrl}/admin/financial`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Financial[]> {
    return this.http.get<Financial[]>(this.apiUrl);
  }
}
