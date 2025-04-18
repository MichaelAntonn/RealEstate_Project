import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  map,
  catchError,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  PropertyApiResponse,
  PropertySearchApiResponse,
  PropertySearchResponse,
  Property,
  PropertySearchErrorResponse,
} from '../models/property';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient, private filterService: FilterService) {
    // Fetch cities on service initialization and store in FilterService
    this.getCities().subscribe({
      next: (cities) => this.filterService.setCities(cities),
      error: (error) => console.error('Error fetching cities:', error),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getProperties(page: number = 1): Observable<PropertyApiResponse> {
    return this.http
      .get<{ properties: PropertyApiResponse }>(
        `${this.apiUrl}/properties?page=${page}`
      )
      .pipe(
        map((response) => ({
          data: response.properties.data,
          current_page: response.properties.current_page,
          last_page: response.properties.last_page,
          total: response.properties.total,
          per_page: response.properties.per_page,
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching properties:', error);
          return of({
            data: [],
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: 10,
          });
        })
      );
  }

  createProperty(propertyData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/properties`, propertyData, {
      headers: this.getAuthHeaders(),
    });
  }

  getProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProperty(id: number, propertyData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}`, propertyData, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/properties/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getPendingProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/pending`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAcceptedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/accepted`, {
      headers: this.getAuthHeaders(),
    });
  }

  getRejectedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/rejected`, {
      headers: this.getAuthHeaders(),
    });
  }

  getCities(): Observable<string[]> {
    return this.http.get<{ cities: string[] }>(`${this.apiUrl}/cities`).pipe(
      map((response) => response.cities || []),
      catchError(() => of([]))
    );
  }

  searchProperties(): Observable<PropertySearchApiResponse> {
    return this.filterService.filters$.pipe(
      debounceTime(500),
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ),
      switchMap((filters) => {
        let params = new HttpParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (key === 'is_new_building') {
            if (value === true) {
              params = params.set(key, 'true');
            }
          } else if (value !== undefined && value !== null && value !== '') {
            params = params.set(key, value.toString());
          }
        });
        return this.http
          .get<PropertySearchResponse>(`${this.apiUrl}/search`, { params })
          .pipe(
            map((response) => response),
            catchError((error: HttpErrorResponse) => {
              console.error('Error searching properties:', error);
              return of({
                status: 'error',
                message: error.message || 'Failed to fetch properties',
                data: undefined,
                pagination: {
                  current_page: 1,
                  total_pages: 1,
                  total_items: 0,
                  per_page: 5,
                },
              } as PropertySearchErrorResponse);
            })
          );
      })
    );
  }
}
