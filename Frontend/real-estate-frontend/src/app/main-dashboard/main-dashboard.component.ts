import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import { 
  faBars, faBell, faHome, faUser, faBuilding, 
  faHeart, faCalendarAlt, faEnvelope, faChartLine, 
  faCog, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    RouterLink,
    FontAwesomeModule
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

  constructor() {
    this.getUsername();
  }

  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? 
      `${user.first_name} ${user.last_name}` : 'User';
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show');
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}