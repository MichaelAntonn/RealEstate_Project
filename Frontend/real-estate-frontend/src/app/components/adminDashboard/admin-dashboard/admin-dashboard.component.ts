import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../../../services/admin-auth.service'; // Updated import
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  userRole: string | null = null; // Store the user's role

  constructor(private adminAuthService: AdminAuthService) {} // Updated to use AdminAuthService

  ngOnInit(): void {
    // console.log('ngOnInit: Initializing admin dashboard');
    this.fetchUserRole(); // Fetch user role
  }

  // Fetch the current user's role from AdminAuthService
  fetchUserRole(): void {
    this.userRole = this.adminAuthService.getUserRole(); // Synchronous check first
    //console.log('Initial user role from service:', this.userRole);

    if (!this.userRole) {
      // If no role is cached, fetch it from the server
      this.adminAuthService.fetchUserRole().subscribe({
        next: (role: string | null) => {
          this.userRole = role;
          //console.log('Fetched user role:', this.userRole);
        },
        error: (error) => {
          console.error('Error fetching user role:', error);
          this.userRole = null;
        }
      });
    }
  }

  // Check if the user is a super-admin
  isSuperAdmin(): boolean {
    return this.userRole === 'super-admin';
  }
}
