import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovementService } from '../../../../../core/services/stock-movement.service';
import { StockMovement } from '../../../../../core/models/stock-movement.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule], // Importa o FeatherModule se usares ícones
  templateUrl: './stock-movement-list.component.html'
})
export class StockMovementListComponent implements OnInit {
  private service = inject(StockMovementService);
  private notiService = inject(NotificationService);

  movements = signal<StockMovement[]>([]);
  isLoading = signal<boolean>(true);


  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.service.getMovements().subscribe({
      next: (data) => {
        this.movements.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro desconhecido ao produzir.';
        this.notiService.error('Erro ao carregar movimentos: '+ msg);
        this.isLoading.set(false);
      }
    });
  }
}
