import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; // Importar o serviço novo

declare var feather: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {

  credentials = { email: '', password: '' };
  isLoading = false; // Para mostrar um spinner se quiseres
  errorMessage = '';

  private authService = inject(AuthService); // Injetar o serviço
  private router = inject(Router);

  ngAfterViewInit() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  login() {
    this.isLoading = true;
    this.errorMessage = '';

    // Chama o serviço real
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Sucesso! Vai para o Dashboard
        console.log('Login com sucesso! Bem-vindo à fábrica.');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        // Erro (Password errada ou servidor em baixo)
        console.error('Erro de login', err);
        this.errorMessage = 'Email ou password incorretos.';
        this.isLoading = false;
      }
    });
  }
}
