import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-reviews.component.html',
  styleUrl: './property-reviews.component.css',
})
export class PropertyReviewsComponent implements OnInit {
  @Input() propertyId!: number;

  reviews: any[] = [];
  loading: boolean = false;
  error: string | null = null;

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
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews. Please try again.';
        this.loading = false;
        console.error('Error fetching reviews:', err);
      },
    });
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
}
