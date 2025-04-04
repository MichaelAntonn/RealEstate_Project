import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('onSubmit called with:', { email: this.email, password: this.password });
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    this.errorMessage = '';
    this.authService.adminLogin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.authService.setUserRole(response.user_type);
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'No token received from the server.';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Failed to log in. Please check your credentials.';
      },
      complete: () => {
        console.log('Login request completed');
      }
    });
  }
}