import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCrown, 
  faSyncAlt, 
  faExchangeAlt, 
  faTimesCircle,
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faCreditCard,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  // Icons
  faCrown = faCrown;
  faSyncAlt = faSyncAlt;
  faExchangeAlt = faExchangeAlt;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faCalendarAlt = faCalendarAlt;
  faCreditCard = faCreditCard;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;

  subscriptionData: any = null;
  loading: boolean = true;
  error: string | null = null;
  isProcessing: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionData();
  }

  loadSubscriptionData(): void {
    this.loading = true;
    this.error = null;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.get('http://localhost:8000/api/v1/subscription/current-subscription-status', { headers })
      .subscribe({
        next: (response: any) => {
          this.subscriptionData = response.data || response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading subscription data:', err);
          this.error = 'Failed to load subscription information';
          this.loading = false;
        }
      });
  }

  toggleAutoRenew(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const newStatus = !this.subscriptionData.auto_renew;
    const action = newStatus ? 'enable' : 'disable';

    Swal.fire({
      title: `${action === 'enable' ? 'Enable' : 'Disable'} Auto-Renew?`,
      text: `Are you sure you want to ${action} automatic renewal of your subscription?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F77C34',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${action} it!`,
      background: '#F2F4F3',
      backdrop: `
        rgba(23, 41, 64, 0.4)
        url("/assets/images/nyan-cat.gif")
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        const url = newStatus 
          ? 'http://localhost:8000/api/v1/subscription/renew' 
          : 'http://localhost:8000/api/v1/subscription/cancel-auto-renew';

        this.processSubscriptionAction(url, `Auto-renew ${action}d successfully!`, () => {
          this.subscriptionData.auto_renew = newStatus;
        });
      } else {
        this.isProcessing = false;
      }
    });
  }

  cancelSubscription(): void {
    Swal.fire({
      title: 'Cancel Subscription?',
      text: "You'll lose access to premium features at the end of your billing period",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!',
      background: '#F2F4F3',
      customClass: {
        confirmButton: 'btn-confirm-danger'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSubscriptionAction(
          'http://localhost:8000/api/v1/subscription/cancel',
          'Subscription cancelled successfully!'
        );
      }
    });
  }

  renewSubscription(): void {
    Swal.fire({
      title: 'Renew Subscription',
      html: `<p>Extend your current subscription plan?</p>
             <p class="text-muted">You'll be charged ${this.subscriptionData.plan_price || 'the plan price'} upon confirmation</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F77C34',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Renewal',
      background: '#F2F4F3'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSubscriptionAction(
          'http://localhost:8000/api/v1/subscription/renew',
          'Subscription renewed successfully!'
        );
      }
    });
  }

  changePlan(): void {
    Swal.fire({
      title: 'Change Subscription Plan',
      html: `<p>You'll be redirected to our plans page</p>
             <p class="text-muted">Your current plan will remain active until the end of the billing period</p>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#172940',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'View Plans',
      background: '#F2F4F3'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/subscription']);
      }
    });
  }

  private processSubscriptionAction(url: string, successMessage: string, callback?: () => void): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        Swal.fire({
          title: 'Success!',
          text: successMessage,
          icon: 'success',
          confirmButtonColor: '#F77C34',
          background: '#F2F4F3'
        });
        this.loadSubscriptionData();
        if (callback) callback();
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Error processing subscription action:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to process your request',
          icon: 'error',
          confirmButtonColor: '#F77C34',
          background: '#F2F4F3'
        });
        this.isProcessing = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-expired';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-inactive';
    }
  }

  getRemainingProperties(): string {
    if (!this.subscriptionData?.total_properties || !this.subscriptionData?.used_properties) {
      return 'Unlimited';
    }
    return `${this.subscriptionData.used_properties}/${this.subscriptionData.total_properties}`;
  }

  getProgressPercentage(): number {
    if (!this.subscriptionData?.total_properties || !this.subscriptionData?.used_properties) {
      return 0;
    }
    return (this.subscriptionData.used_properties / this.subscriptionData.total_properties) * 100;
  }
}