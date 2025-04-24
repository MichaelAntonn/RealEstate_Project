import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyAuthService } from '../../services/company-auth.service';
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
  userType: string = 'user'; // Default to user login

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
    isError: false,
    type: 'success' // 'success' | 'error' | 'warning' | 'info'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private companyAuthService: CompanyAuthService
  ) {}

  // Toggle between user and company login
  toggleLoginType() {
    this.userType = this.userType === 'user' ? 'company' : 'user';
    this.showInfoNotification(`Switched to ${this.userType} login mode`);
  }

  // Toggle between user and company signup forms
  toggleSignupMode() {
    this.isCompanySignup = !this.isCompanySignup;
    const mode = this.isCompanySignup ? 'Company' : 'Individual';
    this.showInfoNotification(`Switched to ${mode} signup form`);
  }

  // Toggle between login and signup forms
  toggleForms() {
    const container = document.getElementById('container');
    container?.classList.toggle('active');
    const formType = container?.classList.contains('active') ? 'Sign Up' : 'Sign In';
    this.showInfoNotification(`${formType} form displayed`);
  }

  // Handle file selection for company documents
  onFileSelected(event: any, field: string) {
    const file: File = event.target.files[0];
    if (file) {
      this.company[field] = file;
      this.showSuccessNotification(`${field.replace('_', ' ')} file selected`);
    }
  }

  // Handle company signup form submission
  onCompanySignupSubmit() {
    // Validate required fields
    if (
      !this.company.company_name ||
      !this.company.commercial_registration_number ||
      !this.company.company_email ||
      !this.company.company_phone_number ||
      !this.company.company_address ||
      !this.company.commercial_registration_doc ||
      !this.company.tax_card_doc ||
      !this.company.proof_of_address_doc ||
      !this.company.password ||
      !this.company.password_confirmation ||
      !this.company.accept_terms
    ) {
      this.showErrorNotification('Please fill all required fields');
      return;
    }

    if (this.company.password !== this.company.password_confirmation) {
      this.showErrorNotification('Passwords do not match');
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

    // Show loading notification
    this.showInfoNotification('Processing your registration...', 3000);

    // Send to backend
    this.http.post('http://localhost:8000/api/company/register', formData).subscribe({
      next: (response: any) => {
        this.showSuccessNotification('Company registration successful! Awaiting verification.');
        this.toggleForms(); // Switch to login form
        this.resetCompanyForm();
      },
      error: (error) => {
        console.error('Company registration failed:', error);
        const errorMsg = error.error?.message || 'Unknown error occurred';
        this.showErrorNotification(`Company registration failed: ${errorMsg}`);
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
        (input as HTMLInputElement).placeholder = message;
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
      confirmPasswordInput.placeholder = 'Passwords must match';
      isValid = false;
    }

    // Check terms acceptance
    if (!termsInput.checked) {
      termsInput.classList.add('error');
      isValid = false;
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

      // Show loading notification
      this.showInfoNotification('Processing your registration...', 3000);

      this.http.post('http://localhost:8000/api/v1/register', userData, { headers }).subscribe({
        next: () => {
          this.showSuccessNotification('Registration successful!');
          this.toggleForms(); // Switch to login form
          this.resetSignupForm();
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Registration failed';
          this.showErrorNotification(errorMsg);
        },
      });
    } else {
      this.showErrorNotification('Please correct the errors in the form');
    }
  }

  // Handle login form submission
  onLoginSubmit() {
    if (this.userType === 'company') {
      const credentials = {
        company_email: this.loginEmail,
        password: this.loginPassword
      };
      
      // Show loading notification
      this.showInfoNotification('Logging in...', 3000);

      this.companyAuthService.login(credentials).subscribe({
        next: (success) => {
          if (success) {
            this.showSuccessNotification('Company login successful!');
            this.router.navigate(['/company']);
          } else {
            this.showErrorNotification('Company login failed. Please check your credentials.');
          }
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Login failed';
          this.showErrorNotification(errorMsg);
        }
      });
    } else {
      // User login
      const credentials = {
        email: this.loginEmail,
        password: this.loginPassword
      };

      // Show loading notification
      this.showInfoNotification('Logging in...', 3000);

      this.authService.login(credentials).subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.access_token);
          this.authService.saveUser(response.user);
          localStorage.setItem('auth_token', response.access_token);
          this.showSuccessNotification('Login successful!');
          this.router.navigate(['/maindashboard']);
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Login failed';
          this.showErrorNotification(errorMsg);
        }
      });
    }
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
    this.showInfoNotification('Redirecting to Google authentication...');
    window.location.href = 'http://localhost:8000/api/v1/social/auth/google';
  }

  // Navigate to forgot password
  navigateToForgotPassword() {
    this.showInfoNotification('Redirecting to password recovery...');
    this.router.navigate(['/forgot-password']);
  }

  // Notification methods
  showNotification(message: string, isError: boolean = false, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: isError,
      type: isError ? 'error' : 'success'
    };

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  hideNotification() {
    this.notification.show = false;
  }

  showSuccessNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: false,
      type: 'success'
    };

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  showErrorNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: true,
      type: 'error'
    };

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  showWarningNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: false,
      type: 'warning'
    };

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  showInfoNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: false,
      type: 'info'
    };

    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  ngAfterViewInit() {
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
      });
    });
  }
}