import { Component, OnInit } from '@angular/core';
import { SubscriptionService, SubscriptionPlan } from '../services/subscription.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-interface',
  templateUrl: './subscription-interface.component.html',
  styleUrls: ['./subscription-interface.component.css'],
  imports: [RouterModule, CommonModule, FormsModule],
  standalone: true
})
export class SubscriptionInterfaceComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  isLoading = true;
  error: string | null = null;
  autoRenew: { [planId: number]: boolean } = {};
  isSubscribing: { [planId: number]: boolean } = {};

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        plans.forEach(plan => {
          this.autoRenew[plan.id] = true;
          this.isSubscribing[plan.id] = false;
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load subscription plans. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching plans:', err);
      }
    });
  }

  subscribe(plan: SubscriptionPlan): void {
    const token = this.authService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to subscribe.',
      });
      return;
    }

    this.isSubscribing[plan.id] = true;

    if (plan.name.toLowerCase() === 'free trial') {
      this.subscriptionService.subscribeTrial().subscribe({
        next: (response) => {
          console.log('Trial subscribe response:', response);
          this.isSubscribing[plan.id] = false;
          Swal.fire({
            icon: response.message.includes('activated') ? 'success' : 'error',
            title: response.message.includes('activated') ? 'Success' : 'Trial Unavailable',
            text: response.message,
          }).then(() => {
            this.router.navigateByUrl('/');
          });
        },
        error: (err) => {
          console.error('Trial subscription error:', err);
          this.isSubscribing[plan.id] = false;
          Swal.fire({
            icon: 'error',
            title: 'Trial Subscription Error',
            text: err.message || 'Failed to activate trial.',
          }).then(() => {
            this.router.navigateByUrl('/');
          });
        }
      });
    } else {
      this.subscriptionService.subscribe(plan.id, this.autoRenew[plan.id]).subscribe({
        next: (response: any) => {
          console.log('Subscribe response:', response);
          if (response.subscription && response.subscription.id) {
            console.log('Proceeding to initiateCheckout with subscription_id:', response.subscription.id);
            this.subscriptionService.initiateCheckout(response.subscription.id, this.router.url ).subscribe({
              next: (checkoutResponse) => {
                console.log('Checkout response:', checkoutResponse);
                this.isSubscribing[plan.id] = false;
                if (checkoutResponse.url && checkoutResponse.url.startsWith('https://')) {
                  console.log('Redirecting to:', checkoutResponse.url);
                  window.location.href = checkoutResponse.url;
                } else {
                  console.error('Invalid checkout URL:', checkoutResponse.url);
                  Swal.fire({
                    icon: 'error',
                    title: 'Checkout Failed',
                    text: 'Invalid or missing checkout URL.',
                  });
                }
              },
              error: (err) => {
                console.error('Checkout error:', err);
                this.isSubscribing[plan.id] = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Checkout Error',
                  text: err.message || 'Failed to initiate checkout.',
                });
              }
            });
          } else {
            console.warn('Subscription response invalid:', response);
            this.isSubscribing[plan.id] = false;
            Swal.fire({
              icon: 'error',
              title: 'Subscription Failed',
              text: response.message || 'Unable to subscribe to the plan.',
            });
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.isSubscribing[plan.id] = false;
          Swal.fire({
            icon: 'error',
            title: 'Subscription Error',
            text: err.message || 'Failed to subscribe to the plan.',
          });
        }
      });
    }
  }
}