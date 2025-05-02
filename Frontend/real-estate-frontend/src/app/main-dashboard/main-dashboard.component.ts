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
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

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
  faCreditCard = faCreditCard;

  username: string = '';
  darkMode: boolean = false;
  notificationsCount: number = 0;
  private subscription: Subscription = new Subscription();
  profileImage: string = 'assets/1.png';
  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.getUsername();
  }

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      () => {
        this.loadNotificationsCount();
      }
    );

    this.loadNotificationsCount();

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUserInfo(user);
      }
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
        this.notificationsCount =
          response.data?.data?.length || response.data?.length || 0;
      },
      error: (error) => {
        console.error('Error fetching notifications count:', error);
      },
    });
  }

  getUsername(): void {
    const user = this.authService.getUser();
    this.username =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'User';

    if (user?.profile_image) {
      this.profileImage = user.profile_image.startsWith('data:image')
        ? user.profile_image
        : user.profile_image;
    } else {
      this.profileImage = 'assets/1.png';
    }
  }

  updateUserInfo(user: any): void {
    this.username =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'User';

    if (user?.profile_image) {
      this.profileImage = user.profile_image.startsWith('data:image')
        ? user.profile_image
        : user.profile_image;
    } else {
      this.profileImage = 'assets/1.png';
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
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}