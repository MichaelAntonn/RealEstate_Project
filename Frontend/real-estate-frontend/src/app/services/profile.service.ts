import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api/v1/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        if (response.user) {
          this.authService.updateCurrentUser(response.user);
        } else if (response.profile) {
          const currentUser = this.authService.getUser();
          const updatedUser = {
            ...currentUser,
            ...response.profile,
            profile_image: response.profile.profile_image || currentUser.profile_image
          };
          this.authService.updateCurrentUser(updatedUser);
        }
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData, { headers: this.getHeaders() });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`, { headers: this.getHeaders() });
  }
}