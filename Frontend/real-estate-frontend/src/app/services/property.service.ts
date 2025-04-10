import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Property, PropertyApiResponse } from '../models/property';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/properties';

  constructor(private http: HttpClient) {}

  getProperties(page: number = 1): Observable<PropertyApiResponse> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`).pipe(
      map((response) => ({
        data: response.properties.data,
        current_page: response.properties.current_page,
        last_page: response.properties.last_page,
      })),
      catchError((error) => {
        console.error('Error fetching properties:', error);
        return of({
          data: [],
          current_page: 1,
          last_page: 1,
        });
      })
    );
  }
}
