// services/property.service.ts
import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  map,
  catchError,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  PropertyApiResponse,
  PropertySearchResponse,
  PropertyFilters,
} from '../models/property';
import { Property } from '../user-dashboard/models/property.model';


@Injectable({
  providedIn: 'root'
})
export class PropertyService {
private apiUrl = 'http://127.0.0.1:8000/api/v1';

// BehaviorSubject لتخزين الـ filters
private filtersSubject = new BehaviorSubject<PropertyFilters>({
  keyword: '',
  type: '',
  city: '',
  listing_type: undefined,
  page: 1,
});

// Observable لتتبع التغييرات في الـ filters
filters$ = this.filtersSubject.asObservable();

constructor(private http: HttpClient) {}

private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('auth_token') || '';
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
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
    headers: this.getAuthHeaders()
  });
}

getProperty(id: number): Observable<Property> {
  return this.http.get<Property>(`${this.apiUrl}/properties/${id}`, {
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


  // Method لجلب العقارات بناءً على الـ filters
  searchProperties(): Observable<PropertySearchResponse> {
    return this.filters$.pipe(
      debounceTime(500), // انتظري 500ms قبل ما تبعتي طلب جديد
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ), // تجنبي الطلبات المتكررة لو الـ filters ما اتغيرتش
      switchMap((filters) => {
        let params = new HttpParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params = params.set(key, value.toString());
          }
        });
        return this.http
          .get<PropertySearchResponse>(`${this.apiUrl}/search`, { params })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Error searching properties:', error);
              return of({
                data: [],
                pagination: {
                  current_page: 1,
                  total_pages: 1,
                  total_items: 0,
                  per_page: 5,
                },
              });
            })
          );
      })
    );
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
// private filtersSubject = new BehaviorSubject<any>({});
// filters$ = this.filtersSubject.asObservable();

getCities(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/cities`, {
    headers: this.getAuthHeaders()
  });
}

// searchProperties(filters?: any): Observable<any> {
//   return this.http.get(`${this.apiUrl}/search`, {
//     params: filters,
//     headers: this.getAuthHeaders()
//   });
// }

updateFilters(filters: any): void {
  this.filtersSubject.next(filters);
}
  
} 