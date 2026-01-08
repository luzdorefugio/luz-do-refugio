import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-shop-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './shop-login.component.html'
})
export class ShopLoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private notify = inject(NotificationService);
    private router = inject(Router);

    isLoginMode = signal(true); // true = Login, false = Registar
    isLoading = signal(false);

    // Formulários
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    registerForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
    });

    toggleMode() {
        this.isLoginMode.update(v => !v);
    }

    onSubmit() {
        if (this.isLoginMode()) {
            this.handleLogin();
        } else {
            this.handleRegister();
        }
    }

  private handleLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notify.success('Bem-vindo de volta!');
        this.router.navigate(['/loja']); // Redireciona para a loja
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notify.error('Email ou password incorretos.');
      }
    });
  }

    private handleRegister() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }
    const { name, email, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.notify.error('As passwords não coincidem.');
      return;
    }

    this.isLoading.set(true);

    // O payload depende do que o teu Backend espera no registo
    const payload = { name, email, password, role: 'CUSTOMER' };

    this.authService.registerCustomer(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notify.success('Conta criada com sucesso! Faça login.');
        this.toggleMode(); // Muda para o ecrã de login
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notify.apiError(err, 'Erro ao criar conta');
      }
    });
  }
}
