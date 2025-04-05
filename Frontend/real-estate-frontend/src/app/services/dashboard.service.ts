import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, { headers: this.getHeaders(), withCredentials: true });
  }

  getMonthlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }

  getLatestProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/latest-properties`, { headers: this.getHeaders(), withCredentials: true });
  }


// properties
  getProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties`, { headers: this.getHeaders(), withCredentials: true });
  }
  getAcceptedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/?approval_status=accepted`, { headers: this.getHeaders(), withCredentials: true });
  }
  getRejectedProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/?approval_status=rejected`, { headers: this.getHeaders(), withCredentials: true });
  }
  getPendingProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/?approval_status=pending`, { headers: this.getHeaders(), withCredentials: true });
  }

  getProperty(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }

  // createProperty(data: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/properties`, data, { headers: this.getHeaders(), withCredentials: true });
  // }

  updateProperty(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}`, data, { headers: this.getHeaders(), withCredentials: true });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/properties/${id}`, { headers: this.getHeaders(), withCredentials: true });
  }
  acceptProperty(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}/accept`, {}, { headers: this.getHeaders(), withCredentials: true });
  }
  rejectProperty(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}/reject`, {}, { headers: this.getHeaders(), withCredentials: true });
  }





// users
getAdmins(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/admins`, { headers: this.getHeaders(), withCredentials: true });
}

getUsers(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/users`, { headers: this.getHeaders(), withCredentials: true });
}

deleteAdmin(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/admins/${id}`, { headers: this.getHeaders(), withCredentials: true });
}

deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders(), withCredentials: true });
}


// bookings
getPendingBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/properties/bookings/pending?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

getConfirmedBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/properties/bookings/confirmed?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

getCanceledBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/properties/bookings/canceled?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

updateBookingStatus(id: number, status: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/properties/bookings/${id}/status`, { status }, { headers: this.getHeaders(), withCredentials: true });
}


}