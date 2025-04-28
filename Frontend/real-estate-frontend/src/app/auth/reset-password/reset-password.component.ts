import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetData = {
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient, 
    private location: Location,
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.resetData.token = params['token'];
      this.location.replaceState('/reset-password');
    });
  }

  validatePassword(): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(this.resetData.password);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetData.password !== this.resetData.password_confirmation) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    if (!this.validatePassword()) {
      this.errorMessage = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
      return;
    }

    this.isLoading = true;

    this.http.post('http://localhost:8000/api/v1/password/reset-password', this.resetData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = response.success || 'Password reset successfully!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 
                             error.error?.message || 
                             'An error occurred while resetting your password';
        }
      });
  }
}