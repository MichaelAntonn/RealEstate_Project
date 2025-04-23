import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/reviews';

  constructor(private http: HttpClient) {}

  getReviewsByProperty(propertyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    });
    return this.http.get(`${this.apiUrl}/by-property/${propertyId}`, {
      headers,
    });
  }

  addReview(review: {
    property_id: number;
    review_type: string;
    rating: number;
    comment: string | null;
    anonymous_review: boolean;
  }): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      // 'Content-Type': 'application/json',
    });
    return this.http.post(this.apiUrl, review, { headers });
  }
}
