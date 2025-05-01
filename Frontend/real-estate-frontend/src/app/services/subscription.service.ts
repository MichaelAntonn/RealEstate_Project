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
  features: {
    priority_support: boolean;
    additional_features: boolean;
    max_properties_allowed: number;
  };
  max_properties_allowed: number;
  featuresArray?: string[]; // Added for template display
}

interface ApiResponse {
  regular_plans: SubscriptionPlan[];
  trial_plan: SubscriptionPlan;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/subscription/plans/all';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map((response) => {
        const plans = [...response.regular_plans];
        if (response.trial_plan) {
          response.trial_plan.price = response.trial_plan.price || '0.00';
          plans.unshift(response.trial_plan); // Add trial plan at the start
        }
        // Transform features object into featuresArray
        return plans.map((plan) => ({
          ...plan,
          featuresArray: this.getFeaturesArray(plan.features),
        }));
      })
    );
  }

  private getFeaturesArray(features: SubscriptionPlan['features']): string[] {
    const featuresList: string[] = [];
    if (features.priority_support) {
      featuresList.push('Priority Support');
    }
    if (features.additional_features) {
      featuresList.push('Advanced Analytics'); // Adjust based on actual feature
    }
    featuresList.push(`${features.max_properties_allowed} Properties Allowed`);
    return featuresList;
  }
}