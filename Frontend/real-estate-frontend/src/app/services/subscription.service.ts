import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adjust path as needed

export interface SubscriptionPlan {
  id: number;
  name: string;
  price?: string;
  duration_in_days: number;
  description: string;
  features: string[]; // Keep as string[] for component compatibility
  max_properties_allowed: number;
}

interface RawSubscriptionPlan {
  id: number;
  name: string;
  price?: string;
  duration_in_days: number;
  description: string;
  features: {
    priority_support: boolean;
    additional_features: boolean;
    max_properties_allowed: number;
  };
  max_properties_allowed: number;
}

interface ApiResponse {
  regular_plans: RawSubscriptionPlan[];
  trial_plan: RawSubscriptionPlan;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/subscription/plans/all';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || ''; // Fallback to empty string if null
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getPlans(): Observable<SubscriptionPlan[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse>(this.apiUrl, { headers }).pipe(
      map(response => {
        // Transform features object to string array
        const transformFeatures = (plan: RawSubscriptionPlan): SubscriptionPlan => {
          const features: string[] = [];
          if (plan.features.priority_support) {
            features.push('Priority Support');
          }
          if (plan.features.additional_features) {
            features.push('Additional Features');
          }
          features.push(`Max Properties: ${plan.features.max_properties_allowed}`);
          return {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration_in_days: plan.duration_in_days,
            description: plan.description,
            features,
            max_properties_allowed: plan.max_properties_allowed,
          };
        };

        const plans = response.regular_plans.map(transformFeatures);
        if (response.trial_plan) {
          const trialPlan = transformFeatures(response.trial_plan);
          trialPlan.price = trialPlan.price || '0.00'; // Set default price
          plans.unshift(trialPlan);
        }
        return plans;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching plans:', error);
        return of([]); // Return empty array on error
      })
    );
  }
}