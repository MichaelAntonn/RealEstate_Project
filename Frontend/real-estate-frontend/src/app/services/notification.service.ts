import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { merge, Observable, Subject, throwError } from 'rxjs';
import { tap, catchError, retry, filter, take } from 'rxjs/operators';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CompanyAuthService } from './company-auth.service';
import { AdminAuthService } from './admin-auth.service';

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
export class NotificationService implements OnDestroy {
  private echo: Echo<any> | null = null;
  private notificationsSubject = new Subject<Notification>();
  notifications$ = this.notificationsSubject.asObservable();
  private isSubscribed = false;
  private authToken: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private adminAuthService: AdminAuthService,
    private companyAuthService: CompanyAuthService
  ) {
    if (
      this.authService.isLoggedIn() ||
      this.adminAuthService.isLoggedIn() ||
      this.companyAuthService.isLoggedIn()
    ) {
    }

    // Still listen for user, admin, or company data changes
    merge(
      this.authService.currentUser$.pipe(
        filter((user) => {
          return !!user;
        })
      ),
      this.adminAuthService.currentAdmin$.pipe(
        filter((admin) => {
          return !!admin;
        })
      ),
      this.companyAuthService.currentCompany$.pipe(
        filter((company) => {
          return !!company;
        })
      )
    )
      .pipe(take(1))
      .subscribe(() => {
        this.initializeEcho();
      });
  }

  ngOnDestroy(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.isSubscribed = false;
    }
  }

  private initializeEcho(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      return;
  }
    if (
      !this.authService.isLoggedIn() &&
      !this.adminAuthService.isLoggedIn() &&
      !this.companyAuthService.isLoggedIn()
    ) {
      return;
    }

    (window as any).Pusher = Pusher;
    Pusher.logToConsole = true; // Enable Pusher logging for debugging

    this.http
      .get(`${environment.apiUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      })
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.authToken = this.getAuthToken();
          if (!this.authToken) {
            console.error('No authentication token found');
            return;
          }

          this.echo = new Echo({
            broadcaster: 'pusher',
            key: environment.pusher.key,
            cluster: environment.pusher.cluster,
            forceTLS: true,
            authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
            auth: {
              headers: {
                Authorization: `Bearer ${this.authToken}`,
                'X-CSRF-TOKEN': this.getCsrfToken(),
              },
            },
            withCredentials: true,
          });

          this.initNotifications();
        },
        error: (err) => console.error('Failed to fetch CSRF cookie:', err),
      });
  }

  private getAuthToken(): string | null {
    if (this.authService.isLoggedIn()) {
      const token = this.authService.getToken();
      return token;
    } else if (this.adminAuthService.isLoggedIn()) {
      const token = this.adminAuthService.getToken();
      return token;
    } else if (this.companyAuthService.isLoggedIn()) {
      const token = this.companyAuthService.getToken();
      return token;
    }
    return null;
  }

  private getCsrfToken(): string {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    return token ? decodeURIComponent(token) : '';
  }

  private getHeaders() {
    if (this.adminAuthService.isLoggedIn()) {
      const headers = this.adminAuthService.getAuthHeaders();
      return headers;
    }
    const headers = this.authService.getAuthHeaders();
    return headers;
  }

  initNotifications(): void {
    if (this.isSubscribed) {
      return;
    }
    if (!this.echo) {
      return;
    }

    const { userId, channelPrefix } = this.getChannelDetails();
    if (!userId) {
      console.error('User/Company/Admin ID not found for notification subscription');
      return;
    }

    this.isSubscribed = true;
    const channelName = `${channelPrefix}.${userId}`;

    this.echo
      .private(channelName)
      .notification((notification: Notification) => {
        this.notificationsSubject.next(notification);
      })
      .error((err: any) => {
        console.error('Error subscribing to notification channel:', err);
        this.isSubscribed = false;
      });
  }

  private getChannelDetails(): {
    userId: string | number | undefined;
    channelPrefix: string;
  } {
    let userId: string | number | undefined;
    let channelPrefix = 'Notifications';

    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      userId = user?.id;
    } else if (this.adminAuthService.isLoggedIn()) {
      const admin = this.adminAuthService.getAdmin();
      userId = admin?.id;
      // channelPrefix = 'AdminNotifications';
    } else if (this.companyAuthService.isLoggedIn()) {
      const company = this.companyAuthService.getCompanyData();
      userId = company?.id;
      // channelPrefix = 'CompanyNotifications';
    }
    return { userId, channelPrefix };
  }

  getNotifications(
    page: number = 1,
    perPage: number = 10,
    type?: 'unread' | 'read'
  ): Observable<any> {
    const params: any = { page, per_page: perPage, ...(type && { type }) };
    return this.http
      .get(`${environment.apiUrl}/api/v1/notifications`, {
        params,
        withCredentials: true,
        headers: this.getHeaders(),
      })
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('Error fetching notifications:', error);
          return throwError(() => error);
        })
      );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http
      .put(
        `${environment.apiUrl}/api/v1/notifications/${notificationId}/read`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(() => {
          this.notificationsSubject.next({
            id: notificationId,
            type: 'read',
            data: { message: 'Notification marked as read', url: '' },
            read_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          } as Notification);
        }),
        catchError((error) => {
          console.error('Error marking notification as read:', error);
          return throwError(() => error);
        })
      );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/v1/notifications/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http
      .delete(`${environment.apiUrl}/api/v1/notifications/${notificationId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error deleting notification:', error);
          return throwError(() => error);
        })
      );
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/v1/notifications`, {
      headers: this.getHeaders(),
    });
  }
}
