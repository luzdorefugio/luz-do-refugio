import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-shop-account',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './shop-account.component.html'
})
export class ShopAccountComponent implements OnInit {
    authService = inject(AuthService);
    private orderService = inject(OrderService);
    private notify = inject(NotificationService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    currentUser = this.authService.currentUser;
    orders = signal<Order[]>([]);
    isLoadingOrders = signal(true);
    profileForm: FormGroup;
    isSavingProfile = signal(false);
    expandedOrders = new Set<string>();

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required], // Adicionei o nome também para ser editável
      email: ['', [Validators.required, Validators.email]], // <-- NOVO: Email
      phone: [''],
      address: [''],
      city: [''],
      zipCode: [''],
      nif: ['']
    });
  }

  ngOnInit() {
    const user = this.currentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Carregar Encomendas
    if (user.email) {
      this.orderService.getOrdersByCustomerEmail(user.email).subscribe({
        next: (data) => {
          const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.orders.set(sorted);
          this.isLoadingOrders.set(false);
        },
        error: () => this.isLoadingOrders.set(false)
      });
    }

    // Preencher Formulário
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '', // <-- Preencher Email
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
      nif: user.nif || ''
    });
  }

  toggleDetails(order: any) {
    if (this.expandedOrders.has(order.id)) {
      this.expandedOrders.delete(order.id);
    } else {
      this.expandedOrders.add(order.id);
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSavingProfile.set(true);
    const formData = this.profileForm.value;

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.notify.success('Dados atualizados com sucesso!');
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.notify.apiError(err, 'Erro ao atualizar perfil');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/loja']);
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PAID': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  translateStatus(status: string): string {
    const map: any = {
        'PENDING': 'Pendente',
        'PAID': 'Pago',
        'SHIPPED': 'Enviado',
        'DELIVERED': 'Entregue',
        'CANCELLED': 'Cancelado'
    };
    return map[status] || status;
  }
}
