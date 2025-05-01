import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adjust path as needed

export interface SubscriptionPlan {
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
  featuresArray?: string[]; // Added for template display
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

interface SubscribeResponse {
  success: boolean;
  subscription_id: number;
  message?: string;
}

interface CheckoutResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8000/api/v1/subscription/plans/all';
  private subscribeUrl = 'http://localhost:8000/api/v1/subscription/subscribe';
  private checkoutUrl = 'http://localhost:8000/api/v1/payment/checkout-session';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Auth token:', token); // Debug log
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  getPlans(): Observable<SubscriptionPlan[]> {

    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse>(this.apiUrl, { headers }).pipe(
      map(response => {
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
          trialPlan.price = trialPlan.price || '0.00';
          plans.unshift(trialPlan);
        }
        return plans;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching plans:', error);
        return of([]);
      })
    );
  }

  subscribe(planId: number, autoRenew: boolean): Observable<SubscribeResponse> {
    const headers = this.getAuthHeaders();
    const body = {
      plan_id: planId,
      auto_renew: autoRenew ? 1 : 0,
    };
    return this.http.post<SubscribeResponse>(this.subscribeUrl, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to subscribe. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  initiateCheckout(subscriptionId: number, returnUrl: string): Observable<CheckoutResponse> {
    const headers = this.getAuthHeaders();
    const body = {
      subscription_id: subscriptionId,
      return_url: returnUrl,
    };
    return this.http.post(this.checkoutUrl, body, { headers, responseType: 'text' }).pipe(
      map(response => {
        try {
          const url = JSON.parse(response); // Parse quoted string, e.g., '"https://..."'
          if (typeof url !== 'string') {
            throw new Error('Invalid URL format');
          }
          return { url };
        } catch (e) {
          throw new Error('Failed to parse checkout URL');
        }
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const errorMessage = error instanceof HttpErrorResponse
          ? error.error?.message || 'Failed to initiate checkout. Please try again.'
          : error.message;
        return throwError(() => new Error(errorMessage));

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