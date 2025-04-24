import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/reviews';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getReviewsByProperty(propertyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-property/${propertyId}`);
  }

  addReview(review: {
    property_id: number;
    review_type: string;
    rating: number;
    comment: string | null;
    anonymous_review: boolean;
  }): Observable<any> {
    return this.http.post(this.apiUrl, review, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
