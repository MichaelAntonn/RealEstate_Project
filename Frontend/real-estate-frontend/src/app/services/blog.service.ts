import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Blog, PaginatedBlogs } from '../models/blog';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    });
  }

  getBlogs(page: number = 1): Observable<PaginatedBlogs> {
    return this.http.get<PaginatedBlogs>(`${this.apiUrl}/api/v1/blogs?page=${page}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error('Error fetching blogs:', error);
        return throwError(() => new Error('Failed to fetch blogs'));
      })
    );
  }

  getBlog(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/api/v1/blogs/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error('Error fetching blog:', error);
        return throwError(() => new Error('Failed to fetch blog'));
      })
    );
  }

  createBlog(formData: FormData): Observable<Blog> {
    return this.http.post<{ blog: Blog }>(`${this.apiUrl}/api/v1/admin/blogs`, formData, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      map(response => response.blog), // Map { blog: Blog } to Blog
      catchError((error) => {
        console.error('Error creating blog:', error);
        return throwError(() => new Error(error.message || 'Failed to create blog'));
      })
    );
  }

  updateBlog(id: number, formData: FormData): Observable<Blog> {
    return this.http.put<{ blog: Blog }>(`${this.apiUrl}/api/v1/admin/blogs/${id}`, formData, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      map(response => response.blog), // Map { blog: Blog } to Blog
      catchError((error) => {
        console.error('Error updating blog:', error);
        return throwError(() => new Error(error.message || 'Failed to update blog'));
      })
    );
  }

  deleteBlog(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/api/v1/admin/blogs/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error('Error deleting blog:', error);
        return throwError(() => new Error('Failed to delete blog'));
      })
    );
  }
}