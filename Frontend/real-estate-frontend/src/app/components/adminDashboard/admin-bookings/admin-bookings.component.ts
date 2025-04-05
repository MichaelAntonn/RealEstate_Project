import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css'
})
export class AdminBookingsComponent {

  pendingBookings: any[] = [];
  confirmedBookings: any[] = [];
  canceledBookings: any[] = [];
  pendingPage: number = 1;
  confirmedPage: number = 1;
  canceledPage: number = 1;
  pendingTotal: number = 0;
  confirmedTotal: number = 0;
  canceledTotal: number = 0;
  pendingLastPage: number = 1;
  confirmedLastPage: number = 1;
  canceledLastPage: number = 1;
  bookingsPerPage: number = 5;
  isAdmin: boolean = false; // Track if user is admin/super-admin

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadBookings();
  }

  checkUserRole(): void {
    const userType = localStorage.getItem('user_type'); // Adjust based on your auth setup
    this.isAdmin = userType === 'admin' || userType === 'super_admin';
  }

  loadBookings(): void {
    this.loadPendingBookings(this.pendingPage);
    this.loadConfirmedBookings(this.confirmedPage);
    this.loadCanceledBookings(this.canceledPage);
  }

  loadPendingBookings(page: number): void {
    this.dashboardService.getPendingBookings(page).subscribe((response) => {
      this.pendingBookings = response.data;
      this.pendingTotal = response.total;
      this.pendingLastPage = response.last_page;
      this.pendingPage = response.current_page;
    });
  }

  loadConfirmedBookings(page: number): void {
    this.dashboardService.getConfirmedBookings(page).subscribe((response) => {
      this.confirmedBookings = response.data;
      this.confirmedTotal = response.total;
      this.confirmedLastPage = response.last_page;
      this.confirmedPage = response.current_page;
    });
  }

  loadCanceledBookings(page: number): void {
    this.dashboardService.getCanceledBookings(page).subscribe((response) => {
      this.canceledBookings = response.data;
      this.canceledTotal = response.total;
      this.canceledLastPage = response.last_page;
      this.canceledPage = response.current_page;
    });
  }

  updateBookingStatus(id: number, status: string): void {
    this.dashboardService.updateBookingStatus(id, status).subscribe(() => {
      this.loadBookings();
    });
  }

  prevPage(section: string): void {
    if (section === 'pending' && this.pendingPage > 1) {
      this.loadPendingBookings(this.pendingPage - 1);
    } else if (section === 'confirmed' && this.confirmedPage > 1) {
      this.loadConfirmedBookings(this.confirmedPage - 1);
    } else if (section === 'canceled' && this.canceledPage > 1) {
      this.loadCanceledBookings(this.canceledPage - 1);
    }
  }

  nextPage(section: string): void {
    if (section === 'pending' && this.pendingPage < this.pendingLastPage) {
      this.loadPendingBookings(this.pendingPage + 1);
    } else if (section === 'confirmed' && this.confirmedPage < this.confirmedLastPage) {
      this.loadConfirmedBookings(this.confirmedPage + 1);
    } else if (section === 'canceled' && this.canceledPage < this.canceledLastPage) {
      this.loadCanceledBookings(this.canceledPage + 1);
    }
  }

  goToPage(section: string, page: number): void {
    if (page < 1 || page > this.getLastPage(section)) return;
    if (section === 'pending') {
      this.loadPendingBookings(page);
    } else if (section === 'confirmed') {
      this.loadConfirmedBookings(page);
    } else if (section === 'canceled') {
      this.loadCanceledBookings(page);
    }
  }

  getLastPage(section: string): number {
    return section === 'pending' ? this.pendingLastPage :
           section === 'confirmed' ? this.confirmedLastPage :
           this.canceledLastPage;
  }

  getPageNumbers(section: string): number[] {
    const lastPage = this.getLastPage(section);
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }
}