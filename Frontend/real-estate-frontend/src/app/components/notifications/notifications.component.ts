import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { CompanyAuthService } from '../../services/company-auth.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();
  faCheck = faCheck;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private companyAuthService: CompanyAuthService
  ) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(() => {
      this.loadNotifications();
    });
    this.loadNotifications();
  }

  ngAfterViewInit() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
      dropdown.addEventListener('shown.bs.dropdown', () => {
        this.markAllAsRead();
      });
    }
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

  markAllAsRead() {
    this.notifications
      .filter(n => !n.read_at)
      .forEach(n => this.markAsRead(n.id));
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
