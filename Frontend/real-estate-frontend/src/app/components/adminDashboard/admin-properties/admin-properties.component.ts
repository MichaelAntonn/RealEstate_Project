import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit {
  pendingProperties: any[] = [];
  acceptedProperties: any[] = [];
  rejectedProperties: any[] = [];
  searchQuery: string = '';
  acceptedSearchQuery: string = '';
  rejectedSearchQuery: string = '';
  selectedProperty: any = null;
  reviews: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.dashboardService.getPendingProperties().subscribe((response) => {
      this.pendingProperties = response.properties?.data || response.data || [];
    });

    this.dashboardService.getAcceptedProperties().subscribe((response) => {
      this.acceptedProperties = response.properties?.data || response.data || [];
    });

    this.dashboardService.getRejectedProperties().subscribe((response) => {
      this.rejectedProperties = response.properties?.data || response.data || [];
    });
  }

  get filteredPendingProperties(): any[] {
    if (!this.searchQuery) return this.pendingProperties;
    return this.pendingProperties.filter(property =>
      property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get filteredAcceptedProperties(): any[] {
    if (!this.acceptedSearchQuery) return this.acceptedProperties;
    return this.acceptedProperties.filter(property =>
      property.title.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase())
    );
  }

  get filteredRejectedProperties(): any[] {
    if (!this.rejectedSearchQuery) return this.rejectedProperties;
    return this.rejectedProperties.filter(property =>
      property.title.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase())
    );
  }

  viewProperty(property: any): void {
    console.log('Viewing property ID:', property.id);
    this.dashboardService.getProperty(property.id).subscribe({
      next: (response) => {
        this.selectedProperty = response.property || response.data;
        console.log('Selected property ID:', this.selectedProperty.id);
        this.loadReviews(this.selectedProperty.id);
      },
      error: (error) => {
        console.error('Error fetching property details:', error);
        this.selectedProperty = { ...property };
        this.loadReviews(property.id);
      }
    });
  }

  loadReviews(propertyId: number): void {
    this.dashboardService.getPropertyReviews(propertyId).subscribe({
      next: (response) => {
        console.log('Raw API response:', response);
        this.reviews = Array.isArray(response) ? response : (response.reviews || response.data || []);
        console.log('Assigned reviews:', this.reviews);
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.reviews = [];
      }
    });
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.dashboardService.deleteReview(reviewId).subscribe({
        next: () => {
          this.loadReviews(this.selectedProperty.id);
          console.log(`Review ${reviewId} deleted successfully`);
        },
        error: (error) => console.error('Error deleting review:', error)
      });
    }
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
    this.reviews = [];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }

  getAmenities(amenities: string): string {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed.join(', ') : 'None';
    } catch (e) {
      console.error('Error parsing amenities:', e);
      return 'None';
    }
  }

  getReviewerImage(review: any): string {
    const baseUrl = 'http://localhost:8000/storage/';
    const placeholder = 'https://via.placeholder.com/50'; // Fake image (50x50 px)
    if (review.anonymous_review || !review.user?.profile_image) {
      return placeholder;
    }
    return `${baseUrl}${review.user.profile_image}`;
  }
}