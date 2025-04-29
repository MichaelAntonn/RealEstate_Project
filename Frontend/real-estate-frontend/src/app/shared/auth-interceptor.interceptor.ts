import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { CompanyAuthService } from '../services/company-auth.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const companyAuthService = inject(CompanyAuthService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // تحديد نوع التوكن بناء على مسار API
  const isCompanyApi = req.url.includes('/api/admin/company');
  const token = isCompanyApi ? companyAuthService.getToken() : authService.getToken();

  // إذا لم يكن هناك توكن، تابع الطلب كما هو
  if (!token) {
    return next(req);
  }

  // تعريف نوع headers بشكل صريح
  const headers: {
    Authorization: string;
    'Content-Type'?: string;
    'Accept'?: string;
  } = { Authorization: `Bearer ${token}` };

  // إضافة Content-Type فقط إذا لم يكن FormData ولم يكن موجودًا مسبقًا
  if (!(req.body instanceof FormData) ){
    if (!req.headers.has('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }
  }

  // إضافة Accept header إذا لم يكن موجودًا مسبقًا
  if (!req.headers.has('Accept')) {
    headers['Accept'] = 'application/json';
  }

  const authRequest = req.clone({ setHeaders: headers });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('AuthInterceptor error:', error);

      // معالجة أخطاء المصادقة (401 Unauthorized)
      if (error.status === 401) {
        if (isCompanyApi) {
          companyAuthService.logout();
        } else {
          authService.logout();
        }
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
