import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../../core/models/contact.model';
import { ContactService } from '../../../../../core/services/contact.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-contact-form', // Nome do seletor
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-form.component.html'
})
export class ContactFormComponent {
    private service = inject(ContactService);
    private notiService = inject(NotificationService);
    @Input({ required: true }) contact!: Contact; // Recebe o contacto selecionado
    @Output() close = new EventEmitter<boolean>(); // Emite true se houve alteração, false se só fechou
    isLoading = signal(false);

    toggleReadStatus() {
        this.isLoading.set(true);
        if (this.contact.read) {
            this.isLoading.set(false);
            return;
        }

        this.service.markAsRead(this.contact.id).subscribe({
            next: () => {
                this.contact.read = true;
                this.isLoading.set(false);
                this.notiService.success('Marcada como lida!');
            },
            error: (err) => {
                this.notiService.apiError(err, 'Erro ao atualizar estado');
                this.isLoading.set(false);
            }
        });
    }

    onClose() {
        this.close.emit(this.contact.read);
    }
}
