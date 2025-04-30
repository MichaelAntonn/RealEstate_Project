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
import { AuthService } from '../services/auth.service';
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
export class MainDashboardComponent implements OnInit, OnDestroy {
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
  profileImage: string = 'assets/1.png';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.getUsername();
  }

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(() => {
      this.loadNotificationsCount();
    });

    this.loadNotificationsCount();
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
        this.notificationsCount =
          response.data?.data?.length || response.data?.length || 0;
      },
      error: (error) => {
        console.error('Error fetching notifications count:', error);
      },
    });
  }

  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'User';

    // معالجة الصورة سواء كانت base64 أو مسارًا
    if (user?.profile_image) {
      if (user.profile_image.startsWith('data:image')) {
        this.profileImage = user.profile_image; // base64
      } else {
        this.profileImage = user.profile_image; // مسار ملف
      }
    } else {
      this.profileImage = 'assets/1.png'; // الصورة الافتراضية
    }
  }

  toggleSidebar(): void {
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

  // أضف هذه الدالة داخل class MainDashboardComponent
  updateProfileImage(newImage: string): void {
    // تحديث الصورة في localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.profile_image = newImage;
    localStorage.setItem('user', JSON.stringify(user));

    // تحديث العرض مباشرة
    this.getUsername();
  }
}
