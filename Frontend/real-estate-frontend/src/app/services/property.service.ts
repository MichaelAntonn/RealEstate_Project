import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(
    private http: HttpClient,
    private filterService: FilterService,
    private authService: AuthService
  ) {
    this.getCities().subscribe({
      next: (cities) => this.filterService.setCities(cities),
      error: (error) => console.error('Error fetching cities:', error),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getProperties(
    page: number = 1,
    perPage: number = 10,
    filters: any = {}
  ): Observable<PropertyApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    // Add filters to query params
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
      .get<{ data: Property[]; pagination: any }>(
        `${this.apiUrl}/properties/all`,
        { headers: this.getAuthHeaders(), params }
      )
      .pipe(
        map((response) => ({
          data: response.data,
          current_page: response.pagination.current_page,
          last_page: response.pagination.total_pages,
          total: response.pagination.total_items,
          per_page: response.pagination.per_page,
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching properties:', error);
          return of({
            data: [],
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: perPage,
          });
        })
      );
  }

  createProperty(
    propertyData: FormData
  ): Observable<{ success: boolean; property: Property }> {
    return this.http
      .post<{ success: boolean; property: Property }>(
        `${this.apiUrl}/properties`,
        propertyData,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(
            () =>
              new Error(
                error.error?.error?.['media.0']?.[0] ||
                  error.error?.warning ||
                  'Failed to create property'
              )
          );
        })
      );
  }

  getProperty(id: number): Observable<Property> {
    return this.http
      .get<{ success: boolean; property: Property }>(
        `${this.apiUrl}/properties/${id}`,
        { headers: this.getAuthHeaders() }
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
        { headers: this.getAuthHeaders() }
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

  searchProperties(perPage: number = 8): Observable<PropertySearchApiResponse> {
    return this.filterService.filters$.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => {
        return (
          prev.keyword === curr.keyword &&
          prev.type === curr.type &&
          prev.city === curr.city &&
          prev.listing_type === curr.listing_type &&
          prev.page === curr.page &&
          prev.sort_by === curr.sort_by &&
          prev.min_price === curr.min_price &&
          prev.max_price === curr.max_price &&
          prev.min_area === curr.min_area &&
          prev.max_area === curr.max_area &&
          prev.bedrooms === curr.bedrooms &&
          prev.bathrooms === curr.bathrooms &&
          prev.is_new_building === curr.is_new_building
        );
      }),
      switchMap((filters) => {
        let params = new HttpParams();
        params = params.set('per_page', perPage.toString());
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
          .get<{ data: Property[]; pagination: any }>(
            `${this.apiUrl}/properties/search`,
            {
              params,
              headers: this.getAuthHeaders(),
            }
          )
          .pipe(
            map((response) => {
              return {
                data: response.data || [],
                pagination: {
                  current_page: response.pagination?.current_page || 1,
                  total_pages: response.pagination?.total_pages || 1,
                  total_items: response.pagination?.total_items || 0,
                  per_page: response.pagination?.per_page || perPage,
                },
              } as PropertySearchResponse;
            }),
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
                  per_page: perPage,
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
        { headers: this.getAuthHeaders() }
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
      .get<{ available: boolean }>(
        `${this.apiUrl}/properties/check-property-code`,
        {
          headers: this.getAuthHeaders(),
          params: { property_code },
        }
      )
      .pipe(
        map((response) => response.available),
        catchError((error: HttpErrorResponse) => {
          console.error('Error checking property code availability:', error);
          return of(true);
        })
      );
  }
}
