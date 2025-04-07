import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:8000/api';
  private sanctumUrl = 'http://localhost:8000/sanctum';
  private tokenKey = 'token'; // Consistent token key
  private userRole: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem(this.tokenKey);
    const storedRole = localStorage.getItem('userRole');
    if (storedToken && storedRole) {
      this.userRole = storedRole;
      console.log('Initialized with token:', storedToken, 'and role:', storedRole);
      this.validateToken().subscribe(isValid => {
        if (!isValid) {
          this.logout();
        }
      });
    } else {
      console.log('No valid token or role found in localStorage');
    }
  }

  getCsrfCookie(): Observable<any> {
    console.log('Fetching CSRF cookie...');
    return this.http.get(`${this.sanctumUrl}/csrf-cookie`, { withCredentials: true }).pipe(
      tap(() => console.log('CSRF cookie fetched successfully')),
      catchError(error => {
        console.error('Error fetching CSRF cookie:', error);
        return of(null); // Proceed even if CSRF fails (adjust if critical)
      })
    );
  }

  adminLogin(credentials: { email: string; password: string }): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        console.log('Sending login request with credentials:', credentials);
        return this.http.post(`${this.apiUrl}/v1/admin/login`, credentials, { withCredentials: true });
      }),
      map((response: any) => {
        console.log('Login response from server:', response);
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          const role = response.user_type || 'admin'; // Fallback to 'admin'
          this.setUserRole(role);
          return response;
        } else {
          throw new Error('No token in login response');
        }
      }),
      tap(() => console.log('Login successful, token and role stored')),
      catchError(error => {
        console.error('Error during admin login:', error);
        throw error;
      })
    );
  }

  setUserRole(role: string): void {
    this.userRole = role;
    localStorage.setItem('userRole', role);
    console.log('User role set and stored in localStorage:', role);
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    console.log('isLoggedIn check, token:', token);
    return !!token; // Synchronous check for AuthGuard compatibility
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('No token found for validation');
      return of(false);
    }
    console.log('Validating token with /api/user:', token);
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).pipe(
      map((response: any) => {
        console.log('Token validation response:', response);
        const role = response.user_type || this.userRole;
        if (role && role !== this.userRole) {
          this.setUserRole(role); // Sync role if changed
        }
        return true;
      }),
      catchError(error => {
        console.error('Token validation failed:', error);
        return of(false);
      })
    );
  }

  fetchUserRole(): Observable<string | null> {
    const token = this.getToken();
    if (!token) {
      console.log('No token found for fetchUserRole');
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
          console.log('No user_type in response:', response);
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
    console.log('User logged out, redirecting to login page');
    if (role === 'admin' || role === 'super-admin') {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // New method to fetch user profile
  getUserProfile(): Observable<{ first_name: string; last_name: string; profile_image: string | null }> {
    const token = this.getToken();
    if (!token) {
      console.log('No token found for getUserProfile, returning fallback');
      return of({ first_name: 'Admin', last_name: 'User', profile_image: null });
    }
    console.log('Fetching user profile with token:', token);
    return this.http.get<{ success: boolean; profile: { first_name: string; last_name: string; profile_image: string | null } }>(
      `${this.apiUrl}/v1/user/profile`,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
        withCredentials: true
      }
    ).pipe(
      map(response => {
        if (response.success && response.profile) {
          console.log('User profile fetched:', response.profile);
          return response.profile; // Return only the profile object
        }
        console.warn('No profile data in response:', response);
        throw new Error('No profile data found in response');
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return of({ first_name: 'Admin', last_name: 'User', profile_image: null }); // Fallback profile
      })
    );
  }
}