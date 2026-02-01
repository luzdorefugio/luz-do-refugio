import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../../../core/services/contact.service';
import { Contact } from '../../../../../core/models/contact.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
    selector: 'app-contact-list',
    standalone: true,
    imports: [CommonModule, ContactFormComponent],
    templateUrl: './contact-list.component.html'
})
export class ContactListComponent implements OnInit {
    private service = inject(ContactService);
    private notiService = inject(NotificationService);
    contacts = signal<Contact[]>([]);
    isLoading = signal(true);
    showRead = signal(false);
    selectedMessage = signal<Contact | null>(null);
    isModalOpen = signal(false);

    visibleContacts = computed(() => {
        const all = this.contacts();
        if (this.showRead()) {
            return all;
        }
        return all.filter(c => !c.read);
    });

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);
        this.service.getAllMessages().subscribe({
            next: (data) => {
                this.contacts.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.notiService.apiError(err, "Erro ao carregar mensagens.");
                this.isLoading.set(false);
            }
        });
    }

    toggleShowRead() {
        this.showRead.update(val => !val);
    }

    toggleReadStatus(contact: Contact) {
        if (!contact.id) return;
        this.service.markAsRead(contact.id).subscribe({
            next: () => {
                this.contacts.update(list => list.map(c =>
                    c.id === contact.id ? { ...c, isRead: true } : c
                ));
                this.notiService.success('Mensagem marcada como lida.');
            },
            error: (err) => this.notiService.apiError(err, 'Erro ao atualizar estado.')
        });
    }

    openMessage(contact: Contact) {
        this.selectedMessage.set(contact);
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedMessage.set(null);
    }

    async deleteContact(id: string) {
        if (await this.notiService.confirm('Tem a certeza que quer apagar esta mensagem?')) {
            this.service.delete(id).subscribe({
                next: () => {
                    this.contacts.update(list => list.filter(c => c.id !== id));
                    this.notiService.success('Mensagem apagada.');
                },
                error: (err) => this.notiService.apiError(err, 'Erro ao apagar.')
            });
        }
    }
}
