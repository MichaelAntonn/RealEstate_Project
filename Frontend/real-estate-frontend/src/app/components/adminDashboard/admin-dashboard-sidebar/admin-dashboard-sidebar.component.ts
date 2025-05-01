import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './admin-dashboard-sidebar.component.html',
  styleUrls: ['./admin-dashboard-sidebar.component.css']
})
export class AdminDashboardSidebarComponent implements OnInit {
  userRole: string | null = null;

  constructor(private adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.fetchUserRole();
  }

  fetchUserRole(): void {
    this.userRole = this.adminAuthService.getUserRole();
    // console.log('Initial user role from service:', this.userRole);

    if (!this.userRole) {
      this.adminAuthService.fetchUserRole().subscribe({
        next: (role: string | null) => {
          this.userRole = role;
          console.log('Fetched user role:', this.userRole);
        },
        error: (error) => {
          console.error('Error fetching user role:', error);
          this.userRole = null;
        }
      });
    }
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'super-admin';
  }
}
