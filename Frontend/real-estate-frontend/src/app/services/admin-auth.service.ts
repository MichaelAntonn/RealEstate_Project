import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:8000/api';
  private sanctumUrl = 'http://localhost:8000/sanctum';
  private tokenKey = 'token';
  private userRole: string | null = null;
  private currentAdminSubject = new BehaviorSubject<any>(null);
  currentAdmin$ = this.currentAdminSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem(this.tokenKey);
    const storedRole = localStorage.getItem('userRole');
    if (storedToken && storedRole) {
      this.userRole = storedRole;
      this.getUserProfile().subscribe(admin => {
        if (admin) {
          this.currentAdminSubject.next(admin);
        }
      });
    } else {
      // console.error('No valid token or role found in localStorage');
    }
  }

  getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.sanctumUrl}/csrf-cookie`, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error fetching CSRF cookie:', error);
        return of(null);
      })
    );
  }

  adminLogin(credentials: { email: string; password: string }): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        return this.http.post(`${this.apiUrl}/v1/admin/login`, credentials, { withCredentials: true });
      }),
      map((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          const role = response.user_type || 'admin';
          this.setUserRole(role);
          if (response.admin) {
            localStorage.setItem('adminData', JSON.stringify(response.admin));
            this.currentAdminSubject.next(response.admin);
          }
          return response;
        } else {
          throw new Error('No token in login response');
        }
      }),
      catchError(error => {
        console.error('Error during admin login:', error);
        throw error;
      })
    );
  }

  setUserRole(role: string): void {
    this.userRole = role;
    localStorage.setItem('userRole', role);
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAdmin(): any {
    // Try to get admin data from currentAdminSubject first
    const currentAdmin = this.currentAdminSubject.getValue();
    if (currentAdmin) {
      return currentAdmin;
    }
    // Fallback to localStorage if currentAdminSubject is null
    const adminData = localStorage.getItem('admin');
    try {
      const parsedData = adminData ? JSON.parse(adminData) : null;
      if (parsedData) {
        this.currentAdminSubject.next(parsedData);
      }
      return parsedData;
    } catch (error) {
      console.error('AdminAuthService.getAdmin: Error parsing adminData:', error);
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'Admin-Auth': 'true',
    });
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      map((response: any) => {
        const role = response.user_type || this.userRole;
        if (role && role !== this.userRole) {
          this.setUserRole(role);
        }
        return true;
      }),
      catchError(error => {
        return of(false);
      })
    );
  }

  fetchUserRole(): Observable<string | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      map((response: any) => {
        const role = response.user_type || null;
        if (role) {
          this.setUserRole(role);
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
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminData');
    this.currentAdminSubject.next(null);
    if (role === 'admin' || role === 'super-admin') {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getUserProfile(): Observable<{ id: number; first_name: string; last_name: string; profile_image: string | null }> {
    const token = this.getToken();
    if (!token) {
      return of({ id: 0, first_name: 'Admin', last_name: 'User', profile_image: null });
    }
    return this.http.get<{ success: boolean; profile: { id: number; first_name: string; last_name: string; profile_image: string | null } }>(
      `${this.apiUrl}/v1/user/profile`,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
        withCredentials: true
      }
    ).pipe(
      map(response => {
        if (response.success && response.profile) {
          this.currentAdminSubject.next(response.profile);
          localStorage.setItem("admin", JSON.stringify(response.profile));
          return response.profile;
        }
        console.warn('No profile data in response:', response);
        throw new Error('No profile data found in response');
      }),
      catchError(error => {
        return of({ id: 0, first_name: 'Admin', last_name: 'User', profile_image: null });
      })
    );
  }
}
