import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8000/api/v1/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Create a new booking
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(this.apiUrl, bookingData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get booking by ID
  getBooking(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get all bookings (for admin/property owner)
  getAllBookings(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('Booking Service Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error: ${error.status} - ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}