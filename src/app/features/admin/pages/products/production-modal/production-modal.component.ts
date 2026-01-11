import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductRecipe } from '../../../../../core/models/product.model'; // As tuas interfaces
import { Material } from '../../../../../core/models/material.model'; // A tua interface de Material

@Component({
  selector: 'app-production-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-modal.component.html',
})
export class ProductionModalComponent {

  @Input({ required: true }) product!: Product;
  @Input({ required: true }) materials: Material[] = []; // <--- NOVA INPUT: Lista de stock real

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ productId: string, quantity: number }>();

  quantityToProduce = signal(1);

  // CRUCIAL: Este computed junta a receita com o stock real
  recipeStatus = computed(() => {
    return this.product.recipeItems.map(recipeItem => {
      // 1. Encontrar o material correspondente na lista de stocks
      const realMaterial = this.materials.find(m => m.id === recipeItem.materialId);

      // 2. Calcular quanto precisamos
      const totalRequired = recipeItem.quantity * this.quantityToProduce();

      // 3. Retornar um objeto combinado pronto para o HTML
      return {
        materialId: recipeItem.materialId,
        name: realMaterial ? realMaterial.name : 'Material Desconhecido', // Fallback se não encontrar
        unit: realMaterial ? realMaterial.unit : 'un',
        required: totalRequired,
        inStock: realMaterial ? realMaterial.quantityOnHand : 0,
        hasEnough: realMaterial ? (realMaterial.quantityOnHand >= totalRequired) : false
      };
    });
  });

  // Validação global: Só pode produzir se TODOS os materiais tiverem stock suficiente
  canProduce = computed(() => {
    if (this.quantityToProduce() <= 0) return false;
    // Verifica se todos os itens no recipeStatus têm hasEnough = true
    return this.recipeStatus().every(item => item.hasEnough);
  });

  updateQuantity(value: number) {
    if (value > 0) this.quantityToProduce.set(value);
  }

  onConfirm() {
    if (this.canProduce()) {
      this.confirm.emit({
        productId: this.product.id,
        quantity: this.quantityToProduce()
      });
    }
  }
}
