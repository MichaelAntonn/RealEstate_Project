import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent {

  admins: any[] = [];
  users: any[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  totalUsers: number = 0;
  lastPage: number = 1;
  usersPerPage: number = 5;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadAdmins();
    this.loadUsers(this.currentPage);
  }

  loadAdmins(): void {
    this.dashboardService.getAdmins().subscribe((response) => {
      this.admins = response.admins;
    });
  }

  loadUsers(page: number): void {
    this.dashboardService.getUsers(page).subscribe((response) => {
      this.users = response.users.data;
      this.totalUsers = response.users.total;
      this.lastPage = response.users.last_page;
      this.currentPage = response.users.current_page;
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

  deleteAdmin(id: number): void {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.dashboardService.deleteAdmin(id).subscribe(() => {
        this.loadAdmins();
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.dashboardService.deleteUser(id).subscribe(() => {
        this.loadUsers(this.currentPage);
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
