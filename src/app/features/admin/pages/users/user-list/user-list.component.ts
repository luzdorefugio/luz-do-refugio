import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Imports atualizados
import { User } from '../../../../../core/models/user.model';
import { UserService } from '../../../../../core/services/user.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserFormComponent } from '../user-form/user-form.component';

declare var feather: any;

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserFormComponent], // Adicionado UserFormComponent
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit, AfterViewInit {
  private service = inject(UserService); // Agora usa UserService
  private notiService = inject(NotificationService);

  // --- DADOS ---
  users = signal<User[]>([]);
  isLoading = signal(true);

  // --- MODAL ---
  isModalOpen = signal(false);
  selectedUser = signal<User | null>(null);

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    if (typeof feather !== 'undefined') feather.replace();
  }

  loadData() {
    this.isLoading.set(true);
    // Chama o método getAll() do UserService
    this.service.getAll().subscribe({
      next: (data) => {
        const sorted = data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.users.set(sorted);
        this.isLoading.set(false);
        setTimeout(() => feather.replace(), 100);
      },
      error: (err) => {
        this.notiService.apiError(err, 'Erro ao carregar clientes');
        this.isLoading.set(false);
      }
    });
  }

  // --- AÇÕES ---

  openCreate() {
    this.selectedUser.set(null); // Limpa para criação
    this.isModalOpen.set(true);
  }

  openEdit(user: User) {
    this.selectedUser.set(user); // Passa o user para edição
    this.isModalOpen.set(true);
  }

  async onSoftDelete(user: User) {
      if (!user.id) return;
    const confirmed = await this.notiService.confirm(
        `Tem a certeza que deseja desativar o acesso de "${user.name}"?`
    );

    if (confirmed) {
        this.isLoading.set(true);

        // Chama o método delete() do UserService
        this.service.delete(user.id).subscribe({
            next: () => {
                this.notiService.success(`Acesso de ${user.name} revogado.`);
                this.loadData(); // Recarrega a lista
            },
            error: (err) => {
                // Se o backend ainda não estiver pronto, podes comentar o erro e simular sucesso
                this.notiService.apiError(err, 'Erro ao desativar utilizador');
                this.isLoading.set(false);
            }
        });
    }
  }

  // --- MODAL HANDLER ---
  handleModalClose(shouldRefresh: boolean) {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
    if (shouldRefresh) {
        this.loadData();
    }
  }

  // Helpers
  getInitials(name: string): string {
      return name ? name.charAt(0).toUpperCase() : '?';
  }

  formatRole(role: string): string {
      return role === 'ADMIN' ? 'Admin' : 'Cliente';
  }
}
