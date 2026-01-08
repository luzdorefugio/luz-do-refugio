import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../../../../../core/services/promotion.service';
import { Promotion } from '../../../../../core/models/promotion.model';
import { PromotionFormComponent } from '../promotion-form/promotion-form.component';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, PromotionFormComponent],
  templateUrl: './promotion-list.component.html'
})
export class PromotionsListComponent implements OnInit {
  private service = inject(PromotionService);
  private notiService = inject(NotificationService);

  // --- ESTADO DOS DADOS ---
  promotions = signal<Promotion[]>([]);
  isLoading = signal(true);

  // --- ESTADO DO MODAL ---
  isModalOpen = signal(false);
  selectedPromotion = signal<Promotion | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        // Ordena: Ativos primeiro, depois por código A-Z
        const sorted = data.sort((a, b) => {
            if (a.active === b.active) {
                return a.code.localeCompare(b.code);
            }
            return a.active ? -1 : 1;
        });
        this.promotions.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notiService.apiError(err, 'Erro ao carregar promoções');
        this.isLoading.set(false);
      }
    });
  }

  // --- AÇÕES DO UTILIZADOR ---

  openCreate() {
    this.selectedPromotion.set(null); // Modo Criação
    this.isModalOpen.set(true);
  }

  openEdit(promo: Promotion) {
    this.selectedPromotion.set(promo); // Modo Edição
    this.isModalOpen.set(true);
  }

  async deletePromotion(id: string) {
    const confirmed = await this.notiService.confirm(
        'Tens a certeza? O histórico manterá o registo, mas o código deixará de funcionar imediatamente.'
    );

    if (confirmed) {
        this.isLoading.set(true);
        this.service.delete(id).subscribe({
            next: () => {
                this.loadData();
                this.notiService.success('Promoção eliminada.');
            },
            error: (err) => {
                this.notiService.apiError(err, 'Erro ao eliminar');
                this.isLoading.set(false);
            }
        });
    }
  }

  toggleStatus(promo: Promotion, event: Event) {
    event.stopPropagation();
    const newState = !promo.active;

    // Atualização Otimista (Muda logo na UI)
    this.promotions.update(list => list.map(p =>
        p.id === promo.id ? { ...p, active: newState } : p
    ));

    this.service.toggleStatus(promo.id, newState).subscribe({
        next: () => this.notiService.success(`Promoção ${newState ? 'ativada' : 'desativada'}!`),
        error: (err) => {
            // Reverte se falhar
            this.promotions.update(list => list.map(p =>
                p.id === promo.id ? { ...p, active: !newState } : p
            ));
            this.notiService.apiError(err, 'Erro ao alterar estado');
        }
    });
  }

  copyCode(code: string, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(code);
    this.notiService.success('Código copiado!');
  }

  // Helper para verificar validade visualmente
  isExpired(promo: Promotion): boolean {
    if (!promo.endDate) return false;
    return new Date(promo.endDate) < new Date();
  }

  // --- HANDLER DO MODAL ---

  handleModalClose(shouldRefresh: boolean) {
    this.isModalOpen.set(false);
    this.selectedPromotion.set(null);
    if (shouldRefresh) {
        this.loadData();
    }
  }
}
