import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderStatus'
})
export class OrderStatusPipe implements PipeTransform {

  // Este mapa é a tua "Fonte da Verdade" no Frontend
  private statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'PAID': 'Pago',
    'SHIPPED': 'Enviado',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado',
    'RETURNED': 'Devolvido'
  };

  transform(value: string): string {
    if (!value) return '';
    // Retorna a tradução ou o valor original se não encontrar
    return this.statusMap[value] || value;
  }
}
