import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from './user-dashboard.service';
import { Property } from './models/property.model';
import { Appointment } from './models/appointment.model';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CommonModule } from '@angular/common';
import { DashboardChartComponent } from './components/dashboard-chart/dashboard-chart.component';
import { StatsChartComponent } from './components/stats-chart/stats-chart.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { 
  faBars, faBell, faHome, faUser, faBuilding, 
  faHeart, faCalendarAlt, faEnvelope, faChartLine, 
  faCog, faSignOutAlt, faSearch, faPlus 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    StatsCardsComponent,
    AppointmentsComponent,
    FormsModule,
    DashboardChartComponent,
    StatsChartComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent implements OnInit {
  // Icons
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
  faSearch = faSearch;
  faPlus = faPlus;

  // Data for stats and dashboard
  listedCount: number = 0;
  bookedCount: number = 0;
  soldCount: number = 0;
  averageRating: string = '0.0';
  givenReviews: number = 0;
  receivedReviews: number = 0;

  properties: Property[] = [];
  appointments: Appointment[] = [];
  darkMode: boolean = false;
  username: string = '';
  isEditingProperty: boolean = false;
  isEditingAppointment: boolean = false;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  // user-dashboard.component.ts
currentProperty: Property = {
  title: '',
  slug: '',
  description: '',
  type: 'apartment', // default value
  price: 0,
  city: '',
  district: '',
  area: 0,
  bedrooms: 0,
  bathrooms: 0,
  listing_type: 'for_sale', // default value
  construction_status: 'available', // default value
  property_code: '',
  // Optional properties
  location: '',
  status: '',
  image: ''
};
  currentAppointment: Appointment = {
    date: '',
    time: '',
    client: '',
    property_id: 0,
    purpose: 'Property Viewing',
    status: 'Scheduled'
  };

  constructor(
    private dashboardService: UserDashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.getUsername();
    this.loadProperties();
    this.loadAppointments();
  }

  getUsername(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User';
  }

  loadDashboardData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const data = res.dashboard;
        this.listedCount = data.properties.total;
        this.bookedCount = data.bookings.upcoming;
        this.soldCount = data.bookings.completed;
        this.averageRating = data.reviews.average_rating;
        this.givenReviews = data.reviews.given;
        this.receivedReviews = data.reviews.received;
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
      }
    });
  
    this.dashboardService.getStatistics().subscribe({
      next: (stats) => {
        this.listedCount = stats.properties.total;
        this.bookedCount = stats.bookings.upcoming;
        this.soldCount = stats.bookings.completed;
        this.averageRating = stats.reviews.average_rating;
        this.givenReviews = stats.reviews.given;
        this.receivedReviews = stats.reviews.received;
      },
      error: (error) => {
        console.error('Error fetching statistics data', error);
      }
    });
  }

  loadProperties(): void {
    this.dashboardService.getProperties().subscribe(
      (data: any) => {
        // تحقق إذا كانت البيانات هي مصفوفة
        if (Array.isArray(data)) {
          this.properties = data;  // إذا كانت مصفوفة، احفظها في المتغير
        } else {
          console.error('البيانات المستلمة ليست مصفوفة:', data);
          this.properties = [];  // في حال كانت البيانات ليست مصفوفة، يمكن تعيينها إلى مصفوفة فارغة
        }
      },
      (error) => {
        console.error('حدث خطأ أثناء جلب البيانات:', error);
      }
    );
  }
  
  loadAppointments(): void {
    this.dashboardService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments.map(appointment => ({
          ...appointment,
          property_title: appointment.property_title || 'Unknown' // التعامل مع حالة البيانات المفقودة
        }));
      },
      error: (error) => {
        console.error('Error fetching appointments', error);
      }
    });
  }
  
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show');
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Appointment CRUD Operations
openAddAppointmentModal(): void {
  this.isEditingAppointment = false;
  this.currentAppointment = {
    date: '',
    time: '',
    client: '',
    property_id: this.properties[0]?.id || 0, // تعيين القيمة الافتراضية بشكل صحيح
    purpose: 'Property Viewing',
    status: 'Scheduled'
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
        if (this.isEditingAppointment) {
          const index = this.appointments.findIndex(a => a.id === savedAppointment.id);
          if (index !== -1) {
            this.appointments[index] = savedAppointment;
          }
        } else {
          this.appointments.unshift(savedAppointment);
        }
        this.showSuccess(this.isEditingAppointment ? 'تم تحديث الموعد بنجاح!' : 'تم إضافة الموعد بنجاح!');
      },
      error: (err) => {
        console.error('Error saving appointment', err);
      }
    });
  }

  deleteAppointment(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      this.dashboardService.deleteAppointment(id).subscribe({
        next: () => {
          this.appointments = this.appointments.filter(a => a.id !== id);
          this.showSuccess('تم حذف الموعد بنجاح');
        },
        error: (err) => {
          console.error('Error deleting appointment', err);
        }
      });
    }
  }

  // Helper methods
  private updateStats(): void {
    this.listedCount = this.properties.length;
    this.bookedCount = this.properties.filter(p => p.status === 'Under Contract').length;
    this.soldCount = this.properties.filter(p => p.status === 'Sold').length;
  }

  private showSuccess(message: string): void {
    this.showSuccessMessage = true;
    this.successMessage = message;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }
}