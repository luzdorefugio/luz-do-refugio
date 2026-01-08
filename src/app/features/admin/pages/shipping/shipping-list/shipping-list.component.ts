import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingService } from '../../../../../core/services/shipping.service';
import { ShippingMethod } from '../../../../../core/models/shipping.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ShippingFormComponent } from '../shipping-form/shipping-form.component';

@Component({
  selector: 'app-shipping-list',
  standalone: true,
  imports: [CommonModule, ShippingFormComponent],
  templateUrl: './shipping-list.component.html'
})
export class ShippingListComponent implements OnInit {

  private service = inject(ShippingService);
  private noti = inject(NotificationService);

  methods = signal<ShippingMethod[]>([]);
  isLoading = signal(true);

  // Modal State
  isModalOpen = signal(false);
  selectedMethod = signal<ShippingMethod | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Nota: Usamos getAllAdmin para ver até os inativos
    this.service.getAllAdmin().subscribe({
      next: (data) => {
        this.methods.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.noti.apiError(err, 'Erro ao carregar métodos');
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.selectedMethod.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(method: ShippingMethod) {
    this.selectedMethod.set(method);
    this.isModalOpen.set(true);
  }

  async deleteMethod(id: string) {
    if (await this.noti.confirm('Tem a certeza? Isto pode afetar o histórico se não estiver bem configurado.')) {
        this.service.delete(id).subscribe({
            next: () => {
                this.noti.success('Método eliminado.');
                this.loadData();
            },
            error: (err) => this.noti.apiError(err)
        });
    }
  }

  handleModalClose(refresh: boolean) {
    this.isModalOpen.set(false);
    this.selectedMethod.set(null);
    if (refresh) this.loadData();
  }
}
