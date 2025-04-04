import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, { headers: this.getHeaders(), withCredentials: true });
  }

  getMonthlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }

  getLatestProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/latest-properties`, { headers: this.getHeaders(), withCredentials: true });
  }
}