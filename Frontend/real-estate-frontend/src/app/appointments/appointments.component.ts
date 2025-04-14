import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from '../user-dashboard/user-dashboard.service';
import { Appointment } from '../user-dashboard/models/appointment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faPlus, faPencilAlt, faTrash, faEye, faChevronLeft, faChevronRight, faCalendarAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule,RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  // Icons
  faSearch = faSearch;
  faPlus = faPlus;
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faEye = faEye;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCalendarAlt = faCalendarAlt;
  faSave = faSave;

  // Data
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  statusStats: any[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Modal
  isEditingAppointment: boolean = false;
  currentAppointment: Appointment = {
    date: '',
    time: '',
    client: '',
    phone: '',
    property_id: 0,
    purpose: 'Property Viewing',
    status: 'Scheduled',
    notes: ''
  };

  constructor(private dashboardService: UserDashboardService) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.dashboardService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments.map(appointment => ({
          ...appointment,
          property_title: appointment.property_title || 'N/A'
        }));
        this.filteredAppointments = [...this.appointments];
        this.updateStatusStats();
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error fetching appointments', error);
      }
    });
  }

  updateStatusStats(): void {
    const statusCounts = this.appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.statusStats = [
      { status: 'Scheduled', count: statusCounts['Scheduled'] || 0, icon: 'far fa-calendar-check', color: 'blue' },
      { status: 'Confirmed', count: statusCounts['Confirmed'] || 0, icon: 'fas fa-check-circle', color: 'green' },
      { status: 'Pending', count: statusCounts['Pending'] || 0, icon: 'fas fa-hourglass-half', color: 'yellow' },
      { status: 'Cancelled', count: statusCounts['Cancelled'] || 0, icon: 'fas fa-times-circle', color: 'red' },
      { status: 'Completed', count: statusCounts['Completed'] || 0, icon: 'fas fa-clipboard-check', color: 'purple' }
    ];
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedAppointments(): Appointment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openAddAppointmentModal(): void {
    this.isEditingAppointment = false;
    this.currentAppointment = {
      date: '',
      time: '',
      client: '',
      phone: '',
      property_id: 0,
      purpose: 'Property Viewing',
      status: 'Scheduled',
      notes: ''
    };
  }

  editAppointment(appointment: Appointment): void {
    this.isEditingAppointment = true;
    this.currentAppointment = { ...appointment };
  }

  saveAppointment(): void {
    if (!this.currentAppointment) return;

    const operation = this.isEditingAppointment && this.currentAppointment.id
      ? this.dashboardService.updateAppointment(this.currentAppointment.id, this.currentAppointment)
      : this.dashboardService.createAppointment(this.currentAppointment);

    operation.subscribe({
      next: (savedAppointment) => {
        this.loadAppointments(); // Refresh the data
      },
      error: (err) => {
        console.error('Error saving appointment', err);
      }
    });
  }

  deleteAppointment(id: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.dashboardService.deleteAppointment(id).subscribe({
        next: () => {
          this.loadAppointments(); // Refresh the data
        },
        error: (err) => {
          console.error('Error deleting appointment', err);
        }
      });
    }
  }

  // Add search functionality if needed
  searchAppointments(term: string): void {
    if (!term) {
      this.filteredAppointments = [...this.appointments];
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredAppointments = this.appointments.filter(appointment =>
        appointment.client.toLowerCase().includes(lowerTerm) ||
        (appointment.phone && appointment.phone.includes(term)) ||
        appointment.property_title?.toLowerCase().includes(lowerTerm) ||
        appointment.purpose.toLowerCase().includes(lowerTerm) ||
        appointment.status.toLowerCase().includes(lowerTerm)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }
}