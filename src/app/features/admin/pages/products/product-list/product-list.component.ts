import { Component, inject, signal, computed, OnInit } from '@angular/core'; // <--- Adicionado 'computed'
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../../core/services/product.service';
import { Product } from '../../../../../core/models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductFormComponent],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {

  private service = inject(ProductService);
  private fb = inject(FormBuilder);
  private notiService = inject(NotificationService);

  // --- ESTADO DOS DADOS ---
  products = signal<Product[]>([]);
  isLoading = signal(true);

  // --- FILTROS (Novo) ---
  showInactive = signal(false);

  // --- LISTA COMPUTADA (Novo) ---
  // Esta lista reage automaticamente quando 'products' ou 'showInactive' mudam
  visibleProducts = computed(() => {
    const all = this.products();
    const show = this.showInactive();

    if (show) return all;

    // Filtra apenas os ativos (active === true ou undefined)
    return all.filter(p => p.active !== false);
  });

  // --- ESTADO DO MODAL CRIAR/EDITAR ---
  isModalOpen = signal(false);
  selectedProduct = signal<Product | null>(null);

  // --- ESTADO DO MODAL PRODUZIR ---
  isProduceModalOpen = signal(false);
  produceProductSelected = signal<Product | null>(null);

  // Form para a quantidade a produzir
  produceForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // O serviço deve retornar TODOS os produtos (ativos e inativos)
    this.service.getAllProducts().subscribe({
      next: (data) => {
        // Ordenar alfabeticamente
        this.products.set(data.sort((a, b) => a.name.localeCompare(b.name)));
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro desconhecido.';
        this.notiService.apiError(err, 'Erro ao carregar produtos');
        this.isLoading.set(false);
      }
    });
  }

  // --- LÓGICA DE FILTRO ---
  toggleShowInactive() {
    this.showInactive.update(val => !val);
  }

  // ==========================================
  // AÇÕES: CRIAR / EDITAR / APAGAR / RESTAURAR
  // ==========================================

  openCreate() {
    this.selectedProduct.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(product: Product) {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
  }

  // Soft Delete
  async deleteProduct(id: string) {
    const confirmed = await this.notiService.confirm(
      'Desativar este produto? Ele deixará de aparecer na loja, mas o histórico mantém-se.'
    );
    if (confirmed) {
      this.service.delete(id).subscribe({
        next: () => {
          this.loadData();
          this.notiService.success('Produto desativado com sucesso.');
        },
        error: (err) => {
          this.notiService.apiError(err, 'Erro ao desativar produto');
        }
      });
    }
  }

  // Restore (Novo)
  async restoreProduct(id: string) {
    // Requer endpoint POST /api/products/{id}/restore no backend
    this.service.restore(id).subscribe({
        next: () => {
            this.notiService.success('Produto reativado com sucesso!');
            this.loadData();
        },
        error: (err) => this.notiService.apiError(err, 'Erro ao restaurar produto')
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
  // LÓGICA DE PRODUÇÃO
  // ==========================================

  openProduce(product: Product) {
    this.produceProductSelected.set(product);
    this.produceForm.reset({ quantity: 1 });
    this.isProduceModalOpen.set(true);
  }

  closeProduce() {
    this.isProduceModalOpen.set(false);
    this.produceProductSelected.set(null);
  }

  async confirmProduce() {
    const product = this.produceProductSelected();
    const quantity = this.produceForm.value.quantity;

    if (!product || !quantity || quantity < 1) return;

    // Usar notiService para consistência visual
    const confirmed = await this.notiService.confirm(
        `Confirmar produção de ${quantity} unidades de "${product.name}"?\n(Isto vai descontar materiais do stock!)`
    );

    if (!confirmed) return;

    this.isLoading.set(true);

    this.service.produce(product.id, quantity).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeProduce();
        // Corrigido: uso de backticks para interpolação de string
        this.notiService.success(`Sucesso! Produziste ${quantity} unidades.`);
        this.loadData();
      },
      error: (err) => {
        this.notiService.apiError(err, "Erro ao processar produção.");
        this.isLoading.set(false);
      }
    });
  }
}
