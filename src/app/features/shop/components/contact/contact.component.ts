import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';
import { Contact } from '../../../../core/models/contact.model';

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
    // CORREÇÃO 1: O nome da variável deve bater com o uso em baixo
    private contactService = inject(ContactService);

    isLoading = false;
    successMessage = false;
    errorMessage = false;

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
        this.errorMessage = false;

        // CORREÇÃO 2: Criar o payload tipado
        // Usamos os valores do form. O 'as string' garante que não enviamos null/undefined
        // Nota: Não enviamos ID nem Data, isso o backend cria.
        const payload = {
            name: this.contactForm.get('name')?.value as string,
            email: this.contactForm.get('email')?.value as string,
            message: this.contactForm.get('message')?.value as string,
            isRead: false
        };

        // O serviço espera {name, email, message}
        this.contactService.sendMessage(payload).subscribe({
            next: (response: Contact) => { // CORREÇÃO 3: O backend devolve o Contact completo (com ID)
                this.isLoading = false;
                this.successMessage = true;
                this.contactForm.reset();
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
                this.errorMessage = true;
            }
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.contactForm.get(fieldName);
        return !!(field?.invalid && (field?.touched || field?.dirty));
    }
}
