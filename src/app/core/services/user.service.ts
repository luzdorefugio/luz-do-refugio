import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private apiAdminUrl = `${environment.apiUrl}/admin/users`;

    // Obter todos os utilizadores (para a tabela)
    getAll(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiAdminUrl}`);
    }

    // Obter um específico (útil se clicares para ver detalhes ou editar)
    getById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiAdminUrl}/${id}`);
    }

    // Criar novo utilizador (via Admin)
    create(userData: any): Observable<User> {
        return this.http.post<User>(`${this.apiAdminUrl}`, userData);
    }

    // Atualizar dados (Nome, Email, Role)
    update(id: string, userData: any): Observable<User> {
        return this.http.put<User>(`${this.apiAdminUrl}/${id}`, userData);
    }

    // Soft Delete (Desativar acesso)
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiAdminUrl}/${id}`);
    }

    // Reativar utilizador (caso tenhas soft delete)
    reactivate(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiAdminUrl}/${id}/reactivate`, {});
    }

    // --- EXTRAS ÚTEIS ---

    // Alterar Password (Admin força alteração)
    resetPassword(id: string, newPass: string): Observable<void> {
        return this.http.post<void>(`${this.apiAdminUrl}/${id}/reset-password`, { password: newPass });
    }

    getCount(): Observable<number> {
        return this.http.get<number>(`${this.apiAdminUrl}/count`);
    }
}
