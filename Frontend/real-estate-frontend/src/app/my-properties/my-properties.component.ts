import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSpinner, 
  faCheckCircle, faTimesCircle, faClock,
  faSearch, faFilter, faSync
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { faBed } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms'; 
import { faBath } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    FontAwesomeModule,
    FormsModule 
  ],
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.css']
})
export class MyPropertiesComponent implements OnInit {
  faBed = faBed; 
  faBath = faBath; 

  // Font Awesome Icons
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faSpinner = faSpinner;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faClock = faClock;
  faSearch = faSearch;
  faFilter = faFilter;
  faSync = faSync;

  // Component properties
  properties: any[] = [];
  filteredProperties: any[] = [];
  isLoading = true;
  searchTerm = '';
  currentStatus = 'all';
  apiUrl = 'http://localhost:8000/api/v1/properties';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProperties();
  }
  loadProperties(): void {
    this.isLoading = true;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    let endpoint = `${this.apiUrl}/status/pending`;
    
    if (this.currentStatus === 'accepted') {
      endpoint = `${this.apiUrl}/status/accepted`;
    } else if (this.currentStatus === 'rejected') {
      endpoint = `${this.apiUrl}/status/rejected`;
    }
  
    this.http.get<any>(endpoint, { headers }).subscribe({
      next: (response) => {
        this.properties = response.properties?.data || [];
        this.filteredProperties = [...this.properties];
        this.isLoading = false;
        
        if (this.properties.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Properties Found',
            html: 'No properties found. <a href="http://localhost:4200/#/add-property" style="color: #3085d6">Add a new property</a> to get started.',
            confirmButtonColor: '#3085d6',
            backdrop: `
              rgba(0,0,123,0.4)
              url("/assets/images/nyan-cat.gif")
              left top
              no-repeat
            `
          });
        }
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Loading Failed',
          text: 'Failed to load properties. Please try again later.',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  filterProperties(): void {
    if (!this.searchTerm) {
      this.filteredProperties = [...this.properties];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredProperties = this.properties.filter(property => 
      property.title.toLowerCase().includes(term) || 
      property.property_code.toLowerCase().includes(term)
    );
  }

  deleteProperty(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.authService.getToken()}`
        });

        this.http.delete(`${this.apiUrl}/${id}`, { headers }).subscribe({
          next: () => {
            this.properties = this.properties.filter(p => p.id !== id);
            this.filteredProperties = this.filteredProperties.filter(p => p.id !== id);
            
            Swal.fire(
              'Deleted!',
              'Your property has been deleted.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting property:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the property.',
              'error'
            );
          }
        });
      }
    });
  }

  getStatusIcon(status: string): any {
    switch (status) {
      case 'accepted': return { icon: faCheckCircle, color: 'text-success' };
      case 'rejected': return { icon: faTimesCircle, color: 'text-danger' };
      default: return { icon: faClock, color: 'text-warning' };
    }
  }

  getPropertyTypeClass(type: string): string {
    switch (type) {
      case 'land': return 'bg-land';
      case 'apartment': return 'bg-apartment';
      case 'villa': return 'bg-villa';
      case 'office': return 'bg-office';
      default: return 'bg-secondary';
    }
  }

  refreshProperties(): void {
    this.loadProperties();
  }

  setStatusFilter(status: string): void {
    this.currentStatus = status;
    this.loadProperties();
  }
}