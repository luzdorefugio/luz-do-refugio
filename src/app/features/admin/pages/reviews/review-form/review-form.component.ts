import { Component, Input, Output, EventEmitter, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../../../core/services/review.service';
import { Review } from '../../../../../core/models/review.model';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-form.component.html'
})
export class ReviewFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ReviewService);

  // Inputs e Outputs
    reviewData = input<Review | null>(null);
    @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  isLoading = false;

  ngOnInit() {
    this.initForm();

    // Preencher formulário se vier dados
    const data = this.reviewData();
    if (data) {
      this.form.patchValue({
        authorName: data.authorName,
        content: data.content,
        rating: data.rating,
        active: data.active
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      authorName: ['', Validators.required],
      content: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      active: [true]
    });
  }

  // Getter fácil para o HTML usar as estrelas
  get currentRating(): number {
    return this.form.get('rating')?.value || 0;
  }

  setRating(stars: number) {
    this.form.get('rating')?.setValue(stars);
    this.form.markAsDirty();
  }

  onSubmit() {
      if (this.form.invalid) return;

      this.isLoading = true;
      const id = this.reviewData()?.id;
      const formData = this.form.value;

      if (id) {
          // --- MODO EDITAR ---
          this.service.update(id, formData).subscribe({
              next: () => {
                  this.isLoading = false;
                  this.close.emit(true);
              },
              error: () => {
                  this.isLoading = false;
                  alert('Erro ao editar.');
              }
          });
      } else {
          // --- MODO CRIAR (NOVO) ---
          // Estamos a usar o createPublic, mas como somos admins,
          // a review vai aparecer logo na lista (podes aprovar logo no form)
          this.service.createPublic(formData).subscribe({
              next: () => {
                  this.isLoading = false;
                  this.close.emit(true);
              },
              error: () => {
                  this.isLoading = false;
                  alert('Erro ao criar review.');
              }
          });
      }
  }

  onCancel() {
    this.close.emit(false); // Fecha sem atualizar
  }
}
