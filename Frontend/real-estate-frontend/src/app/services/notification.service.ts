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
  providedIn: 'root',
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

  private initializeEcho(): void {
    if (this.echo) return; // تجنب التهيئة المكررة

    (window as any).Pusher = Pusher;

    this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    }).subscribe({
      next: () => {
        this.echo = new Echo({
          broadcaster: 'pusher',
          key: environment.pusher.key,
          cluster: environment.pusher.cluster,
          forceTLS: true,
          authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
          auth: {
            headers: {
              'Authorization': `Bearer ${this.authService.getToken()}`,
              'X-CSRF-TOKEN': this.getCsrfToken()
            }
          },
          withCredentials: true,
        });

        console.log('Echo initialized successfully');
        this.initNotifications(); // تهيئة الإشعارات تلقائياً بعد اكتمال Echo
      },
      error: (err) => {
        console.error('Failed to initialize Echo:', err);
      }
    });
  }

  private getCsrfToken(): string {
    return document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || '';
  }

  initNotifications(): void {
    if (this.isSubscribed || !this.echo) return;

    const user = this.authService.getUser();
    const company = this.companyAuthService.getCompanyData();
    const userId = user?.id || company?.id;

    if (!userId) {
      console.error('User/Company ID not found for notifications subscription');
      return;
    }

    this.isSubscribed = true;
    const channelName = `Notifications.${userId}`;

    this.echo.private(channelName)
      .notification((notification: Notification) => {
        this.notificationsSubject.next(notification);
      })
      .error((err: any) => {
        console.error('Error subscribing to notifications channel:', err);
        this.isSubscribed = false;
      });
  }

  getNotifications(
    page: number = 1,
    perPage: number = 10,
    type?: 'unread' | 'read'
  ): Observable<any> {
    let params: any = { page, per_page: perPage };
    if (type) {
      params.type = type;
    }

    return this.http
      .get(`${environment.apiUrl}/api/v1/notifications`, {
        params,
        withCredentials: true,
      })
      .pipe(
        tap((response) => console.log('Fetched notifications:', response)),
        catchError((error) => {
          console.error('Error fetching notifications:', error);
          throw error;
        })
      );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/v1/notifications/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/v1/notifications/read-all`,
      {}
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/api/v1/notifications/${notificationId}`
    );
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/v1/notifications`);
  }
}

