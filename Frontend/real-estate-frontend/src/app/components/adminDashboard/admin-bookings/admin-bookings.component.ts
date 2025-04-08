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

  pendingLastPage: number = 1;
  confirmedLastPage: number = 1;
  canceledLastPage: number = 1;

  pendingTotal: number = 0;
  confirmedTotal: number = 0;
  canceledTotal: number = 0;

  isAdmin: boolean = false; // Set based on user role; adjust as needed

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadPendingBookings();
    this.loadConfirmedBookings();
    this.loadCanceledBookings();
  }

  loadPendingBookings(): void {
    this.dashboardService.getPendingBookings(this.pendingPage).subscribe({
      next: (response) => {
        console.log('Raw API response for pending:', response);
        const bookingsData = response.bookings || {};
        this.pendingBookings = bookingsData.data || [];
        this.pendingPage = bookingsData.current_page || 1;
        this.pendingLastPage = bookingsData.last_page || 1;
        this.pendingTotal = bookingsData.total || 0;
        console.log('Pending bookings assigned:', this.pendingBookings);
      },
      error: (error) => {
        console.error('Error fetching pending bookings:', error);
        this.pendingBookings = [];
      }
    });
  }

  loadConfirmedBookings(): void {
    this.dashboardService.getConfirmedBookings(this.confirmedPage).subscribe({
      next: (response) => {
        console.log('Raw API response for confirmed:', response);
        const bookingsData = response.bookings || {};
        this.confirmedBookings = bookingsData.data || [];
        this.confirmedPage = bookingsData.current_page || 1;
        this.confirmedLastPage = bookingsData.last_page || 1;
        this.confirmedTotal = bookingsData.total || 0;
        console.log('Confirmed bookings assigned:', this.confirmedBookings);
      },
      error: (error) => {
        console.error('Error fetching confirmed bookings:', error);
        this.confirmedBookings = [];
      }
    });
  }

  loadCanceledBookings(): void {
    this.dashboardService.getCanceledBookings(this.canceledPage).subscribe({
      next: (response) => {
        console.log('Raw API response for canceled:', response);
        const bookingsData = response.bookings || {};
        this.canceledBookings = bookingsData.data || [];
        this.canceledPage = bookingsData.current_page || 1;
        this.canceledLastPage = bookingsData.last_page || 1;
        this.canceledTotal = bookingsData.total || 0;
        console.log('Canceled bookings assigned:', this.canceledBookings);
      },
      error: (error) => {
        console.error('Error fetching canceled bookings:', error);
        this.canceledBookings = [];
      }
    });
  }

  updateBookingStatus(bookingId: number, status: string): void {
    this.dashboardService.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        console.log(`Booking ${bookingId} updated to ${status}`);
        this.loadPendingBookings();
        this.loadConfirmedBookings();
        this.loadCanceledBookings();
      },
      error: (error) => console.error(`Error updating booking ${bookingId}:`, error)
    });
  }

  prevPage(status: string): void {
    if (status === 'pending' && this.pendingPage > 1) {
      this.pendingPage--;
      this.loadPendingBookings();
    } else if (status === 'confirmed' && this.confirmedPage > 1) {
      this.confirmedPage--;
      this.loadConfirmedBookings();
    } else if (status === 'canceled' && this.canceledPage > 1) {
      this.canceledPage--;
      this.loadCanceledBookings();
    }
  }

  nextPage(status: string): void {
    if (status === 'pending' && this.pendingPage < this.pendingLastPage) {
      this.pendingPage++;
      this.loadPendingBookings();
    } else if (status === 'confirmed' && this.confirmedPage < this.confirmedLastPage) {
      this.confirmedPage++;
      this.loadConfirmedBookings();
    } else if (status === 'canceled' && this.canceledPage < this.canceledLastPage) {
      this.canceledPage++;
      this.loadCanceledBookings();
    }
  }

  goToPage(status: string, page: number): void {
    if (status === 'pending') {
      this.pendingPage = page;
      this.loadPendingBookings();
    } else if (status === 'confirmed') {
      this.confirmedPage = page;
      this.loadConfirmedBookings();
    } else if (status === 'canceled') {
      this.canceledPage = page;
      this.loadCanceledBookings();
    }
  }

  getPageNumbers(status: string): number[] {
    let lastPage: number;
    if (status === 'pending') lastPage = this.pendingLastPage;
    else if (status === 'confirmed') lastPage = this.confirmedLastPage;
    else lastPage = this.canceledLastPage;
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }
}