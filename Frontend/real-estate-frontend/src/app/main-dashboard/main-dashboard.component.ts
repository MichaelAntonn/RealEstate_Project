import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterOutlet,
  RouterLink,
  Router,
} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import {
  faBars,
  faBell,
  faHome,
  faUser,
  faBuilding,
  faHeart,
  faCalendarAlt,
  faEnvelope,
  faChartLine,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { NotificationsComponent } from '../components/notifications/notifications.component';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    RouterLink,
    FontAwesomeModule,
    NotificationsComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MainDashboardComponent {
  // Font Awesome Icons
  faBars = faBars;
  faBell = faBell;
  faHome = faHome;
  faUser = faUser;
  faBuilding = faBuilding;
  faHeart = faHeart;
  faCalendarAlt = faCalendarAlt;
  faEnvelope = faEnvelope;
  faChartLine = faChartLine;
  faCog = faCog;
  faSignOutAlt = faSignOutAlt;

  username: string = '';
  darkMode: boolean = false;
  notificationsCount: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load username
    this.loadUsername();

    // Initialize notifications
    // this.notificationService.initNotifications();
    setTimeout(() => {
      this.notificationService.initNotifications();
    }, 1000);
    // Load notifications count
    this.loadNotificationsCount();

    // Subscribe to real-time notifications
    this.subscription = this.notificationService.notifications$.subscribe(() => {
      this.loadNotificationsCount();
    });
  }

  loadUsername() {
    const user = this.authService.getUser();
    this.username = user
      ? user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.name || 'User'
      : 'Guest';
  }

  loadNotificationsCount() {
    this.notificationService.getNotifications(1, 10, 'unread').subscribe({
      next: (response) => {
        this.notificationsCount = response.data?.data?.length || response.data?.length || 0;
        console.log('Notifications count:', this.notificationsCount);
      },
      error: (error) => {
        console.error('Error fetching notifications count:', error);
      }
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('show');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
