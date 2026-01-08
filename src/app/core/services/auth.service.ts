import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Ajusta conforme a tua API. Geralmente é /auth/login, /auth/register, etc.
  private apiUrl = 'http://localhost:8080/api/auth';

  currentUser = signal<User | null>(this.getUserFromStorage());

  // ============================================================
  // 1. LOGIN (Universal - Serve para Admin e Cliente)
  // ============================================================
  login(credentials: { email: string, password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => this.processAuthResponse(response, credentials.email)),
      tap(data => this.handlePostLoginRedirect(data.user))
    );
  }

  // ============================================================
  // 2. REGISTO DE CLIENTE (Loja)
  // ============================================================
  registerCustomer(userData: { name: string, email: string, password: string }) {
    // Adiciona role: 'CUSTOMER' explicitamente se o backend precisar,
    // ou envia para um endpoint específico de clientes
    const payload = { ...userData, role: 'CUSTOMER' };

    return this.http.post<any>(`${this.apiUrl}/shop/register`, payload).pipe(
      map(response => this.processAuthResponse(response, userData.email, 'CUSTOMER')),
      tap(data => {
        // Redireciona EXPLICITAMENTE para a loja após criar conta
        this.saveSession(data);
        this.router.navigate(['/loja']);
      })
    );
  }

  // ============================================================
  // 3. REGISTO DE ADMIN (Backoffice)
  // ============================================================
  registerAdmin(userData: { name: string, email: string, password: string }) {
    const payload = { ...userData, role: 'ADMIN' };

    return this.http.post<any>(`${this.apiUrl}/admin/register`, payload).pipe( // ou /admin/register se tiveres rota separada
      map(response => this.processAuthResponse(response, userData.email, 'ADMIN')),
      tap(data => {
        // Redireciona EXPLICITAMENTE para o dashboard
        this.saveSession(data);
        this.router.navigate(['/admin/dashboard']);
      })
    );
  }

updateProfile(userData: Partial<User>): Observable<User> {
  // Assume que tens um endpoint PUT /users/profile no backend
  return this.http.put<any>(`${this.apiUrl}/profile`, userData).pipe(
    map(updatedData => new User(updatedData)), // Converte JSON para User
    tap(user => {
      // 1. Atualizar LocalStorage
      // Precisamos de manter o token antigo e só atualizar o user
      const currentUser = this.currentUser();
      if (currentUser) {
        // Atualiza os dados locais
        Object.assign(currentUser, user);
        localStorage.setItem('luzdorefugio_user', JSON.stringify(currentUser));

        // 2. Atualizar o Signal
        this.currentUser.set(new User(currentUser));
      }
    })
  );
}

  // Processa a resposta do backend e cria o objeto User
  private processAuthResponse(response: any, emailInput: string, forcedRole?: string) {
    // 1. Guardar Token
    localStorage.setItem('luzdorefugio_token', response.token);

    // 2. Criar Objeto User
    // Usamos a role que vem do backend, ou a forçada (no caso do registo)
    const role = forcedRole || response.role || 'CUSTOMER';

    const user = new User({
      name: response.name || 'Utilizador', // Garante que não falha se vier vazio
      role: role,
      email: emailInput,
      phone: response.phone,
      nif: response.nif,
      address: response.address,
      city: response.city,
      zipCode: response.zipCode,
    });

    return { token: response.token, user: user };
  }

  // Guarda na sessão e atualiza o Signal
  private saveSession(data: { token: string, user: User }) {
    localStorage.setItem('luzdorefugio_user', JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  // Decide para onde ir após LOGIN
  private handlePostLoginRedirect(user: User) {
    this.saveSession({ token: this.getToken() || '', user });

    if (user.isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/loja']);
    }
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('luzdorefugio_user');
    if (userStr) {
      try {
        return new User(JSON.parse(userStr));
      } catch (e) {
        // Se o JSON estiver corrompido, limpa tudo
        this.logout();
        return null;
      }
    }
    return null;
  }

  logout() {
    localStorage.removeItem('luzdorefugio_token');
    localStorage.removeItem('luzdorefugio_user');
    this.currentUser.set(null);
    this.router.navigate(['/loja/login']); // Redireciona para o login da loja por defeito
  }

  getToken() {
    return localStorage.getItem('luzdorefugio_token');
  }
}
