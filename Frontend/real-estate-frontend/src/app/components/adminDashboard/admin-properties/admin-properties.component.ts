import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit, OnDestroy {
  pendingProperties: any[] = [];
  acceptedProperties: any[] = [];
  rejectedProperties: any[] = [];
  searchQuery: string = '';
  acceptedSearchQuery: string = '';
  rejectedSearchQuery: string = '';
  selectedProperty: any = null;
  reviews: any[] = [];

  // Pagination data
  pendingPagination: { current_page: number; last_page: number; total: number } = {
    current_page: 1,
    last_page: 1,
    total: 0
  };
  acceptedPagination: { current_page: number; last_page: number; total: number } = {
    current_page: 1,
    last_page: 1,
    total: 0
  };
  rejectedPagination: { current_page: number; last_page: number; total: number } = {
    current_page: 1,
    last_page: 1,
    total: 0
  };

  // Search subjects for debouncing
  private pendingSearchSubject = new Subject<string>();
  private acceptedSearchSubject = new Subject<string>();
  private rejectedSearchSubject = new Subject<string>();

  // Subscriptions made optional with ?
  private pendingSubscription?: Subscription;
  private acceptedSubscription?: Subscription;
  private rejectedSubscription?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadProperties();

    // Setup debouncing for each search input
    this.pendingSubscription = this.pendingSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => this.loadPendingProperties(1, search));

    this.acceptedSubscription = this.acceptedSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => this.loadAcceptedProperties(1, search));

    this.rejectedSubscription = this.rejectedSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => this.loadRejectedProperties(1, search));
  }

  ngOnDestroy(): void {
    // Unsubscribe safely with optional chaining
    this.pendingSubscription?.unsubscribe();
    this.acceptedSubscription?.unsubscribe();
    this.rejectedSubscription?.unsubscribe();
  }

  loadProperties(): void {
    this.loadPendingProperties(this.pendingPagination.current_page, this.searchQuery);
    this.loadAcceptedProperties(this.acceptedPagination.current_page, this.acceptedSearchQuery);
    this.loadRejectedProperties(this.rejectedPagination.current_page, this.rejectedSearchQuery);
  }

  loadPendingProperties(page: number, search: string = ''): void {
    this.dashboardService.getPendingProperties(page, search).subscribe({
      next: (response) => {
        this.pendingProperties = response.properties.data || [];
        this.pendingPagination = {
          current_page: response.properties.current_page,
          last_page: response.properties.last_page,
          total: response.properties.total
        };
        console.log('Pending Properties:', this.pendingProperties, 'Pagination:', this.pendingPagination);
      },
      error: (error) => {
        console.error('Error fetching pending properties:', error);
      }
    });
  }

  loadAcceptedProperties(page: number, search: string = ''): void {
    this.dashboardService.getAcceptedProperties(page, search).subscribe({
      next: (response) => {
        this.acceptedProperties = response.properties.data || [];
        this.acceptedPagination = {
          current_page: response.properties.current_page,
          last_page: response.properties.last_page,
          total: response.properties.total
        };
        console.log('Accepted Properties:', this.acceptedProperties, 'Pagination:', this.acceptedPagination);
      },
      error: (error) => {
        console.error('Error fetching accepted properties:', error);
      }
    });
  }

  loadRejectedProperties(page: number, search: string = ''): void {
    this.dashboardService.getRejectedProperties(page, search).subscribe({
      next: (response) => {
        this.rejectedProperties = response.properties.data || [];
        this.rejectedPagination = {
          current_page: response.properties.current_page,
          last_page: response.properties.last_page,
          total: response.properties.total
        };
        console.log('Rejected Properties:', this.rejectedProperties, 'Pagination:', this.rejectedPagination);
      },
      error: (error) => {
        console.error('Error fetching rejected properties:', error);
      }
    });
  }

  // Search handlers
  onPendingSearch(search: string): void {
    this.pendingPagination.current_page = 1;
    this.pendingSearchSubject.next(search);
  }

  onAcceptedSearch(search: string): void {
    this.acceptedPagination.current_page = 1;
    this.acceptedSearchSubject.next(search);
  }

  onRejectedSearch(search: string): void {
    this.rejectedPagination.current_page = 1;
    this.rejectedSearchSubject.next(search);
  }

  // Pagination navigation
  setPendingPage(page: number): void {
    if (page >= 1 && page <= this.pendingPagination.last_page) {
      this.loadPendingProperties(page, this.searchQuery);
    }
  }

  setAcceptedPage(page: number): void {
    if (page >= 1 && page <= this.acceptedPagination.last_page) {
      this.loadAcceptedProperties(page, this.acceptedSearchQuery);
    }
  }

  setRejectedPage(page: number): void {
    if (page >= 1 && page <= this.rejectedPagination.last_page) {
      this.loadRejectedProperties(page, this.rejectedSearchQuery);
    }
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
    const baseUrl = 'http://localhost:8000/storage/profile';
    const placeholder = 'https://via.placeholder.com/50';
    if (review.anonymous_review || !review.user?.profile_image) {
      return placeholder;
    }
    return `${baseUrl}${review.user.profile_image}`;
  }
}