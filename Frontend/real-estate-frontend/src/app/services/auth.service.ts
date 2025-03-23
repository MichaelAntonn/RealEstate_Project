import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1'; // تأكدي من أن الرابط صحيح

  constructor(private http: HttpClient) {}

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
}