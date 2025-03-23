import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ForgotPasswordComponent {
  forgotPasswordEmail: string = ''; 

  constructor(private authService: AuthService) {}  

  onForgotPassword() {
    if (!this.forgotPasswordEmail) {
      alert('Please enter your email address.');
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: () => {
        alert('Password reset link sent to your email!');
      },
      error: (error) => {
        alert('Failed to send reset link: ' + error.message);
      },
    });
  }
}
