import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class ForgotPasswordComponent {
  forgotPasswordEmail: string = '';
  notification = {
    show: false,
    message: '',
    isError: false
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}  

  onForgotPassword() {
    if (!this.forgotPasswordEmail) {
      this.showNotification('Please enter your email address.', true);
      return;
    }

    if (!this.validateEmail(this.forgotPasswordEmail)) {
      this.showNotification('Please enter a valid email address.', true);
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: () => {
        this.showNotification('Password reset link sent to your email! Please check your inbox.', false);
        this.forgotPasswordEmail = ''; // Clear the field after successful submission
      },
      error: (error) => {
        this.showNotification(`Failed to send reset link: ${error.error?.message || error.message}`, true);
      },
    });
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private showNotification(message: string, isError: boolean) {
    this.notification.message = message;
    this.notification.isError = isError;
    this.notification.show = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    this.notification.show = false;
  }

  navigateToSignIn() {
    this.router.navigate(['/auth/login']);
  }
}