import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  admins: any[] = [];
  users: any[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  totalUsers: number = 0;
  lastPage: number = 1;
  usersPerPage: number = 5;
  isSuperAdmin: boolean = false; // Flag for super-admin check

  constructor(
    private dashboardService: DashboardService,
    private adminAuthService: AdminAuthService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadData();
  }

  checkUserRole(): void {
    const role = this.adminAuthService.getUserRole();
    this.isSuperAdmin = role === 'super-admin';
    console.log('User role:', role, 'Is Super Admin:', this.isSuperAdmin);
  }

  loadData(): void {
    if (this.isSuperAdmin) {
      this.loadAdmins(); // Only load admins for super-admin
    }
    this.loadUsers(this.currentPage);
  }

  loadAdmins(): void {
    this.dashboardService.getAdmins().subscribe({
      next: (response) => {
        this.admins = response.admins || response.data || [];
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.admins = [];
      }
    });
  }

  loadUsers(page: number): void {
    this.dashboardService.getUsers(page).subscribe({
      next: (response) => {
        this.users = response.users.data || [];
        this.totalUsers = response.users.total;
        this.lastPage = response.users.last_page;
        this.currentPage = response.users.current_page;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
      }
    });
  }

  get filteredUsers(): any[] {
    if (!this.searchQuery) {
      return this.users;
    }
    return this.users.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.dashboardService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
        },
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  deleteAdmin(id: number): void {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.dashboardService.deleteAdmin(id).subscribe({
        next: () => {
          this.loadAdmins();
        },
        error: (error) => console.error('Error deleting admin:', error)
      });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadUsers(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadUsers(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.loadUsers(page);
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }
}