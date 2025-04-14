import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Property, PropertyApiResponse, PropertySearchResponse, PropertyFilters } from '../models/property';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  // BehaviorSubject لتخزين الـ filters
  private filtersSubject = new BehaviorSubject<PropertyFilters>({
    keyword: '',
    type: '',
    city: '',
    listing_type: 'for_sale',
    page: 1,
  });

  // Observable لتتبع التغييرات في الـ filters
  filters$ = this.filtersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProperties(page: number = 1): Observable<PropertyApiResponse> {
    return this.http.get<{ properties: PropertyApiResponse }>(`${this.apiUrl}/properties?page=${page}`).pipe(
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
  // Method لتحديث الـ filters
  updateFilters(newFilters: Partial<PropertyFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...newFilters });
  }

  // Method لجلب العقارات بناءً على الـ filters
  searchProperties(): Observable<PropertySearchResponse> {
    return this.filters$.pipe(
      debounceTime(500), // انتظري 500ms قبل ما تبعتي طلب جديد
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)), // تجنبي الطلبات المتكررة لو الـ filters ما اتغيرتش
      switchMap((filters) => {
        let params = new HttpParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params = params.set(key, value.toString());
          }
        });
        return this.http.get<PropertySearchResponse>(`${this.apiUrl}/search`, { params }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error searching properties:', error);
            return of({
              data: [],
              pagination: {
                current_page: 1,
                total_pages: 1,
                total_items: 0,
                per_page: 10,  // تأكد من أن per_page هي رقم
              },
            });
          })
        );
      })
    );
  }

  getCities(): Observable<string[]> {
    return this.http.get<{ cities: string[] }>(`${this.apiUrl}/cities`).pipe(
      map((response) => response.cities),
      catchError((error) => {
        console.error('Error fetching cities:', error);
        return of([]);
      })
    );
  }
}
