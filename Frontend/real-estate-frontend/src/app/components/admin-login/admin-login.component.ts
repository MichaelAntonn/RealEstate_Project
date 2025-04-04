import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule for formGroup

@Component({
  selector: 'app-admin-login',
  standalone: true, // Ensure the component is marked as standalone
  imports: [CommonModule, ReactiveFormsModule], // Add CommonModule and ReactiveFormsModule
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  sessionExpiredMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.sessionExpiredMessage = 'Your session has expired. Please log in again.';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.sessionExpiredMessage = null;

    const credentials = this.loginForm.value;
    console.log('onSubmit called with:', credentials);
    this.authService.adminLogin(credentials).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response && response.token && response.user_type) {
          localStorage.setItem('token', response.token);
          this.authService.setUserRole(response.user_type);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          console.log('Navigating to:', returnUrl);
          this.router.navigateByUrl(returnUrl).catch(err => {
            console.error('Navigation error:', err);
            this.router.navigate(['/admin/dashboard']);
          });
        } else {
          console.error('Login response is missing token or user_type:', response);
          this.errorMessage = 'Invalid login response from server. Please try again.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Login request completed');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}