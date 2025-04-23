import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/reviews';

  constructor(private http: HttpClient) {}

  // جلب التقييمات الخاصة بعقار معين
  getReviewsByProperty(propertyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    });
    return this.http.get(`${this.apiUrl}/by-property/${propertyId}`, {
      headers,
    });
  }
}
