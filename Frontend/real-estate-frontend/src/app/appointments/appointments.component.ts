import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { 
  faEye, faTimes, faPlus, faCalendarAlt, 
  faBed, faBath, faRulerCombined, faLayerGroup, 
  faCar, faHome 
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';

interface Booking {
  id: number;
  property_id: number;
  user_id: number;
  booking_date: string;
  visit_date: string | null;
  status: 'pending' | 'confirmed' | 'canceled';
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    floors: number;
    garage: number;
    year_built: number;
    description: string;
    images: string[];
    user?: {
      name: string;
      email: string;
      phone: string;
      
    };
  };
}

interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  images: string[];
}
interface ApiResponse<T> {
  bookings: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
  };
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  standalone: true
})
export class AppointmentsComponent implements OnInit {
  // Font Awesome Icons
  faEye = faEye;
  faTimes = faTimes;
  faPlus = faPlus;
  faCalendarAlt = faCalendarAlt;
  faBed = faBed;
  faBath = faBath;
  faRulerCombined = faRulerCombined;
  faLayerGroup = faLayerGroup;
  faCar = faCar;
  faHome = faHome;
  
  appointments: Booking[] = [];
  filteredAppointments: Booking[] = [];

  properties: Property[] = [];
  selectedAppointment: any = null; // تأكد من أن هذه القيمة تبدأ بـ null
  
  currentFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  isSubmitting: boolean = false;
  paginationInfo: any;

  appointmentForm: FormGroup;
Math: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.appointmentForm = this.fb.group({
      property_id: ['', Validators.required],
      booking_date: ['', Validators.required],
      visit_date: ['']
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadProperties();
  }
  loadAppointments(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<ApiResponse<Booking>>('http://localhost:8000/api/v1/bookings', { headers }).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.appointments = response.bookings.data || [];
        this.paginationInfo = {
          current_page: response.bookings.current_page,
          per_page: response.bookings.per_page,
          total_items: response.bookings.total,
          total_pages: response.bookings.last_page
        };
        this.filterAppointments(this.currentFilter);
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.toastr.error('Failed to load appointments', 'Error');
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }
  
  loadProperties(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://localhost:8000/api/v1/properties', { headers }).subscribe({
      next: (response) => {
        this.properties = response.data || []; // Adjust based on actual API response
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.toastr.error('Failed to load properties', 'Error');
      }
    });
  }


  filterAppointments(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    
    if (filter === 'all') {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(
        appt => appt.status === filter
      );
    }
  }

  viewAppointmentDetails(appointment: Booking): void {
    this.selectedAppointment = appointment;
    this.modalService.open(document.getElementById('appointmentDetailsModal'), { size: 'lg' });
  }

  openAddAppointmentModal(): void {
    this.modalService.open(document.getElementById('addAppointmentModal'));
  }

  submitAppointment(): void {
    if (this.appointmentForm.invalid) return;

    this.isSubmitting = true;
    const headers = this.authService.getAuthHeaders();
    const formData = this.appointmentForm.value;

    this.http.post<Booking>('http://localhost:8000/api/v1/bookings', formData, { headers }).subscribe({
      next: (response) => {
        this.toastr.success('Appointment scheduled successfully', 'Success');
        this.modalService.dismissAll();
        this.appointmentForm.reset();
        this.loadAppointments();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error scheduling appointment:', err);
        this.toastr.error('Failed to schedule appointment', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  cancelAppointment(appointment: Booking): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const headers = this.authService.getAuthHeaders();
      
      this.http.patch<Booking>(`http://localhost:8000/api/v1/bookings/${appointment.id}/status`, 
        { status: 'canceled' }, 
        { headers }
      ).subscribe({
        next: (response) => {
          this.toastr.success('Appointment canceled successfully', 'Success');
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Error canceling appointment:', err);
          this.toastr.error('Failed to cancel appointment', 'Error');
        }
      });
    }
  }

  confirmAppointment(appointment: Booking): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.patch<Booking>(`http://localhost:8000/api/v1/bookings/${appointment.id}/status`, 
      { status: 'confirmed' }, 
      { headers }
    ).subscribe({
      next: (response) => {
        this.toastr.success('Appointment confirmed successfully', 'Success');
        this.modalService.dismissAll();
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
        this.toastr.error('Failed to confirm appointment', 'Error');
      }
    });
  }

  // Pagination methods
  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredAppointments.length) {
      this.currentPage++;
    }
  }
}