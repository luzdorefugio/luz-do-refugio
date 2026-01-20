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
            if (error.status === 401) {
                errorMessage = 'A sua sessão expirou. Por favor, faça login novamente.';
                localStorage.removeItem('carrinho_luz');
                localStorage.removeItem('luzdorefugio_token');
                localStorage.removeItem('luzdorefugio_user');
                router.navigate(['/login'], {
                    queryParams: { returnUrl: router.url }
                });
                notificationService.error(errorMessage);
                return throwError(() => error);
            }
            if (error.status === 0) {
                errorMessage = '🔌 Não foi possível ligar ao servidor. Verifica se o Backend está a correr!';
            }
            else if (error.error instanceof ErrorEvent) {
                errorMessage = `Erro de cliente: ${error.error.message}`;
            } else {
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else {
                    errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro no servidor'}`;
                }
            }
            notificationService.error(errorMessage);
            return throwError(() => error);
        })
    );
};
