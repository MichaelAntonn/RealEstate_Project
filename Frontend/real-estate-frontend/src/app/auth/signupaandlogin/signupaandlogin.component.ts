import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signupaandlogin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signupaandlogin.component.html',
  styleUrls: ['./signupaandlogin.component.css']
})
export class SignupaandloginComponent implements AfterViewInit {
  // User Signup form fields
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  phone_number: string = '';
  country: string = '';
  password: string = '';
  confirmPassword: string = '';
  terms_and_conditions: boolean = false;

  // Login form fields
  loginEmail: string = '';
  loginPassword: string = '';

  // Company Signup form fields
  isCompanySignup: boolean = false;
  company: any = {
    company_name: '',
    commercial_registration_number: '',
    company_email: '',
    company_phone_number: '',
    company_address: '',
    commercial_registration_doc: null,
    tax_card_doc: null,
    proof_of_address_doc: null,
    real_estate_license_doc: null,
    years_in_real_estate: null,
    company_website: '',
    date_of_establishment: '',
    password: '',
    password_confirmation: '',
    accept_terms: false
  };

  // Notification system
  notification = {
    show: false,
    message: '',
    isError: false
  };

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
    // Check for Google OAuth callback
    this.checkForGoogleCallback();
  }

  // Check if this is a Google OAuth callback
  private checkForGoogleCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (code && state) {
      this.handleGoogleCallback(code, state);
    }
  }

  // Handle Google OAuth callback
  private handleGoogleCallback(code: string, state: string) {
    this.http.post('http://localhost:8000/auth/google/callback', { code, state })
      .subscribe({
        next: (response: any) => {
          if (response.access_token) {
            this.authService.saveToken(response.access_token);
            this.authService.saveUser(response.user);
            this.router.navigate(['/maindashboard']);
            this.showNotification('Login with Google successful!', false);
          } else {
            this.showNotification('Google authentication failed. Please try again.', true);
          }
        },
        error: (error) => {
          console.error('Google authentication error:', error);
          this.showNotification('Error during Google authentication. Please try again.', true);
        }
      });
  }

  // Show notification
  showNotification(message: string, isError: boolean = false) {
    this.notification = {
      show: true,
      message: message,
      isError: isError
    };

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  // Hide notification
  hideNotification() {
    this.notification.show = false;
  }

  // Toggle between user and company signup forms
  toggleSignupMode() {
    this.isCompanySignup = !this.isCompanySignup;
  }

  // Toggle between login and signup forms
  toggleForms() {
    const container = document.getElementById('container');
    container?.classList.toggle("active");
  }

  // Handle file selection for company documents
  onFileSelected(event: any, field: string) {
    const file: File = event.target.files[0];
    if (file) {
      this.company[field] = file;
    }
  }

  // Handle company signup form submission
  onCompanySignupSubmit() {
    // Validate required fields
    if (!this.company.company_name || 
        !this.company.commercial_registration_number || 
        !this.company.company_email || 
        !this.company.company_phone_number || 
        !this.company.company_address || 
        !this.company.commercial_registration_doc || 
        !this.company.tax_card_doc || 
        !this.company.proof_of_address_doc || 
        !this.company.password || 
        !this.company.password_confirmation || 
        !this.company.accept_terms) {
      this.showNotification('Please fill all required fields', true);
      return;
    }

    if (this.company.password !== this.company.password_confirmation) {
      this.showNotification('Passwords do not match', true);
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('company_name', this.company.company_name);
    formData.append('commercial_registration_number', this.company.commercial_registration_number);
    formData.append('company_email', this.company.company_email);
    formData.append('company_phone_number', this.company.company_phone_number);
    formData.append('company_address', this.company.company_address);
    formData.append('commercial_registration_doc', this.company.commercial_registration_doc);
    formData.append('tax_card_doc', this.company.tax_card_doc);
    formData.append('proof_of_address_doc', this.company.proof_of_address_doc);
    if (this.company.real_estate_license_doc) {
      formData.append('real_estate_license_doc', this.company.real_estate_license_doc);
    }
    if (this.company.years_in_real_estate) {
      formData.append('years_in_real_estate', this.company.years_in_real_estate);
    }
    if (this.company.company_website) {
      formData.append('company_website', this.company.company_website);
    }
    if (this.company.date_of_establishment) {
      formData.append('date_of_establishment', this.company.date_of_establishment);
    }
    formData.append('password', this.company.password);
    formData.append('password_confirmation', this.company.password_confirmation);
    formData.append('accept_terms', this.company.accept_terms ? '1' : '0');

    // Send to backend
    this.http.post('http://localhost:8000/api/company/register', formData).subscribe({
      next: (response: any) => {
        this.showNotification('Company registration successful! Awaiting verification.', false);
        this.toggleForms(); // Switch to login form
        this.resetCompanyForm();
      },
      error: (error) => {
        console.error('Company registration failed:', error);
        this.showNotification('Company registration failed: ' + (error.error?.message || 'Unknown error'), true);
      }
    });
  }

  // Reset company form
  resetCompanyForm() {
    this.company = {
      company_name: '',
      commercial_registration_number: '',
      company_email: '',
      company_phone_number: '',
      company_address: '',
      commercial_registration_doc: null,
      tax_card_doc: null,
      proof_of_address_doc: null,
      real_estate_license_doc: null,
      years_in_real_estate: null,
      company_website: '',
      date_of_establishment: '',
      password: '',
      password_confirmation: '',
      accept_terms: false
    };
  }

  // Handle user signup form submission
  onSignupSubmit() {
    let isValid = true;

    // Validation function
    const validateInput = (input: HTMLInputElement | HTMLSelectElement, message: string, pattern?: RegExp) => {
      if (
        input.value.trim() === '' ||
        (pattern && !pattern.test(input.value)) ||
        (input.id === 'password' && input.value.length < 8) ||
        (input.id === 'first_name' && input.value.length < 3) ||
        (input.id === 'last_name' && input.value.length < 3)
      ) {
        input.classList.add('error');
        this.showNotification(message, true);
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    };

    const first_nameInput = document.getElementById('first_name') as HTMLInputElement;
    const last_nameInput = document.getElementById('last_name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phone_numberInput = document.getElementById('phone_number') as HTMLInputElement;
    const countryInput = document.getElementById('country') as HTMLSelectElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    const termsInput = document.getElementById('terms_and_conditions') as HTMLInputElement;

    // Validate inputs
    validateInput(first_nameInput, 'First name must be at least 3 characters');
    validateInput(last_nameInput, 'Last name must be at least 3 characters');
    validateInput(emailInput, 'Please enter a valid email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    validateInput(countryInput, 'Please select a country');
    validateInput(passwordInput, 'Password must be at least 8 characters');

    // Check password match
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.classList.add('error');
      this.showNotification('Passwords must match', true);
      isValid = false;
    } else {
      confirmPasswordInput.classList.remove('error');
    }

    // Check terms acceptance
    if (!termsInput.checked) {
      termsInput.classList.add('error');
      this.showNotification('You must accept the terms and conditions', true);
      isValid = false;
    } else {
      termsInput.classList.remove('error');
    }

    if (isValid) {
      const userData = {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        phone_number: this.phone_number || null,
        country: this.country || null,
        password: this.password,
        password_confirmation: this.confirmPassword,
        terms_and_conditions: this.terms_and_conditions ? 1 : 0,
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      this.http.post('http://localhost:8000/api/v1/register', userData, { headers }).subscribe({
        next: () => {
          this.showNotification('Registration successful!', false);
          this.toggleForms(); // Switch to login form
          this.resetSignupForm();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Registration failed';
          this.showNotification(errorMessage, true);
        },
      });
    }
  }

  // Handle login form submission
  onLoginSubmit() {
    const credentials = {
      email: this.loginEmail,
      password: this.loginPassword
    };

    this.authService.login(credentials).subscribe(
      (response: any) => {
        console.log('Login successful:', response);

        this.authService.saveToken(response.access_token);
        this.authService.saveUser(response.user);

        this.router.navigate(['/maindashboard']);
        localStorage.setItem('auth_token', response.access_token);
      },
      (error) => {
        console.error('Login failed:', error);
        this.showNotification('Login failed. Please check your credentials.', true);
      }
    );
  }

  // Reset user signup form
  resetSignupForm() {
    this.first_name = '';
    this.last_name = '';
    this.email = '';
    this.phone_number = '';
    this.country = '';
    this.password = '';
    this.confirmPassword = '';
    this.terms_and_conditions = false;
  }

  // Google sign in
  signInWithGoogle() {
    window.location.href = 'http://localhost:8000/auth/google/redirect';
  }

  // Navigate to forgot password
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  ngAfterViewInit() {
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
      });
    });
  }
}