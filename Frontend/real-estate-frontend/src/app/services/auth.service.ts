import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private readonly AUTH_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  // تسجيل مستخدم جديد
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // تسجيل الدخول
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.clearStaleTokens();
        this.saveToken(response.token);
        if (response.user) {
          this.saveUser(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // إعادة تعيين كلمة المرور
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // حفظ التوكن
  saveToken(token: string): void {
    localStorage.setItem(this.AUTH_KEY, token);
  }

  // جلب التوكن
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_KEY);
  }

  // حفظ بيانات المستخدم
  saveUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

// أضف هذه الدالة إلى AuthService الحالي

registerCompany(companyData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/company/register`, companyData).pipe(
    catchError(this.handleError)
  );
}
  // جلب بيانات المستخدم
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // تسجيل الخروج
  logout(): void {
    this.clearAllTokens();
    this.router.navigate(['/login']);
  }

  // التحقق من حالة المصادقة
  isLoggedIn(): boolean {
    return this.isTokenValid();
  }

  // إنشاء رؤوس المصادقة
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // التحقق من صلاحية التوكن
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }

  // معالجة الأخطاء المركزية
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // تنظيف التوكنات القديمة
  private clearStaleTokens(): void {
    ['access_token', 'token'].forEach(key => localStorage.removeItem(key));
  }

  // مسح جميع التوكنات والبيانات
  private clearAllTokens(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.clearStaleTokens();
  }
}