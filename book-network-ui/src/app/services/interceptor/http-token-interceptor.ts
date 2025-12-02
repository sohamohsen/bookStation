// src/app/core/interceptors/http-token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../token/token.service';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.token;

  // Exclude all auth-related endpoints
  const excludedUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/authentication'
  ];

  const isExcluded = excludedUrls.some(url => req.url.toLowerCase().includes(url));

  if (isExcluded || !token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
