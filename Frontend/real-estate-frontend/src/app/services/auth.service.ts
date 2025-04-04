import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private sanctumUrl = 'http://localhost:8000/sanctum';
  private userRole: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  getCsrfCookie(): Observable<any> {
    console.log('Fetching CSRF cookie...');
    return this.http.get(`${this.sanctumUrl}/csrf-cookie`, { withCredentials: true }).pipe(
      tap(() => console.log('CSRF cookie fetched successfully')),
      catchError(error => {
        console.error('Error fetching CSRF cookie:', error);
        throw error;
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  adminLogin(credentials: { email: string; password: string }): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        console.log('Sending login request with credentials:', credentials);
        return this.http.post(`${this.apiUrl}/v1/admin/login`, credentials, { withCredentials: true });
      }),
      tap(response => console.log('Login response from server:', response)),
      catchError(error => {
        console.error('Error during admin login:', error);
        throw error;
      })
    );
  }

  setUserRole(role: string) {
    this.userRole = role;
  }

  isLoggedIn(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }
    return this.http.get(`${this.apiUrl}/user`, { // Changed from /api/v1/user to /api/user
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      tap(response => console.log('User validation response:', response)), // Add logging
      map(() => true),
      catchError(error => {
        console.error('Error validating token:', error);
        this.logout();
        return of(false);
      })
    );
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  logout(): void {
    this.userRole = null;
    localStorage.removeItem('token');
    if (this.userRole === 'admin' || this.userRole === 'super-admin') {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}