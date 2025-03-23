import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1'; // تأكد من أن الرابط صحيح

  constructor(private http: HttpClient, private router: Router) {}

  // تسجيل مستخدم جديد
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // تسجيل الدخول
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // إعادة تعيين كلمة المرور
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/forgot-password`, { email });
  }

  // حفظ الـ token في localStorage
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // الحصول على الـ token من localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // حفظ بيانات المستخدم في localStorage
  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // الحصول على بيانات المستخدم من localStorage
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // التحقق من حالة تسجيل الدخول
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}