import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price?: string; // Optional, as trial plan may not have a price
  duration_in_days: number;
  description: string;
  features: string[];
  max_properties_allowed: number;
}

interface ApiResponse {
  regular_plans: SubscriptionPlan[];
  trial_plan: SubscriptionPlan;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/subscription/plans/all';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => {
        // Combine regular plans and trial plan into a single array
        const plans = [...response.regular_plans];
        if (response.trial_plan) {
          // Ensure trial plan has a default price if not provided
          response.trial_plan.price = response.trial_plan.price || '0.00';
          plans.unshift(response.trial_plan); // Add trial plan at the start
        }
        return plans;
      })
    );
  }
}