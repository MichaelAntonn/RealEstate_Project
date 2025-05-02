import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price?: string;
  duration_in_days: number;
  description: string;
  features: string[];
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

interface SubscriptionDetails {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  price: string;
  duration_in_days: number;
  auto_renew: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  starts_at: string | null;
  ends_at: string | null;
}

interface SubscribeResponse {
  message?: string;
  subscription?: SubscriptionDetails;
}

interface TrialResponse {
  message: string;
}

interface CheckoutResponse {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8000/api/v1/subscription/plans/all';
  private subscribeUrl = 'http://localhost:8000/api/v1/subscription/subscribe';
  private trialSubscribeUrl = 'http://localhost:8000/api/v1/subscription/subscribe/trial';
  private checkoutUrl = 'http://localhost:8000/api/v1/payment/checkout-session';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Auth token:', token);
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
        return throwError(() => new Error('Failed to fetch plans'));
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
        console.error('Subscribe error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  subscribeTrial(): Observable<TrialResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<TrialResponse>(this.trialSubscribeUrl, {}, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to activate trial. Please try again.';
        console.error('Trial subscription error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  initiateCheckout(subscriptionId: number, returnUrl: string): Observable<CheckoutResponse> {
    const headers = this.getAuthHeaders();
    const return_url = window.location.origin + '/';
    const body = {
      subscription_id: subscriptionId,
      return_url: return_url,
    };
    return this.http.post<CheckoutResponse>(this.checkoutUrl, body, { headers }).pipe(
      map(response => {
        console.log('Checkout response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to initiate checkout. Please try again.';
        console.error('Checkout error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  }