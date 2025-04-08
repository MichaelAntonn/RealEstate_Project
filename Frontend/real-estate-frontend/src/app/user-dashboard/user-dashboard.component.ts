import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from './user-dashboard.service';
import { Property } from './models/property.model';
import { Appointment } from './models/appointment.model';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { RecentPropertiesComponent } from './components/recent-properties/recent-properties.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { 
  faBars, faBell, faHome, faUser, faBuilding, 
  faHeart, faCalendarAlt, faEnvelope, faChartLine, 
  faCog, faSignOutAlt, faSearch, faPlus 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    StatsCardsComponent,
    RecentPropertiesComponent,
    AppointmentsComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent implements OnInit {
  // Icons
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
  faSearch = faSearch;
  faPlus = faPlus;

  // Data for stats and dashboard
  listedCount: number = 0;
  bookedCount: number = 0;
  soldCount: number = 0;
  averageRating: string = '0.0';
  givenReviews: number = 0;
  receivedReviews: number = 0;

  properties: Property[] = [];
  appointments: Appointment[] = [];
  darkMode: boolean = false;
  username: string = ''; // متغير جديد لاسم المستخدم

  constructor(
    private dashboardService: UserDashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.getUsername();
  }

  // دالة لاسترجاع اسم المستخدم من localStorage
  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'; // دمج الاسم الأول والاسم الأخير
  }

  loadDashboardData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  
    // استرجاع بيانات الداش بورد
    this.dashboardService.getDashboardData().subscribe(
      res => {
        const data = res.dashboard;
  
        this.listedCount = data.properties.total;
        this.bookedCount = data.bookings.upcoming;
        this.soldCount = data.bookings.completed;
  
        this.averageRating = data.reviews.average_rating;
        this.givenReviews = data.reviews.given;
        this.receivedReviews = data.reviews.received;

        // لو لسه في recent_properties و upcoming_appointments خليهم كده، أو احذفهم لو مش بيرجعوا
        this.properties = res.recent_properties || [];
        this.appointments = res.upcoming_appointments || [];
      },
      error => {
        console.error('Error fetching dashboard data', error);
      }
    );
  
    // استرجاع الإحصائيات الخاصة بالمستخدم
    this.dashboardService.getStatistics().subscribe(
      stats => {
        this.listedCount = stats.properties.total;
        this.bookedCount = stats.bookings.upcoming;
        this.soldCount = stats.bookings.completed;
        this.averageRating = stats.reviews.average_rating;
        this.givenReviews = stats.reviews.given;
        this.receivedReviews = stats.reviews.received;
      },
      error => {
        console.error('Error fetching statistics data', error);
      }
    );
  }
  
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show');
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
