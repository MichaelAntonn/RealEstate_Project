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

  constructor(private http: HttpClient, private router: Router) {
    // Load user role from localStorage on initialization
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      this.userRole = storedRole;
      console.log('User role loaded from localStorage:', this.userRole);
    } else {
      console.log('No user role found in localStorage');
    }
  }

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
    localStorage.setItem('userRole', role);
    console.log('User role set and stored in localStorage:', role);
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  isLoggedIn(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return of(false);
    }
    console.log('Token found, validating with /api/user:', token);
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      tap(response => console.log('User validation response:', response)),
      map((response: any) => {
        console.log('Token validation successful');
        if (response.user_type) {
          this.setUserRole(response.user_type);
        }
        return true;
      }),
      catchError(error => {
        console.error('Error validating token:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        return of(false);
      })
    );
  }

  // Add the fetchUserRole method
  fetchUserRole(): Observable<string | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage for fetchUserRole');
      return of(null);
    }
    console.log('Fetching user role with token:', token);
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      map((response: any) => {
        const role = response.user_type || null;
        if (role) {
          this.setUserRole(role);
          console.log('User role fetched and set:', role);
        } else {
          console.log('No user_type found in response:', response);
        }
        return role;
      }),
      catchError(error => {
        console.error('Error fetching user role:', error);
        return of(null);
      })
    );
  }

  logout(): void {
    const role = this.userRole;
    this.userRole = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    console.log('User logged out, redirecting to login page');
    if (role === 'admin' || role === 'super-admin') {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}