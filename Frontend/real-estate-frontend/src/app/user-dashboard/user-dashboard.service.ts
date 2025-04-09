import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from './models/property.model';
import { Appointment } from './models/appointment.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) { }

  // الحصول على التوكن من localStorage
  private getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  // إنشاء هيدرز تحتوي على التوكن للمصادقة
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // ---------------------------- CRUD - Properties ----------------------------

  // الحصول على قائمة الـ Properties
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`, { headers: this.getAuthHeaders() });
  }

  // إنشاء Property جديد
  createProperty(property: Property): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/properties`, property, {
      headers: this.getAuthHeaders()
    });
  }

  // تحديث Property موجود
  updateProperty(id: number, property: Property): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}`, property, {
      headers: this.getAuthHeaders()
    });
  }

  // حذف Property
  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/properties/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------- CRUD - Appointments ----------------------------

  // الحصول على قائمة الـ Appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/bookings`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((appointments: Appointment[]) => appointments.map(a => ({
        ...a,
        property_title: a.property_title || 'Unknown'  // التعامل مع البيانات الناقصة
      })))
    );
  }

  // إنشاء Appointment جديد
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/bookings`, appointment, {
      headers: this.getAuthHeaders()
    });
  }

  // تحديث Appointment موجود
  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/bookings/${id}`, appointment, {
      headers: this.getAuthHeaders()
    });
  }

  // تحديث حالة Appointment
  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/bookings/${id}/status`, 
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  // حذف Appointment
  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------- Dashboard and Statistics ----------------------------

  // الحصول على بيانات لوحة التحكم
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/dashboard`, { headers: this.getAuthHeaders() });
  }

  // الحصول على إحصائيات المستخدم
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/statistics`, { headers: this.getAuthHeaders() });
  }
}
