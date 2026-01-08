import { Component, EventEmitter, Input, Output, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductRecipe } from '../../../../../core/models/product.model';
import { ProductService } from '../../../../../core/services/product.service';
import { MaterialService } from '../../../../../core/services/material.service';
import { Material } from '../../../../../core/models/material.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {

  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private materialService = inject(MaterialService);
  private notiService = inject(NotificationService);

  // --- ESTADO ---
  activeTab = signal<'details' | 'recipe' | 'scent'>('details');
  materials = signal<Material[]>([]);
  recipeItems = signal<ProductRecipe[]>([]);
  isLoading = false;

  // Cálculo do Custo Total
  totalCost = computed(() => {
    return this.recipeItems().reduce((acc, item) => {
      const cost = (item.costPerUnit || 0) * item.quantity;
      return acc + cost;
    }, 0);
  });

  // --- FORM PRINCIPAL ---
  form = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    estimatedCost: [0, [Validators.required, Validators.min(0)]],
    maxProduction: [0],
    burnTime: [''],
    intensity: [3],
    scentTop: [''],
    scentHeart: [''],
    scentBase: [''],
    activeShop: [false]
  });

  // --- FORM RECEITA ---
  recipeForm = this.fb.group({
    materialId: ['' as string | null, Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.001)]]
  });

  ngOnInit() {
    // 1. Carregar Materiais
    this.materialService.getAll().subscribe(data => this.materials.set(data));

    // 2. Preencher se for Edição
    if (this.product) {
      this.form.patchValue(this.product);
      if (this.product.recipeItems) {
        this.recipeItems.set(this.product.recipeItems);
      }
    }
  }

  // --- LOGICA RECEITA ---

  addMaterialToRecipe() {
    const { materialId, quantity } = this.recipeForm.value;
    if (!materialId || !quantity) return;

    // Procura o material (converte ID para string para garantir comparação)
    const selectedMat = this.materials().find(m => String(m.id) === String(materialId));
    if (!selectedMat) return;

    // Assumimos que o material tem 'price' ou usamos 0
    // Nota: Confirma se o teu modelo Material tem 'price'
    const unitPrice = (selectedMat as any).price || 0;

    const newItem: ProductRecipe = {
      materialId: materialId,
      materialName: selectedMat.name,
      unit: selectedMat.unit,
      quantity: quantity,
      costPerUnit: unitPrice
    };

    // Atualiza Lista
    this.recipeItems.update(items => [...items, newItem]);

    // Atualiza Custo Visual
    this.form.patchValue({ estimatedCost: this.totalCost() });

    this.recipeForm.reset();
  }

  removeMaterial(index: number) {
    this.recipeItems.update(items => items.filter((_, i) => i !== index));
    this.form.patchValue({ estimatedCost: this.totalCost() });
  }

  // --- SUBMISSÃO ---

  onSubmit() {
    if (this.form.invalid) {
        this.form.markAllAsTouched(); // Mostra erros vermelhos
        return;
    }
    this.isLoading = true;
    const formData = {
      ...this.form.value,
      recipeItems: this.recipeItems()
    } as Product;

    const request$ = (this.product && this.product.id)
      ? this.productService.update(this.product.id, formData)
      : this.productService.create(formData);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro desconhecido ao produzir.';
        this.notiService.error('Erro ao guardar produto: '+ msg);
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.close.emit(false);
  }
}
