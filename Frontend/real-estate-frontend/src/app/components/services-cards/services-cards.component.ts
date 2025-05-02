// services-cards.component.ts
import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-services-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-cards.component.html',
  styleUrls: ['./services-cards.component.css']
})
export class ServicesCardsComponent implements AfterViewInit {
  isLoading = true;
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

  constructor(private router: Router,
    private http: HttpClient,
    private toastr: ToastrService) {}

  ngAfterViewInit() {
    this.setDefaultTiltedCard();
  }

  toggleTilt(event: MouseEvent) {
    const hoveredCard = event.currentTarget as HTMLElement;
    
    this.cards.forEach(card => {
      card.nativeElement.classList.remove('real-estate-tilted-card');
      card.nativeElement.classList.add('real-estate-normal-card');
    });
    
    hoveredCard.classList.add('real-estate-tilted-card');
    hoveredCard.classList.remove('real-estate-normal-card');
  }
  
  resetTilt() {
    const anyHovered = this.cards.some(card => 
      card.nativeElement.matches(':hover')
    );
    
    if (!anyHovered) {
      this.setDefaultTiltedCard();
    }
  }

  private setDefaultTiltedCard() {
    this.cards.forEach(card => {
      card.nativeElement.classList.remove('real-estate-tilted-card', 'real-estate-normal-card');
    });
    
    if (this.cards.length >= 2) {
      this.cards.toArray()[1].nativeElement.classList.add('real-estate-tilted-card');
    }
  }

  navigateToAddProperty() {
    this.http.get<{ allowed: boolean, message?: string }>('http://localhost:8000/api/v1/can-add-property')
      .subscribe({
        next: (res) => {
          if (res.allowed) {
            this.router.navigate(['/add-property']);
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoading = false;
  
          let message = error.error.message || 'An unexpected error occurred.';
          let title = 'Access Denied!';
          let htmlContent = '';
  
          if (message.includes('maximum number of properties')) {
            htmlContent = `
              <strong>You have reached the limit!</strong><br><br>
              ${message}<br>
              Please upgrade your subscription plan to add more properties.
            `;
          } else if (message.includes('active subscription')) {
            htmlContent = `
              <strong>You are not subscribed to this service.</strong><br><br>
              To access this feature, you need an active subscription.<br>
              Please subscribe now to unlock all premium features and continue enjoying our platform.
            `;
          } else {
            htmlContent = `<strong>${message}</strong>`;
          }
  
          Swal.fire({
            icon: 'error',
            title: title,
            html: htmlContent,
            confirmButtonText: 'Go to Subscription',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/subscription']);
            }
          });
        }
      });
  }  navigateToproperties() {
    this.router.navigate(['/properties'])
  }
  navigateToconsultation() {
    this.router.navigate(['/consultation'])
  }}