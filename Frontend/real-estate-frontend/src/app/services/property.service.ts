// services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../user-dashboard/models/property.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/properties';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createProperty(propertyData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, propertyData, {
      headers: this.getAuthHeaders()
    });
  }

  getProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProperty(id: number, propertyData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, propertyData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getPendingProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/pending`, {
      headers: this.getAuthHeaders()
    });
  }

  getAcceptedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/accepted`, {
      headers: this.getAuthHeaders()
    });
  }

  getRejectedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/rejected`, {
      headers: this.getAuthHeaders()
    });
  }



  // Add these to your PropertyService class
private filtersSubject = new BehaviorSubject<any>({});
filters$ = this.filtersSubject.asObservable();

getCities(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/cities`, {
    headers: this.getAuthHeaders()
  });
}

searchProperties(filters?: any): Observable<any> {
  return this.http.get(`${this.apiUrl}/search`, {
    params: filters,
    headers: this.getAuthHeaders()
  });
}

updateFilters(filters: any): void {
  this.filtersSubject.next(filters);
}
  
}