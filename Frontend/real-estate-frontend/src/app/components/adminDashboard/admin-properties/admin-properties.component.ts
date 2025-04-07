import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-property-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit {
  pendingProperties: any[] = [];
  acceptedProperties: any[] = [];
  rejectedProperties: any[] = [];
  searchQuery: string = '';         // For pending properties
  acceptedSearchQuery: string = ''; // For accepted properties
  rejectedSearchQuery: string = ''; // For rejected properties
  selectedProperty: any = null;     // For modal display

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.dashboardService.getPendingProperties().subscribe((response) => {
      this.pendingProperties = response.properties.data || response.data;
    });

    this.dashboardService.getAcceptedProperties().subscribe((response) => {
      this.acceptedProperties = response.properties.data || response.data;
    });

    this.dashboardService.getRejectedProperties().subscribe((response) => {
      this.rejectedProperties = response.properties.data || response.data;
    });
  }

  // Filter pending properties
  get filteredPendingProperties(): any[] {
    if (!this.searchQuery) {
      return this.pendingProperties;
    }
    return this.pendingProperties.filter(property =>
      property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Filter accepted properties
  get filteredAcceptedProperties(): any[] {
    if (!this.acceptedSearchQuery) {
      return this.acceptedProperties;
    }
    return this.acceptedProperties.filter(property =>
      property.title.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase())
    );
  }

  // Filter rejected properties
  get filteredRejectedProperties(): any[] {
    if (!this.rejectedSearchQuery) {
      return this.rejectedProperties;
    }
    return this.rejectedProperties.filter(property =>
      property.title.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase())
    );
  }

  viewProperty(property: any): void {
    this.dashboardService.getProperty(property.id).subscribe({
      next: (response) => {
        this.selectedProperty = response.property; // Set detailed property data
        console.log('Property details loaded:', this.selectedProperty);
      },
      error: (error) => {
        console.error('Error fetching property details:', error);
        this.selectedProperty = { ...property }; // Fallback to basic data if API fails
      }
    });
  }

  acceptProperty(id: number): void {
    this.dashboardService.acceptProperty(id).subscribe({
      next: () => {
        this.loadProperties();
        this.closeModal();
      },
      error: (error) => console.error('Error accepting property:', error)
    });
  }

  rejectProperty(id: number): void {
    this.dashboardService.rejectProperty(id).subscribe({
      next: () => {
        this.loadProperties();
        this.closeModal();
      },
      error: (error) => console.error('Error rejecting property:', error)
    });
  }

  deleteProperty(id: number): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.dashboardService.deleteProperty(id).subscribe({
        next: () => {
          this.loadProperties();
          this.closeModal();
        },
        error: (error) => console.error('Error deleting property:', error)
      });
    }
  }

  closeModal(): void {
    this.selectedProperty = null;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }

  // Helper method to parse and format amenities
  getAmenities(amenities: string): string {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed.join(', ') : 'None';
    } catch (e) {
      console.error('Error parsing amenities:', e);
      return 'None';
    }
  }
}