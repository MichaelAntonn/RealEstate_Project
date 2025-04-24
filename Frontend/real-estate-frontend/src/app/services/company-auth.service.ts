import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CompanyAuthService {
  private apiUrl = 'http://localhost:8000/api/admin/company';
  private tokenKey = 'company_token';
  private companyKey = 'company_data';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { company_email: string; password: string }): Observable<boolean> {
    return this.http.post<{ message: string; token: string; company: any }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Company login response:', response);
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.companyKey, JSON.stringify(response.company));
          console.log('Company login successful, token and data stored:', {
            token: response.token,
            company: response.company
          });
        } else {
          console.error('No token in response');
        }
      }),
      map(() => !!localStorage.getItem(this.tokenKey)),
      catchError(error => {
        console.error('Company login failed:', error);
        return of(false);
      })
    );
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!localStorage.getItem(this.tokenKey);
    console.log('CompanyAuthService.isLoggedIn:', isLoggedIn);
    return isLoggedIn;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('CompanyAuthService.getToken:', token ? 'Token exists' : 'No token');
    return token;
  }

  getCompanyData(): any | null {
    const data = localStorage.getItem(this.companyKey);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.companyKey);
    console.log('Company logged out');
    this.router.navigate(['/login']);
  }
}