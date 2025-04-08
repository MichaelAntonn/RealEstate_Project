import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from './models/property.model';
import { Appointment } from './models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) { }

  private getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // Dashboard Data
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/dashboard`, { headers: this.getAuthHeaders() });
  }

  // Statistics
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/statistics`, { headers: this.getAuthHeaders() });
  }

  // Property CRUD
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`, { headers: this.getAuthHeaders() });
  }

  addProperty(property: Property): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/properties`, property, { headers: this.getAuthHeaders() });
  }

  updateProperty(id: number, property: Property): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}`, property, { headers: this.getAuthHeaders() });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/properties/${id}`, { headers: this.getAuthHeaders() });
  }

  // Appointment CRUD
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/bookings`, { headers: this.getAuthHeaders() });
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/bookings`, appointment, { headers: this.getAuthHeaders() });
  }

  updateAppointment(id: number, appointment: Appointment): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/${id}`, appointment, { headers: this.getAuthHeaders() });
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`, { headers: this.getAuthHeaders() });
  }
}