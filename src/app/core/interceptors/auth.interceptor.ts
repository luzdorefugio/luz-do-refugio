import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Se tivermos token, clonamos o pedido e adicionamos o cabeçalho
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Envia o pedido clonado com o selo
    return next(clonedRequest);
  }

  // 2. Se não houver token (ex: no login), manda o pedido original
  return next(req);
};
