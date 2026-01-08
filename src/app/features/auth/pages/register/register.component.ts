import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

declare var feather: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // O estilo é o global, mas podes ter este ficheiro vazio
})
export class RegisterComponent implements AfterViewInit {

  formData = {
    name: '',
    email: '',
    password: ''
  };

  isLoading = false;
  private authService = inject(AuthService);

  ngAfterViewInit() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  onSubmit() {
    if (!this.formData.email || !this.formData.password) return;

    this.isLoading = true;

    this.authService.registerAdmin(this.formData).subscribe({
      next: () => {
        // O redirecionamento já acontece no Service
        console.log('Admin criado com sucesso!');
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao criar conta. Verifica se o email já existe.');
        this.isLoading = false;
      }
    });
  }
}
