import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido.';

      // 1. Verificar se é erro de conexão (Servidor em baixo / Sem Internet)
      if (error.status === 0) {
        errorMessage = '🔌 Não foi possível ligar ao servidor. Verifica se o Backend está a correr!';
      }
      // 2. Verificar erro do lado do cliente (ex: código JS partiu antes de enviar)
      else if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro de cliente: ${error.error.message}`;
      }
      // 3. Verificar erro que veio do Java (o nosso JSON bonito)
      else {
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          // Fallback para erros HTTP padrão (ex: 403 Forbidden genérico)
          errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro no servidor'}`;
        }
      }

      // Mostra a notificação
      notificationService.error(errorMessage);

      return throwError(() => error);
    })
  );
};
