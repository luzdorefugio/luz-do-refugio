import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
    private http = inject(HttpClient);
    private apiShopUrl = `${environment.apiUrl}/shop/contact`;
    private apiAdminUrl = `${environment.apiUrl}/admin/contact`;

    sendMessage(contact: Partial<Contact>): Observable<Contact> {
        return this.http.post<Contact>(this.apiShopUrl, contact);
    }

    getAllMessages(): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.apiAdminUrl);
    }

    markAsRead(id: string | undefined): Observable<void> {
        return this.http.put<void>(`${this.apiAdminUrl}/${id}/read`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiAdminUrl}/${id}`);
    }
}
