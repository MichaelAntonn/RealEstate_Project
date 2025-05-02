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
  propertyStatus: any = {
    max_allowed: 1,
    used: 0,
    remaining: 1
  };
  loading: boolean = true;
  isProcessing: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionData();
    this.loadPropertyStatus();
  }

  loadSubscriptionData(): void {
    this.loading = true;
    
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
          this.subscriptionData = null;
          this.loading = false;
        }
      });
  }

  loadPropertyStatus(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.get('http://localhost:8000/api/v1/subscription/property-status', { headers })
      .subscribe({
        next: (response: any) => {
          this.propertyStatus = response.data || response;
        },
        error: (err) => {
          console.error('Error loading property status:', err);
          // Keep default values if API fails
        }
      });
  }

  getPropertyUsagePercentage(): number {
    if (!this.propertyStatus?.max_allowed || this.propertyStatus.max_allowed === 0) return 0;
    return (this.propertyStatus.used / this.propertyStatus.max_allowed) * 100;
  }

  toggleAutoRenew(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const newStatus = !this.subscriptionData.auto_renew;

    setTimeout(() => {
      this.subscriptionData.auto_renew = newStatus;
      Swal.fire({
        title: 'Success!',
        text: `Auto-renew ${newStatus ? 'enabled' : 'disabled'} successfully!`,
        icon: 'success',
        confirmButtonColor: '#F77C34',
        background: '#F2F4F3'
      });
      this.isProcessing = false;
    }, 800);
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
      cancelButtonText: 'Cancel',
      background: '#F2F4F3'
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
      cancelButtonText: 'Cancel',
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
    this.router.navigate(['/subscription']);
  }

  private processSubscriptionAction(url: string, successMessage: string): void {
    this.isProcessing = true;
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
        this.loadPropertyStatus();
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
}