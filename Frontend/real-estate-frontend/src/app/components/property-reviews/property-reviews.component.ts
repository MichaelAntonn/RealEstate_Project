import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-reviews.component.html',
  styleUrl: './property-reviews.component.css',
})
export class PropertyReviewsComponent implements OnInit {
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
  isLoggedIn: boolean = !!localStorage.getItem('auth_token');
  hasReviewed: boolean = false; // متغير جديد لتتبع إذا اليوزر أضاف ريفيو

  // Carousel Logic
  reviewsPerPage = 2;
  currentReviewPage = 0;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = null;
    this.reviews = [];

    this.reviewService.getReviewsByProperty(this.propertyId).subscribe({
      next: (response) => {
        this.reviews = Array.isArray(response) ? response : response.data || [];
        // نفترض إن الـ backend بيرجع user_id في كل ريفيو
        // نتأكد إذا اليوزر الحالي عنده ريفيو
        const currentUserId = this.getCurrentUserId(); // هنضيف الدالة دي
        this.hasReviewed = this.reviews.some(
          (review) => review.user_id === currentUserId
        );
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

  // دالة لجلب user_id من الـ token (افتراضياً)
  private getCurrentUserId(): number | null {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null; // نفترض إن user_id موجود في payload كـ sub
      } catch (e) {
        console.error('Error decoding token:', e);
        return null;
      }
    }
    return null;
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
}
