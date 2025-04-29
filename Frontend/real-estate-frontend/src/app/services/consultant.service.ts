import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsultantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }
  // Submit consultation form
  submitConsultation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultants`, data);
  }
 // Fetch paginated consultants
 getConsultants(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/consultants?page=${page}`, {
    headers: this.getHeaders(),
    withCredentials: true,
  });
}

// Mark a consultant as seen
markAsSeen(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/consultants/${id}`, {
    headers: this.getHeaders(),
    withCredentials: true,
  });
}

// Toggle seen status
toggleSeen(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/admin/consultants/${id}/seen`, {}, {
    headers: this.getHeaders(),
    withCredentials: true,
  });
}

// Delete a consultant by ID
deleteConsultant(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/consultants/${id}`, {
    headers: this.getHeaders(),
    withCredentials: true,
  });
}
}