import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrls: ['./dashboard-navbar.component.css']
})
export class DashboardNavbarComponent implements OnInit {
  egyptTime: Date = new Date();
  userName: string = 'Guest'; // Default fallback name
  userImage: string = 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png'; // Default image

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.updateTime();
    this.fetchUserDetails();
  }

  updateTime(): void {
    setInterval(() => {
      this.egyptTime = new Date();
    }, 1000);
  }

  fetchUserDetails(): void {
    if (this.adminAuthService.isLoggedIn()) {
      this.adminAuthService.getUserProfile().subscribe({
        next: (profile) => {
          this.userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin User';
          this.userImage = profile.profile_image || this.userImage; // Fallback to default if null
          console.log('User details fetched:', { name: this.userName, image: this.userImage });
        },
        error: (error) => {
          console.error('Error in fetchUserDetails:', error);
          this.userName = 'Admin User'; // Ensure fallback on unexpected errors
        }
      });
    } else {
      console.log('User not logged in, using default values');
    }
  }

  logout(): void {
    this.adminAuthService.logout();
    console.log('User logged out');
  }
}