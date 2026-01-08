import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../../../core/services/review.service';
import { Review } from '../../../../../core/models/review.model'; // Garante que tens este model/DTO
import { ReviewFormComponent } from '../review-form/review-form.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule ,ReviewFormComponent],
  templateUrl: './review-list.component.html'
})
export class ReviewListComponent implements OnInit {
  private service = inject(ReviewService);

  // Estados
    reviews = signal<Review[]>([]);
    isLoading = signal<boolean>(true);
    isModalOpen = signal(false);
    selectedReview = signal<Review | null>(null);

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading.set(true);
    this.service.getAllAdmin().subscribe({
      next: (data) => {
        // Ordenar por data (mais recentes primeiro)
        const sorted = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.reviews.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar reviews', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Alterna a visibilidade do comentário na loja.
   * Se ativo -> chama delete() (Soft Delete / Esconder)
   * Se inativo -> chama restore() (Mostrar)
   */
  toggleStatus(review: Review, event: Event) {
    event.stopPropagation();

    const newStatus = !review.active;

    // 1. Atualização Otimista (Muda logo na UI para parecer instantâneo)
    this.reviews.update(list =>
      list.map(r => r.id === review.id ? { ...r, active: newStatus } : r)
    );

    // 2. Chama o Backend
    const action$ = newStatus
      ? this.service.restore(review.id)
      : this.service.delete(review.id);

    action$.subscribe({
      error: () => {
        // Reverte se der erro
        this.reviews.update(list =>
          list.map(r => r.id === review.id ? { ...r, active: !newStatus } : r)
        );
        alert('Erro ao alterar estado da review.');
      }
    });
  }
openCreate() {
    this.selectedReview.set(null); // Null significa "Criar Novo"
    this.isModalOpen.set(true);
  }

  openEdit(review: Review) {
    this.selectedReview.set(review); // Passar dados significa "Editar"
    this.isModalOpen.set(true);
  }

  handleModalClose(refresh: boolean) {
    this.isModalOpen.set(false);
    this.selectedReview.set(null);
    if (refresh) {
      this.loadReviews();
    }
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
