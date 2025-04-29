import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CompanyAuthService } from './company-auth.service';

export interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    property_id?: number;
    property_title?: string;
    url: string;
    type?: string;
    reason?: string;
    submitted_by?: string;
    booking_id?: number;
  };
  read_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    private echo: Echo<any> | null = null;
    private notificationsSubject = new Subject<Notification>();
    notifications$ = this.notificationsSubject.asObservable();
    private isSubscribed = false;

    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private companyAuthService: CompanyAuthService
    ) {
      this.initializeEcho();
    }

    private getToken(): string | null {
      return this.authService.getToken() || this.companyAuthService.getToken();
    }

    private initializeEcho(): void {
      (window as any).Pusher = Pusher;

      this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`, {
        withCredentials: true
      }).subscribe({
        next: () => {
          const token = this.getToken();
          if (!token) {
            console.error('No token available for Pusher');
            return;
          }

          try {
            this.echo = new Echo({
              broadcaster: 'pusher',
              key: environment.pusher.key,
              cluster: environment.pusher.cluster,
              forceTLS: true,
              authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
              auth: {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json'
                }
              },
              withCredentials: true
            });

            console.log('Echo initialized successfully');
          } catch (error) {
            console.error('Echo initialization error:', error);
          }
        },
        error: (err) => {
          console.error('CSRF Cookie error:', err);
        }
      });
    }

    initNotifications(): void {
      if (this.isSubscribed || !this.echo) return;

      const user = this.authService.getUser();
      const company = this.companyAuthService.getCompanyData();
      const userId = user?.id || company?.id;

      if (!userId) {
        console.error('No user/company ID for notifications');
        return;
      }

      this.isSubscribed = true;
      const channelName = `App.Models.User.${userId}`;

      this.echo.private(channelName)
        .notification((notification: Notification) => {
          this.notificationsSubject.next(notification);
        })
        .error((error: any) => {
          console.error('Pusher error:', error);
          this.isSubscribed = false;
        });
    }

  getNotifications(page: number = 1, perPage: number = 10, type?: 'unread' | 'read'): Observable<any> {
    let params: any = { page, per_page: perPage };
    if (type) {
      params.type = type;
    }

    return this.http.get(`${environment.apiUrl}/api/v1/notifications`, { params }).pipe(
      tap(response => console.log('Notifications response:', response)),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/notifications/read-all`, {});
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/v1/notifications/${notificationId}`);
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/v1/notifications`);
  }
}
