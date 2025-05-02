import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { NotificationService } from '../../../services/notification.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { NotificationsComponent } from '../../notifications/notifications.component';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, NotificationsComponent, FontAwesomeModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrls: ['./dashboard-navbar.component.css'],
})
export class DashboardNavbarComponent implements OnInit, OnDestroy {
  faBell = faBell;
  egyptTime: Date = new Date();
  userName: string = 'Guest';
  userImage: string = 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png';
  notificationsCount: number = 0;
  private subscriptions = new Subscription(); // لإدارة الاشتراكات

  constructor(
    private adminAuthService: AdminAuthService,
    private notificationService: NotificationService // أضف الخدمة هنا
  ) {}

  ngOnInit(): void {
    this.updateTime();
    this.fetchUserDetails();
    this.setupNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // تنظيف الاشتراكات
  }

  private setupNotifications(): void {
    // تحميل العدد الأولي
    this.loadNotificationsCount();

    // الاشتراك في تحديثات الإشعارات
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe({
        next: () => this.loadNotificationsCount(),
        error: (err) =>
          console.error('Error in notifications subscription:', err),
      })
    );
  }

  loadNotificationsCount(): void {
    this.subscriptions.add(
      this.notificationService.getNotifications(1, 10, 'unread').subscribe({
        next: (response) => {
          console.log('API Response for notifications:', response);
          this.notificationsCount =
            response.data?.data?.length || response.data?.length || 0;
          console.log(this.notificationsCount);
        },
        error: (error) => {
          console.error('Error fetching notifications count:', error);
        },
      })
    );
  }

  updateTime(): void {
    setInterval(() => {
      this.egyptTime = new Date();
    }, 1000);
  }

  fetchUserDetails(): void {
    if (this.adminAuthService.isLoggedIn()) {
      this.subscriptions.add(
        this.adminAuthService.getUserProfile().subscribe({
          next: (profile) => {
            this.userName =
              `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
              'Admin User';
            this.userImage = profile.profile_image || this.userImage;
          },
          error: (error) => {
            console.error('Error in fetchUserDetails:', error);
            this.userName = 'Admin User';
          },
        })
      );
    }
  }

  logout(): void {
    this.adminAuthService.logout();
  }
}
