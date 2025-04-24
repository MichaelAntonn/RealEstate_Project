import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { CompanyAuthService } from '../services/company-auth.service';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const companyAuthService = inject(CompanyAuthService);
  const isCompanyApi = req.url.includes('/api/admin/company');
  let token: string | null = null;

  if (isCompanyApi) {
    token = companyAuthService.getToken();
  } else {
    token = localStorage.getItem('access_token');
  }

  if (token) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authRequest).pipe(
      catchError(error => {
        console.error('AuthInterceptor error:', error);
        return throwError(() => error);
      })
    );
  }

  return next(req);
};