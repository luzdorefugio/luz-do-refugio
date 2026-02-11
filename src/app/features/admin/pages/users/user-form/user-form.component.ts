import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../../core/models/user.model';
import { UserService } from '../../../../../core/services/user.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UserService); // Agora usa o UserService
  private notiService = inject(NotificationService);

  @Output() close = new EventEmitter<boolean>(); // true = refresh list, false = just close

  form!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isLoading = false;

  // Input Setter: Garante que os dados são carregados mesmo se o form não estiver pronto
  @Input() set userData(val: User | null) {
    if (this.form) {
      this.patchForm(val);
    } else {
      this._pendingData = val;
    }
  }
  private _pendingData: User | null = null;

  ngOnInit() {
    this.initForm();
    if (this._pendingData !== undefined) {
      this.patchForm(this._pendingData);
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', Validators.required],
      // Password: Opcional na edição, obrigatória na criação (ver onSubmit)
      password: [''],
    });
  }

  private patchForm(val: User | null) {
    if (val) {
      this.isEditMode = true;
      this.userId = val.id || null;

      this.form.patchValue({
        name: val.name,
        email: val.email,
        role: val.role,
        password: '' // Limpa a password visualmente
      });

      // Opcional: Bloquear email na edição se não permitires mudar
      // this.form.get('email')?.disable();
    } else {
      this.isEditMode = false;
      this.userId = null;
      this.form.reset({
        role: 'ROLE_USER'
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.form.getRawValue();

    // 1. Validação da Password na CRIAÇÃO
    if (!this.isEditMode && !formData.password) {
        this.notiService.error('A password é obrigatória para novos utilizadores.');
        this.isLoading = false;
        return;
    }

    // 2. Limpeza na EDIÇÃO
    // Se a password vier vazia na edição, removemos do objeto para o backend não a tentar alterar para ""
    if (this.isEditMode && !formData.password) {
        delete formData.password;
    }

    // 3. Chamada ao Serviço
    const request$ = this.isEditMode
      ? this.service.update(this.userId!, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.notiService.success(this.isEditMode ? 'Utilizador atualizado!' : 'Utilizador criado!');
        this.close.emit(true); // Fecha e pede refresh à lista
      },
      error: (err) => {
        this.isLoading = false;
        this.notiService.apiError(err, 'Erro ao gravar dados');
      }
    });
  }

  onCancel() {
    this.close.emit(false);
  }
}
