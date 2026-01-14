import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Importa os teus modelos e serviços
import { MaterialService } from '../../../../../core/services/material.service';
import { Material } from '../../../../../core/models/material.model';
import { MaterialFormComponent } from '../material-form/material-form.component';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
    selector: 'app-material-list',
    imports: [CommonModule, MaterialFormComponent, ReactiveFormsModule],
    templateUrl: './material-list.component.html'
})
export class MaterialListComponent implements OnInit {
    private service = inject(MaterialService);
    private notiService = inject(NotificationService);
    private fb = inject(FormBuilder);
    materials = signal<Material[]>([]); // Lista completa vinda do backend
    isLoading = signal(true);
    showInactive = signal(false); // Controla a checkbox
    isModalOpen = signal(false); // Modal de Criar/Editar
    selectedMaterial = signal<Material | null>(null); // Material a editar
    selectedMaterialForPurchase = signal<Material | null>(null);
    purchaseForm: FormGroup;
    isSubmitting = signal(false);
    isPurchaseModalOpen = signal(false)

    visibleMaterials = computed(() => {
        const allMaterials = this.materials();
        const show = this.showInactive();
        if (show) {
            return allMaterials; // Mostra tudo
        }
        // Se a checkbox estiver desligada, filtra apenas os ativos
        return allMaterials.filter(m => m.active !== false);
    });

    constructor() {
        // Inicializa o formulário de compra
        this.purchaseForm = this.fb.group({
            quantity: [null, [Validators.required, Validators.min(0.01)]],
            totalCost: [null, [Validators.required, Validators.min(0.01)]],
            supplierNote: ['']
        });
    }

    ngOnInit() {
        this.loadData();
    }

    // --- CARREGAMENTO DE DADOS ---
    loadData() {
        this.isLoading.set(true);
        // Assumimos que o getAll traz TODOS (ativos e inativos) do backend
        // Se o backend filtrar por defeito, terás de passar um parametro ex: getAll(true)
        this.service.getAll().subscribe({
            next: (data) => {
                this.materials.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.notiService.apiError(err, "Erro ao obter lista de materiais.");
                this.isLoading.set(false);
            }
        });
    }

    // --- FILTROS ---
    toggleShowInactive() {
        // Inverte o valor booleano. O computed 'visibleMaterials' atualiza-se sozinho.
        this.showInactive.update(val => !val);
    }

    // --- CRIAR / EDITAR ---
    openCreate() {
        this.selectedMaterial.set(null);
        this.isModalOpen.set(true);
    }

    openEdit(material: Material) {
        this.selectedMaterial.set(material);
        this.isModalOpen.set(true);
    }

    handleModalClose(refresh: boolean) {
        this.isModalOpen.set(false);
        this.selectedMaterial.set(null);
        if (refresh) {
            this.loadData();
        }
    }

    // --- AÇÕES DE STOCK (COMPRA) ---
    openPurchaseModal(material: Material) {
        this.selectedMaterialForPurchase.set(material);
        this.purchaseForm.reset(); // Limpa o formulário
        this.isPurchaseModalOpen.set(true);
    }

    closePurchaseModal() {
        this.isPurchaseModalOpen.set(false);
        this.selectedMaterialForPurchase.set(null);
    }

    submitPurchase() {
        const material = this.selectedMaterialForPurchase();
        if (this.purchaseForm.invalid || !material || !material.id) return;

        const purchaseData = this.purchaseForm.value;

        this.service.purchaseMaterial(material.id, purchaseData).subscribe({
            next: () => {
                this.notiService.success('Stock atualizado e despesa registada!');
                this.closePurchaseModal();
                this.loadData(); // Recarrega para ver o novo stock na tabela
            },
            error: (err) => {
                this.notiService.apiError(err, 'Erro ao registar compra');
            }
        });
    }

    // --- APAGAR / RESTAURAR ---
    async deleteMaterial(id: string) {
        const confirmed = await this.notiService.confirm(
            'Desativar este material? Ele deixará de aparecer nas opções de produção.'
        );
        if (confirmed) {
            this.service.delete(id).subscribe({
                next: () => {
                    this.loadData();
                    this.notiService.success('Material desativado com sucesso.');
                },
                error: (err) => this.notiService.apiError(err, 'Erro ao desativar material')
            });
        }
    }

    // Novo método para reativar (caso o teu backend suporte 'undelting' ou update status)
    async restoreMaterial(id: string) {
        // Aqui assumimos que tens um endpoint 'restore' ou usas o 'update' para mudar active=true
        // Se não tiveres endpoint específico, podes ter de criar no service.
        this.service.restore(id).subscribe({
            next: () => {
                this.loadData();
                this.notiService.success('Material reativado!');
            },
            error: (err) => this.notiService.apiError(err, 'Erro ao restaurar material')
        });
    }
}
