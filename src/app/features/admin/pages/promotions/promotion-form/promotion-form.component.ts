import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PromotionService } from '../../../../../core/services/promotion.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Promotion } from '../../../../../core/models/promotion.model';

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-form.component.html'
})
export class PromotionFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private promotionService = inject(PromotionService);
  private notify = inject(NotificationService);

  @Output() close = new EventEmitter<boolean>(); // true = refresh list, false = just close

  form!: FormGroup;
  isEditMode = false;
  promotionId: string | null = null;
  isLoading = false;

  // Input Setter: Preenche o formulário quando o modal abre
  @Input() set promotionData(val: Promotion | null) {
    if (this.form) { // Garante que o form já existe
      this.patchForm(val);
    } else {
      // Se o form ainda não existir (ngOnInit não correu), guarda para depois
      this._pendingData = val;
    }
  }
  private _pendingData: Promotion | null = null;

  ngOnInit() {
    this.initForm();
    if (this._pendingData !== undefined) {
      this.patchForm(this._pendingData);
    }
  }

  private initForm() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[A-Z0-9_-]+$')]],
      description: [''],
      discountType: ['PERCENTAGE', Validators.required],
      discountValue: [0, [Validators.required, Validators.min(0)]],
      specialCondition: ['NONE'],
      minOrderAmount: [null],
      usageLimit: [null],
      startDate: [null],
      endDate: [null],
      active: [true]
    });
  }

  private patchForm(val: Promotion | null) {
    if (val) {
      this.isEditMode = true;
      this.promotionId = val.id;

      const formatted = {
        ...val,
        startDate: this.formatDateForInput(val.startDate),
        endDate: this.formatDateForInput(val.endDate)
      };

      this.form.patchValue(formatted);
      this.form.get('code')?.disable(); // Não permitir mudar código na edição
    } else {
      this.isEditMode = false;
      this.promotionId = null;
      this.form.reset({
        discountType: 'PERCENTAGE',
        specialCondition: 'NONE',
        active: true,
        discountValue: 0
      });
      this.form.get('code')?.enable();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.form.getRawValue();

    // Limpar campos opcionais vazios
    if (!formData.minOrderAmount) formData.minOrderAmount = null;
    if (!formData.usageLimit) formData.usageLimit = null;

    const request$ = this.isEditMode
      ? this.promotionService.update(this.promotionId!, formData)
      : this.promotionService.create(formData);

    request$.subscribe({
      next: () => {
        this.notify.success(this.isEditMode ? 'Promoção atualizada!' : 'Promoção criada!');
        this.close.emit(true); // Fecha e Refresh
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.apiError(err, 'Erro ao gravar');
      }
    });
  }

  onCancel() {
    this.close.emit(false); // Só fecha
  }

  // Helper para datetime-local (yyyy-MM-ddThh:mm)
  private formatDateForInput(dateStr?: string): string | null {
    if (!dateStr) return null;
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  get isFreeShipping(): boolean {
    return this.form.get('discountType')?.value === 'FREE_SHIPPING';
  }
}
