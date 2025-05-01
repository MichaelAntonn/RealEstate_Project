// notifications.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { CompanyAuthService } from '../../services/company-auth.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private companyAuthService: CompanyAuthService
  ) {}

  ngOnInit() {
    // this.notificationService.initNotifications();
    this.subscription = this.notificationService.notifications$.subscribe(() => {
      // console.log('Notifications updated for admin');
      this.loadNotifications();
    });
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data?.data || [];
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read_at = new Date().toISOString();
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
