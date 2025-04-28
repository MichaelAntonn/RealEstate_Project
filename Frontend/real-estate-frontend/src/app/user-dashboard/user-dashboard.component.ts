import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from './user-dashboard.service';
import { Property } from './models/property.model';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CommonModule } from '@angular/common';
import { DashboardChartComponent } from './components/dashboard-chart/dashboard-chart.component';
import { StatsChartComponent } from './components/stats-chart/stats-chart.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule,
    DashboardChartComponent,
    StatsChartComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent implements OnInit {
  // FontAwesome Icons
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

  // Dashboard statistics
  listedCount: number = 0;
  bookedCount: number = 0;
  soldCount: number = 0;
  averageRating: string = '0.0';
  givenReviews: number = 0;
  receivedReviews: number = 0;

  properties: Property[] = [];
  username: string = '';
  darkMode: boolean = false;

  // UI State
  isEditingProperty: boolean = false;
  isEditingAppointment: boolean = false;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  dataLoaded: boolean = false; // ✅ Fix for data disappearance issue

  currentProperty: Property = {
    title: '',
    slug: '',
    description: '',
    type: 'apartment',
    price: 0,
    city: '',
    district: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    listing_type: 'for_sale',
    construction_status: 'available',
    property_code: '',
    location: '',
    status: '',
    image: ''
  };

  constructor(
    private dashboardService: UserDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUsername();
    this.loadDashboardData();
    this.loadProperties();
  }

  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User';
  }

  loadDashboardData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const data = res.dashboard;
        this.listedCount = data.properties.total;
        this.bookedCount = data.bookings.upcoming;
        this.soldCount = data.bookings.completed;
        this.averageRating = data.reviews.average_rating;
        this.givenReviews = data.reviews.given;
        this.receivedReviews = data.reviews.received;

        // ✅ Data is ready to display
        this.dataLoaded = true;
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
      }
    });

    // Note: You may omit this if getDashboardData covers all necessary data
    // Or you can combine both results
    // this.dashboardService.getStatistics().subscribe({
    //   next: (stats) => {
    //     ...
    //   },
    //   error: ...
    // });
  }

  loadProperties(): void {
    this.dashboardService.getProperties().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.properties = data;
        } else {
          console.error('Received data is not an array:', data);
          this.properties = [];
        }
      },
      (error) => {
        console.error('Error fetching properties:', error);
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

  private updateStats(): void {
    this.listedCount = this.properties.length;
    this.bookedCount = this.properties.filter(p => p.status === 'Under Contract').length;
    this.soldCount = this.properties.filter(p => p.status === 'Sold').length;
  }

  private showSuccess(message: string): void {
    this.showSuccessMessage = true;
    this.successMessage = message;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }
}
