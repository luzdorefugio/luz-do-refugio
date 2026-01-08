import { Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Material } from '../../../../../core/models/material.model';
import { MaterialService } from '../../../../../core/services/material.service';
import { CommonService, EnumResponse } from '../../../../../core/services/common.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-form.component.html'
})
export class MaterialFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private materialService = inject(MaterialService);
    private commonService = inject(CommonService);
    private notiService = inject(NotificationService);

    @Input() material: Material | null = null; // Se vier null, é criação
    @Output() close = new EventEmitter<boolean>(); // Emite true se guardou, false se cancelou
    materialTypes = signal<EnumResponse[]>([]);
    isLoading = false;

    form = this.fb.group({
        name: ['', Validators.required],
        sku: ['', Validators.required],
        quantityOnHand: [0, [Validators.required, Validators.min(0)]],
        unit: ['un', Validators.required],
        type: ['', Validators.required],
        minStockLevel: [5]
    });

    ngOnInit() {
        this.commonService.getMaterialTypes().subscribe({
            next: (types) => this.materialTypes.set(types),
            error: (err) => this.notiService.apiError(err, 'Erro ao carregar tipos dos materiais')
        });
        if (this.material) {
            this.form.patchValue(this.material);
        }
    }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formData = this.form.value as Material;

    if (this.material && this.material.id) {
      this.materialService.update(this.material.id, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.close.emit(true); // Sucesso!
        },
        error: (err) => {
          this.notiService.apiError(err, "Erro ao atualizar material.");
          this.isLoading = false;
        }
      });
    } else {
      this.materialService.create(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.close.emit(true); // Sucesso!
        },
        error: (err) => {
          this.notiService.apiError(err, "Erro ao criar material.");
          this.isLoading = false;
        }
      });
    }
  }

    generateSku() {
        const nameRaw = this.form.get('name')?.value;

        if (!nameRaw) {
          this.notiService.error('Escreve primeiro o nome do material para gerar o SKU.');
          return;
        }

        // 1. Normalizar: Maiúsculas e remover acentos (ex: "Pétalas" -> "PETALAS")
        let cleanName = nameRaw.toUpperCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/[^A-Z0-9 ]/g, ""); // Remove símbolos estranhos

        const words = cleanName.split(' ');
        let prefix = '';

        // 2. Lógica Inteligente baseada nos teus exemplos
        if (words[0].startsWith('CAIX')) {
          // Ex: Caixa 10*10 -> CX10
          prefix = 'CX';
          // Tenta apanhar o primeiro número que aparece a seguir
          const numbers = cleanName.match(/\d+/);
          if (numbers) {
            prefix += numbers[0];
          }
        }
        else if (words[0].startsWith('FITA')) {
          prefix = 'FT'; // Ex: Fita -> FT
        }
        else if (words[0].startsWith('PAVI')) {
          prefix = 'PAV'; // Ex: Pavios -> PAV
          // Se tiver número (ex: Pavios 12), adiciona-o
          const numbers = cleanName.match(/\d+/);
          if (numbers) {
            prefix += numbers[0];
          }
        }
        else {
          // PADRÃO: Pega nas primeiras 4 letras (ex: FRASCOS -> FRAS)
          prefix = cleanName.replace(/\s/g, '').substring(0, 4);
        }

        // 3. Adicionar Sufixo
        // Como estamos no frontend e não sabemos se é o 001 ou 002,
        // geramos um número aleatório de 3 dígitos para garantir unicidade
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        // Resultado Final: PREFIXO-SUFIXO (ex: FRAS-832)
        this.form.patchValue({
          sku: `${prefix}-${randomSuffix}`
        });
      }

  onCancel() {
    this.close.emit(false);
  }
}
