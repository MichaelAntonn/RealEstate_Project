
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface for YearlySummary to match API response
interface YearlySummary {
  month: string;
  sales: number;
  revenue: number;
  new_listings: number;
}

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
    return this.http.get(`${this.apiUrl}/admin/statistics`, { headers: this.getHeaders(), withCredentials: true });
  }

  getMonthlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }

  getYearlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }

  getYearlySummary(year: number): Observable<{ success: boolean; year: string; summary: YearlySummary[] }> {
    return this.http.get<{ success: boolean; year: string; summary: YearlySummary[] }>(
      `${this.apiUrl}/admin/commissions/yearly-summary/${year}`,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  getLatestProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/latest-properties`, { headers: this.getHeaders(), withCredentials: true });
  }

  // Properties
  getProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties`, { headers: this.getHeaders(), withCredentials: true });
  }

  getPendingProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/pending?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getAcceptedProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/accepted?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getRejectedProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/rejected?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getProperty(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  updateProperty(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}`, data, { headers: this.getHeaders(), withCredentials: true });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/properties/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  acceptProperty(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/properties/${id}/accept`, {}, { headers: this.getHeaders(), withCredentials: true });
  }

  rejectProperty(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/properties/${id}/reject`, {}, { headers: this.getHeaders(), withCredentials: true });
  }

  // Users
  getAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/admins`, { headers: this.getHeaders(), withCredentials: true });
  }

  getUsers(page: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users?page=${page}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/admins/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  // Bookings
  getPendingBookings(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/pending?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
  }

  getConfirmedBookings(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/confirmed?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
  }

  getCanceledBookings(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/canceled?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
  }

  getCompletedBookings(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings/completed?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/bookings/${id}/status`, { status }, { headers: this.getHeaders(), withCredentials: true });
  }

  // Reviews
  getPropertyReviews(propertyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/by-property/${propertyId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Activities
  getUserActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/user-activities`, { headers: this.getHeaders(), withCredentials: true });
  }

  // Create admin
  createAdmin(adminData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create-admin`, adminData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Commission rate
  getCommissionRate(): Observable<{ success: boolean; commission_rate: number; status: string }> {
    return this.http.get<{ success: boolean; commission_rate: number; status: string }>(
      `${this.apiUrl}/admin/settings/financial`,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  updateCommissionRate(commissionRate: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/settings/financial`,
      { commission_rate: commissionRate },
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  // Costs
  getCosts(page: number = 1, search: string = '', month?: number, year?: number, type?: string, category?: string): Observable<any> {
    let url = `${this.apiUrl}/admin/costs?page=${page.toString()}`;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (month !== undefined) params.push(`month=${month}`);
    if (year !== undefined) params.push(`year=${year}`);
    if (type) params.push(`type=${type}`);
    if (category) params.push(`category=${category}`);
    if (params.length) url += `&${params.join('&')}`;
    return this.http.get(url, { headers: this.getHeaders(), withCredentials: true });
  }

  getCostsSummary(month: number, year: number): Observable<any> {
    const url = `${this.apiUrl}/admin/costs/summary?month=${month}&year=${year}`;
    return this.http.get(url, { headers: this.getHeaders(), withCredentials: true });
  }

  createCost(costData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/costs`, costData, { headers: this.getHeaders(), withCredentials: true });
  }

  getCost(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/costs/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  updateCost(id: number, costData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/costs/${id}`, costData, { headers: this.getHeaders(), withCredentials: true });
  }

  deleteCost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/costs/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  getCostCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/costs/categories`, { headers: this.getHeaders(), withCredentials: true });
  }
    // Sell Property
    sellProperty(propertyId: number): Observable<any> {
      return this.http.put(`${this.apiUrl}/properties/${propertyId}/sell`, {}, { headers: this.getHeaders(), withCredentials: true });
    }
}
