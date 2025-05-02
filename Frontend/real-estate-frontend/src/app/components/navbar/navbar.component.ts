import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    RouterModule,
    NotificationsComponent,
    FontAwesomeModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  faBell = faBell;
  isMenuCollapsed = true;
  defaultUserImage = 'assets/1.png';
  username = 'User';
  profileImage: string = this.defaultUserImage;
  private profileImageSubscription!: Subscription;
  notificationsCount: number = 0;
  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setupNotifications();

    this.profileImageSubscription = this.authService.profileImage$.subscribe(
      (newImage: string) => {
        this.profileImage = newImage || this.defaultUserImage;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // تنظيف الاشتراكات
    if (this.profileImageSubscription) {
      this.profileImageSubscription.unsubscribe();
    }
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
          console.log('Notifications Count:', this.notificationsCount);
        },
        error: (error) => {
          console.error('Error fetching notifications count:', error);
        },
      })
    );
  }

  loadUserData(): void {
    const user = this.authService.getUser();
    if (user) {
      this.updateUserInfo(user);
    }
  }

  private updateUserInfo(user: any): void {
    this.username =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'User';

    // معالجة الصورة سواء كانت base64 أو مسارًا
    if (user?.profile_image) {
      this.profileImage = user.profile_image.startsWith('data:image')
        ? user.profile_image
        : user.profile_image;
    } else {
      this.profileImage = this.defaultUserImage;
    }
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.resetUserData();
  }

  private resetUserData(): void {
    this.username = 'User';
    this.profileImage = this.defaultUserImage;
  }

  getUsername(): void {
    const user = this.authService.getUser();
    if (user) {
      this.updateUserInfo(user);
    }
  }

  getProfileImage(): string {
    const user = this.authService.getUser();
    if (!user) return this.defaultUserImage;

    if (user.profile_image) {
      return user.profile_image.startsWith('data:image')
        ? user.profile_image
        : user.profile_image;
    }
    return this.defaultUserImage;
  }

  getUserImage(): string {
    return this.profileImage;
  }
}
