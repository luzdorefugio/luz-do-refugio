import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

declare var feather: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styles: []
})
export class ContactComponent implements AfterViewInit {

  private fb = inject(FormBuilder);
  isLoading = false;
  successMessage = false;

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required]
  });

  ngAfterViewInit() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Simulação de envio para o backend
    console.log('Dados do contacto:', this.contactForm.value);

    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = true;
      this.contactForm.reset();

      // Esconder mensagem de sucesso após 5 segundos
      setTimeout(() => this.successMessage = false, 5000);
    }, 1500);
  }

  // Helper para validação no HTML
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }
}
