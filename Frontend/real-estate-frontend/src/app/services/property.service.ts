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
  PropertyMedia,
} from '../models/property';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient, private filterService: FilterService) {
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
    return this.http
      .get<{ success: boolean; property: Property }>(
        `${this.apiUrl}/properties/${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map((response) => response.property),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching property:', error);
          throw error;
        })
      );
  }

  getPropertyBySlug(slug: string): Observable<Property> {
    return this.http
      .get<{ success: boolean; property: Property }>(
        `${this.apiUrl}/properties/slug/${slug}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map((response) => response.property),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching property by slug:', error);
          throw error;
        })
      );
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

  getPropertyMedia(propertyId: number): Observable<PropertyMedia[]> {
    return this.http
      .get<{ media: PropertyMedia[] }>(
        `${this.apiUrl}/properties/${propertyId}/media`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map((response) => response.media || []),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching property media:', error);
          return of([]);
        })
      );
  }

  checkSlugAvailability(slug: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${this.apiUrl}/properties/check-slug`, {
        headers: this.getAuthHeaders(),
        params: { slug },
      })
      .pipe(
        map((response) => response.available),
        catchError((error: HttpErrorResponse) => {
          console.error('Error checking slug availability:', error);
          return of(true);
        })
      );
  }

  checkPropertyCodeAvailability(property_code: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${this.apiUrl}/properties/check-property-code`, {
        headers: this.getAuthHeaders(),
        params: { property_code },
      })
      .pipe(
        map((response) => response.available),
        catchError((error: HttpErrorResponse) => {
          console.error('Error checking property code availability:', error);
          return of(true);
        })
      );
  }
}
