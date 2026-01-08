import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário se for Standalone
import { Financial } from '../../../../../core/models/financial.model';
import { FinancialService } from '../../../../../core/services/financial.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-financial-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-list.component.html',
  styleUrls: ['./financial-list.component.scss']
})
export class FinancialListComponent implements OnInit {
    private service = inject(FinancialService);
    private notiService = inject(NotificationService);
    transactions: Financial[] = [];
    isLoading = signal(true);
    totalIncome = 0;
    totalExpense = 0;
    balance = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.calculateTotals();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar finanças', err);
        this.isLoading.set(false);
      }
    });
  }

  calculateTotals(): void {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = this.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpense;
  }

  // Utilitário para formatar nomes das categorias
  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ');
  }
}
