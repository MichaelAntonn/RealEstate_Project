import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog, PaginatedBlogs } from '../models/blog';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}`; // تعديل المسار الأساسي

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json'
    });
  }

  // Fetch paginated blogs
  getBlogs(page: number = 1): Observable<PaginatedBlogs> {
    return this.http.get<PaginatedBlogs>(`${this.apiUrl}/blogs?page=${page}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  // Fetch a single blog by ID
  getBlog(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/blogs/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  // Create a new blog
  createBlog(formData: FormData): Observable<Blog> {
    return this.http.post<Blog>(`${this.apiUrl}/admin/blogs`, formData, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  // Update an existing blog
  updateBlog(id: number, formData: FormData): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/admin/blogs/${id}`, formData, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  // Delete a blog by ID
  deleteBlog(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/admin/blogs/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }
}