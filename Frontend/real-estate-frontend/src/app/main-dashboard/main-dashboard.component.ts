import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
    FontAwesomeModule,
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
  profileImage: string = 'assets/1.png';
  constructor(private authService: AuthService) {
    this.getUsername();

  }
  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? 
      `${user.first_name} ${user.last_name}` : 'User';
    
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
    if (sidebar) {
      sidebar.classList.toggle('show');
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
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
  logout() {
    this.authService.logout();
    this.username = 'User'; // Reset username on logout
  }

}