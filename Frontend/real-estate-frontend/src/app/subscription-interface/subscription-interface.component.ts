import { Component, OnInit } from '@angular/core';
import { SubscriptionService, SubscriptionPlan } from '../services/subscription.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-interface',
  templateUrl: './subscription-interface.component.html',
  styleUrls: ['./subscription-interface.component.css'],
  imports: [RouterModule, CommonModule],
  standalone: true,
})
export class SubscriptionInterfaceComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load subscription plans. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching plans:', err);
      },
    });
  }
}