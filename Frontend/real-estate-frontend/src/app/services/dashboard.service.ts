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
    return this.http.get(`${this.apiUrl}/admin/statistics`, { headers: this.getHeaders(), withCredentials: true });
  }

  getMonthlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }
  getYearlyData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/commissions/monthly-profit`, { headers: this.getHeaders(), withCredentials: true });
  }

  getLatestProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/latest-properties`, { headers: this.getHeaders(), withCredentials: true });
  }


// properties
  getProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties`, { headers: this.getHeaders(), withCredentials: true });
  }
  getPendingProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/pending?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getAcceptedProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/accepted?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getRejectedProperties(page: number = 1, search: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/properties/status/rejected?page=${page}${search ? '&search=' + encodeURIComponent(search) : ''}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
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
    return this.http.put(`${this.apiUrl}/admin/properties/${id}/accept`, {}, { headers: this.getHeaders(), withCredentials: true });
  }
  rejectProperty(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/properties/${id}/reject`, {}, { headers: this.getHeaders(), withCredentials: true });
  }





// users
getAdmins(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/admins`, { headers: this.getHeaders(), withCredentials: true });
}

// Fetch users (excluding admins and super-admins)
getUsers(page: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/users?page=${page}`, {
    headers: this.getHeaders(),
    withCredentials: true
  });
}

deleteAdmin(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/admins/${id}`, { headers: this.getHeaders(), withCredentials: true });
}

deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders(), withCredentials: true });
}


// bookings
getPendingBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/bookings/pending?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

getConfirmedBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/bookings/confirmed?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

getCanceledBookings(page: number = 1): Observable<any> {
  return this.http.get(`${this.apiUrl}/bookings/canceled?page=${page}`, { headers: this.getHeaders(), withCredentials: true });
}

updateBookingStatus(id: number, status: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/properties/bookings/${id}/status`, { status }, { headers: this.getHeaders(), withCredentials: true });
}




// reviews
getPropertyReviews(propertyId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/reviews/by-property/${propertyId}`, {
    headers: this.getHeaders(),
    withCredentials: true
  });
}

deleteReview(reviewId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`, {
    headers: this.getHeaders(),
    withCredentials: true
  });
}



// activities

getUserActivities(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/user-activities`, { headers: this.getHeaders(), withCredentials: true });
}


// create admin
createAdmin(adminData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/create-admin`, adminData, {
    headers: this.getHeaders(),
    withCredentials: true
  });
}


// New method to get current commission rate
getCommissionRate(): Observable<{ success: boolean; commission_rate: number; status: string }> {
  return this.http.get<{ success: boolean; commission_rate: number; status: string }>(
    `${this.apiUrl}/admin/settings/financial`,
    { headers: this.getHeaders(), withCredentials: true }
  );
}

// New method to update commission rate
updateCommissionRate(commissionRate: number): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/admin/settings/financial`,
    { commission_rate: commissionRate },
    { headers: this.getHeaders(), withCredentials: true }
  );
}


}