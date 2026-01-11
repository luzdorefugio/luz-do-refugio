import { Component, inject, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardStats } from '../../../../core/models/dashboard-stats.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
declare var feather: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit, AfterViewInit {
    private service = inject(DashboardService);
    private orderService = inject(OrderService);
    private notiService = inject(NotificationService);
    public auth = inject(AuthService);
    orders = signal<Order[]>([]);
    isLoading = signal(true);
    stats = signal<DashboardStats>({
        totalInvestedMaterials: 0,
        potentialRevenue: 0,
        estimatedProfit: 0
    });

    totalRevenue = computed(() => {
        return this.orders().filter(o => o.status !== 'CANCELLED')
            .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
    });

    pendingOrdersCount = computed(() => {
        return this.orders().filter(o => o.status === 'PENDING').length;
    });

    totalOrdersCount = computed(() => this.orders().length);

    recentOrders = computed(() => {
        return this.orders().slice(0, 5);
    });

    public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { family: 'serif' } } }
    }
    };

    public doughnutChartType: ChartType = 'doughnut';

    public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#570419', // Bordeaux (Luz do Refugio)
        '#D4AF37', // Gold
        '#F3E5AB', // Cream
        '#8B4513', // Castanho (Banca)
        '#2E8B57'  // Verde
      ],
      hoverOffset: 4
    }]
    };

    hasChartData = signal(false);

    ngOnInit() {
        this.loadData();
        this.loadChart();
    }

    ngAfterViewInit() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    loadData() {
        forkJoin({
            ordersRequest: this.orderService.getAllOrders(),
            statsRequest: this.service.getStats()
          }).subscribe({
            next: (results) => {
              this.orders.set(results.ordersRequest);
              this.stats.set(results.statsRequest);
              this.isLoading.set(false);
              setTimeout(() => feather.replace(), 100);
            },
            error: (err) => {
                this.notiService.apiError(err, "Erro ao carregar dashboard:");
                this.isLoading.set(false);
            }
          });
    }

loadChart() {
    this.service.getSalesByChannel().subscribe({
      next: (data) => {
        // Transformar dados do Java para o Chart.js
        const labels = data.map(d => this.formatChannelName(d.channel));
        const values = data.map(d => d.totalValue);

        this.doughnutChartData = {
          ...this.doughnutChartData,
          labels: labels,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: values }]
        };

        if (data.length > 0) this.hasChartData.set(true);
      }
    });
  }

formatChannelName(channel: string): string {
    const map: any = {
      'INSTAGRAM': 'Instagram',
      'FACEBOOK': 'Facebook',
      'MARKET_STALL': 'Banca / Feira',
      'WEBSITE': 'Site',
      'DIRECT': 'Direto',
      'BASKET': 'Cesto'
    };
    return map[channel] || channel;
  }

    getStatusColor(status: string): string {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-50';
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'SHIPPED': return 'text-blue-600 bg-blue-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    }
}
