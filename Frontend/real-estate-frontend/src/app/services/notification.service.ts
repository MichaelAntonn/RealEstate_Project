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

    // الحصول على التوكن (لإرساله إذا كان مطلوبًا)
    private getToken(): string | null {
      return this.authService.getToken() || this.companyAuthService.getToken();
    }

    // تهيئة Echo وتوصيلها بـ Pusher وتهيئة المصادقة عبر الكوكيز
    private initializeEcho(): void {
      (window as any).Pusher = Pusher;

      // إرسال طلب للحصول على الكوكيز الخاصة بـ Sanctum
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
            console.log(`${environment.apiUrl}/broadcasting/auth`);

            // تهيئة Echo
            this.echo = new Echo({
              broadcaster: 'pusher',
              key: environment.pusher.key,
              cluster: environment.pusher.cluster,
              forceTLS: true,
              authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
              withCredentials: true // التأكد من إرسال الكوكيز مع كل طلب
            });

            // طباعة الـ Echo و Channel للتأكد من أنهما تم تهيئتهما بشكل صحيح
            console.log('Echo initialized successfully:', this.echo);
            console.log('Echo Channel:', this.echo.channel);
          } catch (error) {
            console.error('Echo initialization error:', error);
          }
        },
        error: (err) => {
          console.error('CSRF Cookie error:', err);
        }
      });

      // طباعة إعدادات Pusher
      console.log('Pusher Key:', environment.pusher.key);
      console.log('Pusher Cluster:', environment.pusher.cluster);
    }

    // تهيئة الاشتراك في القناة الخاصة بالتنبيهات
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
      const channelName = `Notifications.${userId}`;

      // الاشتراك في القناة الخاصة
      this.echo.private(channelName)
        .notification((notification: Notification) => {
          this.notificationsSubject.next(notification);
        })
        .error((error: any) => {
          console.error('Pusher error:', error);
          this.isSubscribed = false;
        });

      // طباعة القناة للاطمئنان أنها تم الاشتراك فيها بشكل صحيح
      console.log('Subscribed to channel:', channelName);
    }

    // الحصول على التنبيهات من الـ API
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

    // تعيين تنبيه كـ "مقروء"
    markAsRead(notificationId: string): Observable<any> {
      return this.http.put(`${environment.apiUrl}/api/v1/notifications/${notificationId}/read`, {});
    }

    // تعيين كل التنبيهات كـ "مقروءة"
    markAllAsRead(): Observable<any> {
      return this.http.put(`${environment.apiUrl}/api/v1/notifications/read-all`, {});
    }

    // حذف تنبيه
    deleteNotification(notificationId: string): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/api/v1/notifications/${notificationId}`);
    }

    // حذف كل التنبيهات
    deleteAllNotifications(): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/api/v1/notifications`);
    }
}
