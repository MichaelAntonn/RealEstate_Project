import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from './user-dashboard.service';
import { Property } from './models/property.model';
import { Appointment } from './models/appointment.model';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { RecentPropertiesComponent } from './components/recent-properties/recent-properties.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faBell, faHome, faUser, faBuilding, faHeart, faCalendarAlt, faEnvelope, faChartLine, faCog, faSignOutAlt, faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';

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
  styleUrls: ['./user-dashboard.component.css']
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

  // Data
  listedCount: number = 0;
  bookedCount: number = 0;
  soldCount: number = 0;
  properties: Property[] = [];
  appointments: Appointment[] = [];
  darkMode: boolean = false;

  constructor(private dashboardService: UserDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe(data => {
      this.listedCount = data.listed_properties;
      this.bookedCount = data.booked_properties;
      this.soldCount = data.sold_properties;
      this.properties = data.recent_properties;
      this.appointments = data.upcoming_appointments;
    });
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
}