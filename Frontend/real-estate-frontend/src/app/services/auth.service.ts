import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private readonly AUTH_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private profileImageSubject = new BehaviorSubject<string>('assets/1.png');
  profileImage$ = this.profileImageSubject.asObservable();

  updateProfileImage(image: string): void {
    const user = this.getUser();
    if (user) {
      user.profile_image = image;
      this.saveUser(user);
    }
  }

  private loadStoredUser(): void {
    const user = this.getUser();
    if (user && this.getToken()) {
      this.currentUserSubject.next(user);
      if (user.profile_image) {
        this.profileImageSubject.next(user.profile_image);
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError(error => {
        if (error.status === 422 && error.error.errors) {
          return throwError(() => error.error);
        }
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.clearStaleTokens();
        this.saveToken(response.token);
        if (response.user) {
          this.saveUser(response.user);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/password/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  registerCompany(companyData: FormData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/company/register`, companyData)
      .pipe(catchError(this.handleError));
  }

  saveToken(token: string): void {
    localStorage.setItem(this.AUTH_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_KEY);
  }

  saveUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    if (user.profile_image) {
      this.profileImageSubject.next(user.profile_image);
    }
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  loadCurrentUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    return this.http
      .get(`${this.apiUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((user: any) => {
          this.saveUser(user);
        }),
        catchError((err) => {
          this.clearAllTokens();
          return this.handleError(err);
        })
      );
  }

  logout(): void {
    this.clearAllTokens();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  isTokenValid(): Observable<boolean> {
    return this.loadCurrentUser().pipe(
      tap(() => true),
      catchError(() => {
        return throwError(() => false);
      })
    );
  }

  updateCurrentUser(updatedUser: any): void {
    this.saveUser(updatedUser);
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  private clearStaleTokens(): void {
    ['access_token', 'token'].forEach((key) => localStorage.removeItem(key));
  }

  getCurrentUserImage(): string {
    const user = this.getUser();
    if (user?.profile_image) {
      return user.profile_image.startsWith('data:image') ? 
        user.profile_image : user.profile_image;
    }
    return 'assets/1.png';
  }

  private clearAllTokens(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.clearStaleTokens(); 
    this.currentUserSubject.next(null);
  }
}