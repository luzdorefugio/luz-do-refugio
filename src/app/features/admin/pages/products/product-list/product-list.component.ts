import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms'; // ReactiveFormsModule já não é necessário para a produção, mas pode ser para filtros futuros
import { Product } from '../../../../../core/models/product.model';
import { Material } from '../../../../../core/models/material.model'; // <--- IMPORTANTE
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductionModalComponent } from '../production-modal/production-modal.component'; // <--- IMPORTAR O MODAL NOVO
import { NotificationService } from '../../../../../core/services/notification.service';
import { ProductService } from '../../../../../core/services/product.service';
import { MaterialService } from '../../../../../core/services/material.service'; // <--- IMPORTANTE

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, ProductionModalComponent], // <--- Adicionar Modal aos imports
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {

  private service = inject(ProductService);
  private materialService = inject(MaterialService); // <--- Injetar serviço de materiais
  private notiService = inject(NotificationService);

  // --- ESTADO DOS DADOS ---
  products = signal<Product[]>([]);
  materials = signal<Material[]>([]); // <--- Lista de materiais para passar ao modal
  isLoading = signal(true);

  // --- FILTROS ---
  showInactive = signal(false);

  // --- LISTA COMPUTADA ---
  visibleProducts = computed(() => {
    const all = this.products();
    const show = this.showInactive();
    if (show) return all;
    return all.filter(p => p.active !== false);
  });

  // --- ESTADO DO MODAL CRIAR/EDITAR PRODUTO ---
  isModalOpen = signal(false);
  selectedProduct = signal<Product | null>(null);

  // --- ESTADO DO MODAL PRODUZIR ---
  isProduceModalOpen = signal(false);
  produceProductSelected = signal<Product | null>(null);
  // (Removemos o produceForm antigo, o modal novo trata disso)

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Agora carregamos Produtos E Materiais
    // (O ideal seria usar forkJoin, mas assim também funciona bem)
    this.service.getAllProducts().subscribe({
      next: (productsData) => {
        this.products.set(productsData.sort((a, b) => a.name.localeCompare(b.name)));
        this.materialService.getAll().subscribe({
            next: (materialsData) => {
                this.materials.set(materialsData);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar materiais', err);
                this.isLoading.set(false);
            }
        });
      },
      error: (err) => {
        this.notiService.apiError(err, 'Erro ao carregar dados');
        this.isLoading.set(false);
      }
    });
  }

  // --- LÓGICA DE FILTRO ---
  toggleShowInactive() {
    this.showInactive.update(val => !val);
  }

  openCreate() {
    this.selectedProduct.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(product: Product) {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
  }

  async deleteProduct(id: string) {
    const confirmed = await this.notiService.confirm(
      'Desativar este produto? Ele deixará de aparecer na loja.'
    );
    if (confirmed) {
      this.service.delete(id).subscribe({
        next: () => {
          this.loadData();
          this.notiService.success('Produto desativado com sucesso.');
        },
        error: (err) => this.notiService.apiError(err, 'Erro ao desativar')
      });
    }
  }

  async restoreProduct(id: string) {
    this.service.restore(id).subscribe({
        next: () => {
            this.notiService.success('Produto reativado!');
            this.loadData();
        },
        error: (err) => this.notiService.apiError(err, 'Erro ao restaurar')
    });
  }

  handleModalClose(shouldRefresh: boolean) {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    if (shouldRefresh) {
      this.loadData();
    }
  }

  // ==========================================
  // LÓGICA DE PRODUÇÃO (NOVA) 🏭
  // ==========================================

  openProduce(product: Product) {
    this.produceProductSelected.set(product);
    this.isProduceModalOpen.set(true);
  }

  // ESTA É A FUNÇÃO QUE FALTAVA 👇
  handleProductionConfirm(event: { productId: string, quantity: number }) {
    // 1. Mostrar feedback visual imediato
    this.isLoading.set(true);

    // 2. Chamar o backend
    this.service.produce(event.productId, event.quantity).subscribe({
      next: () => {
        // 3. Sucesso
        this.notiService.success(`Produção registada! Stock atualizado.`);

        // 4. Fechar modal e limpar seleção
        this.isProduceModalOpen.set(false);
        this.produceProductSelected.set(null);

        // 5. Recarregar dados (Isto atualiza o stock das velas E das matérias-primas na tabela)
        this.loadData();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notiService.apiError(err, "Erro ao processar produção.");
      }
    });
  }
}
