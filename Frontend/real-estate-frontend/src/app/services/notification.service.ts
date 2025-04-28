import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
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
  private echo: Echo<any>;
  private notificationsSubject = new Subject<Notification>();
  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private companyAuthService: CompanyAuthService
  ) {
    (window as any).Pusher = Pusher;
    const token = this.authService.getToken() || this.companyAuthService.getToken();
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: environment.pusher.key,
      cluster: environment.pusher.cluster,
      forceTLS: true,
      authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      }
    });
  }

  initNotifications() {
    const user = this.authService.getUser();
    const company = this.companyAuthService.getCompanyData();
    const userId = user ? user.id : company ? company.id : 1; // Fallback to 1
    console.log('Initializing notifications for userId:', userId);
    this.echo
      .private(`App.Models.User.${userId}`)
      .notification((notification: Notification) => {
        console.log('Received notification:', notification);
        this.notificationsSubject.next(notification);
      });
  }

  getNotifications(page: number = 1, perPage: number = 10, type?: 'unread' | 'read'): Observable<any> {
    let params: any = { page, per_page: perPage };
    if (type) {
      params.type = type;
    }
    return this.http.get(`${environment.apiUrl}/v1/notifications`, { params });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/v1/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${environment.apiUrl}/v1/notifications/read-all`, {});
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/v1/notifications/${notificationId}`);
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/v1/notifications`);
  }
}
