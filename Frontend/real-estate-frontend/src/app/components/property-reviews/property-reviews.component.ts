import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-reviews.component.html',
  styleUrl: './property-reviews.component.css',
})
export class PropertyReviewsComponent implements OnInit, OnDestroy {
  @Input() propertyId!: number;

  reviews: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  showReviewModal: boolean = false;
  formLoading: boolean = false;
  formError: string | null = null;
  formSuccess: string | null = null;
  rating: number = 0;
  comment: string = '';
  review_type: string = 'property';
  anonymous_review: boolean = false;
  isLoggedIn: boolean = false;
  hasReviewed: boolean = false;
  showDeleteModal: boolean = false;
  reviewToDelete: any = null;
  currentUser: any = null;
  private userSubscription!: Subscription;

  reviewsPerPage = 2;
  currentReviewPage = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.loadReviews();
    });
    if (this.isLoggedIn && !this.currentUser) {
      this.authService.loadCurrentUser().subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadReviews(): void {
    this.loading = true;
    this.error = null;
    this.reviews = [];

    this.reviewService.getReviewsByProperty(this.propertyId).subscribe({
      next: (response) => {
        this.reviews = Array.isArray(response) ? response : response.data || [];
        const currentUserId = this.getCurrentUserId();
        this.hasReviewed = currentUserId
          ? this.reviews.some((review) => review.user_id === currentUserId)
          : false;
        this.loading = false;
        this.currentReviewPage = 0;
      },
      error: (err) => {
        this.error = 'Failed to load reviews. Please try again.';
        this.loading = false;
        console.error('Error fetching reviews:', err);
      },
    });
  }

  private getCurrentUserId(): number | null {
    return this.currentUser ? this.currentUser.id : null;
  }

  get displayedReviews() {
    const start = this.currentReviewPage * this.reviewsPerPage;
    return this.reviews.slice(start, start + this.reviewsPerPage);
  }

  get isLastReviewPage() {
    return (
      (this.currentReviewPage + 1) * this.reviewsPerPage >= this.reviews.length
    );
  }

  prevReviewPage() {
    if (this.currentReviewPage > 0) this.currentReviewPage--;
  }

  nextReviewPage() {
    if (!this.isLastReviewPage) this.currentReviewPage++;
  }

  openReviewModal(): void {
    if (!this.isLoggedIn) {
      this.formError = 'Please log in to add a review.';
      return;
    }
    if (this.hasReviewed) {
      this.formError = 'You have already submitted a review for this property.';
      return;
    }
    this.showReviewModal = true;
    this.formError = null;
    this.formSuccess = null;
    this.rating = 0;
    this.comment = '';
    this.review_type = 'property';
    this.anonymous_review = false;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setRating(value: number): void {
    this.rating = value;
  }

  submitReview(): void {
    if (!this.rating || !this.review_type) {
      this.formError = 'Please provide a rating and review type.';
      return;
    }

    if (this.hasReviewed) {
      this.formError = 'You have already submitted a review for this property.';
      this.formLoading = false;
      return;
    }

    this.formLoading = true;
    this.formError = null;
    this.formSuccess = null;

    const reviewData = {
      property_id: this.propertyId,
      review_type: this.review_type,
      rating: this.rating,
      comment: this.comment.trim() || null,
      anonymous_review: this.anonymous_review,
    };

    this.reviewService.addReview(reviewData).subscribe({
      next: (response) => {
        this.reviews.unshift(response);
        this.hasReviewed = true;
        this.formSuccess = 'Review added successfully!';
        this.formLoading = false;
        this.currentReviewPage = 0;
        setTimeout(() => this.closeReviewModal(), 2000);
      },
      error: (err) => {
        this.formError =
          err.status === 401
            ? 'Please log in to add a review.'
            : err.status === 422
            ? 'You have already submitted a review for this property.'
            : 'Failed to add review. Please try again.';
        this.formLoading = false;
        console.error('Error adding review:', err);
      },
    });
  }

  openDeleteModal(review: any): void {
    if (!this.isLoggedIn) {
      this.formError = 'Please log in to delete a review.';
      return;
    }
    this.reviewToDelete = review;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.reviewToDelete = null;
  }

  deleteReview(): void {
    if (!this.reviewToDelete) return;

    this.formLoading = true;
    this.formError = null;

    this.reviewService.deleteReview(this.reviewToDelete.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(
          (review) => review.id !== this.reviewToDelete.id
        );
        const currentUserId = this.getCurrentUserId();
        this.hasReviewed = currentUserId
          ? this.reviews.some((review) => review.user_id === currentUserId)
          : false;
        this.formSuccess = 'Review deleted successfully!';
        this.formLoading = false;
        this.currentReviewPage = 0;
        this.closeDeleteModal();
        setTimeout(() => (this.formSuccess = null), 2000);
      },
      error: (err) => {
        this.formError =
          err.status === 401
            ? 'Please log in to delete your review.'
            : err.status === 403
            ? 'You are not authorized to delete this review.'
            : err.status === 404
            ? 'Review not found.'
            : 'Failed to delete review. Please try again.';
        this.formLoading = false;
        console.error('Error deleting review:', err);
      },
    });
  }
}
