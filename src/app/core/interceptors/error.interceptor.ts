import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido.';

      // --- LOGICA DE TOKEN EXPIRADO (401) ---
      if (error.status === 401) {
        // 1. Definir mensagem amigável
        errorMessage = 'A sua sessão expirou. Por favor, faça login novamente.';

        // 2. Limpar o Token (ajusta a chave 'token' para o nome que usas)
        localStorage.removeItem('token');
        // localStorage.removeItem('user'); // Se guardares user info, limpa também

        // 3. Redirecionar para o Login
        // Dica: Passamos a URL atual (queryParams) para voltar lá depois de logar
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        });

        // Mostra notificação e encerra
        notificationService.error(errorMessage);
        return throwError(() => error);
      }
      // ---------------------------------------

      // 1. Verificar se é erro de conexão
      if (error.status === 0) {
        errorMessage = '🔌 Não foi possível ligar ao servidor. Verifica se o Backend está a correr!';
      }
      // 2. Verificar erro do lado do cliente
      else if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro de cliente: ${error.error.message}`;
      }
      // 3. Verificar erro que veio do Java
      else {
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro no servidor'}`;
        }
      }

      // Mostra a notificação para os outros erros
      notificationService.error(errorMessage);

      return throwError(() => error);
    })
  );
};
