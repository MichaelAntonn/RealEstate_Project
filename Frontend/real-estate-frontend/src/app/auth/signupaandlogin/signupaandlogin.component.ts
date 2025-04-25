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
  userType: string = 'user';

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
    type: 'success'
  };

  // Error messages
  errors: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    password: '',
    confirmPassword: '',
    terms_and_conditions: '',
    company_name: '',
    company_email: '',
    company_phone_number: '',
    company_password: '',
    company_confirm_password: '',
    company_accept_terms: '',
    loginEmail: '',
    loginPassword: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private companyAuthService: CompanyAuthService
  ) {}

  // Notification methods
  showNotification(message: string, isError: boolean = false, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: isError,
      type: isError ? 'error' : 'success'
    };
    setTimeout(() => this.hideNotification(), duration);
  }

  hideNotification() {
    this.notification.show = false;
  }

  showSuccessNotification(message: string, duration: number = 5000) {
    this.showNotification(message, false, duration);
  }

  showErrorNotification(message: string, duration: number = 5000) {
    this.showNotification(message, true, duration);
  }

  showWarningNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: false,
      type: 'warning'
    };
    setTimeout(() => this.hideNotification(), duration);
  }

  showInfoNotification(message: string, duration: number = 5000) {
    this.notification = {
      show: true,
      message: message,
      isError: false,
      type: 'info'
    };
    setTimeout(() => this.hideNotification(), duration);
  }

  // Error handling methods
  showFieldError(field: string, message: string) {
    this.errors[field] = message;
    const element = document.getElementById(field);
    if (element) {
      element.classList.add('error');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  clearFieldError(field: string) {
    this.errors[field] = '';
    const element = document.getElementById(field);
    if (element) element.classList.remove('error');
  }

  validateField(field: string, value: any, rules: any): boolean {
    this.clearFieldError(field);

    if (rules.required && !value) {
      this.showFieldError(field, rules.requiredMessage || 'This field is required');
      return false;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      this.showFieldError(field, `Must be at least ${rules.minLength} characters`);
      return false;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      this.showFieldError(field, rules.patternMessage || 'Invalid format');
      return false;
    }

    if (rules.match && value !== rules.match) {
      this.showFieldError(field, rules.matchMessage || 'Values do not match');
      return false;
    }

    return true;
  }

  // Form validation methods
  validateUserForm(): boolean {
    let isValid = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    isValid = this.validateField('first_name', this.first_name, {
      required: true,
      minLength: 3,
      requiredMessage: 'First name is required'
    }) && isValid;

    isValid = this.validateField('last_name', this.last_name, {
      required: true,
      minLength: 3,
      requiredMessage: 'Last name is required'
    }) && isValid;

    isValid = this.validateField('email', this.email, {
      required: true,
      pattern: emailPattern,
      patternMessage: 'Invalid email format'
    }) && isValid;

    isValid = this.validateField('country', this.country, {
      required: true,
      requiredMessage: 'Country is required'
    }) && isValid;

    isValid = this.validateField('password', this.password, {
      required: true,
      minLength: 8,
      requiredMessage: 'Password is required'
    }) && isValid;

    isValid = this.validateField('confirmPassword', this.confirmPassword, {
      required: true,
      match: this.password,
      matchMessage: 'Passwords do not match'
    }) && isValid;

    if (!this.terms_and_conditions) {
      this.showFieldError('terms_and_conditions', 'You must accept the terms');
      isValid = false;
    }

    if (!isValid) {
      this.showErrorNotification('Please correct the form errors');
    }

    return isValid;
  }

  validateCompanyForm(): boolean {
    let isValid = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    isValid = this.validateField('company_name', this.company.company_name, {
      required: true,
      requiredMessage: 'Company name is required'
    }) && isValid;

    isValid = this.validateField('company_email', this.company.company_email, {
      required: true,
      pattern: emailPattern,
      patternMessage: 'Invalid email format'
    }) && isValid;

    isValid = this.validateField('company_phone_number', this.company.company_phone_number, {
      required: true,
      requiredMessage: 'Company phone is required'
    }) && isValid;

    isValid = this.validateField('company_password', this.company.password, {
      required: true,
      minLength: 8,
      requiredMessage: 'Password is required'
    }) && isValid;

    isValid = this.validateField('company_confirm_password', this.company.password_confirmation, {
      required: true,
      match: this.company.password,
      matchMessage: 'Passwords do not match'
    }) && isValid;

    if (!this.company.accept_terms) {
      this.showFieldError('company_accept_terms', 'You must accept the terms');
      isValid = false;
    }

    if (!isValid) {
      this.showErrorNotification('Please correct the form errors');
    }

    return isValid;
  }

  validateLoginForm(): boolean {
    let isValid = true;

    isValid = this.validateField('loginEmail', this.loginEmail, {
      required: true,
      requiredMessage: 'Email is required'
    }) && isValid;

    isValid = this.validateField('loginPassword', this.loginPassword, {
      required: true,
      requiredMessage: 'Password is required'
    }) && isValid;

    if (!isValid) {
      this.showErrorNotification('Please fill all required fields');
    }

    return isValid;
  }

  // Form submission methods
  onSignupSubmit() {
    if (!this.validateUserForm()) return;

    const userData = {
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone_number: this.phone_number,
      country: this.country,
      password: this.password,
      password_confirmation: this.confirmPassword,
      terms_and_conditions: this.terms_and_conditions ? 1 : 0
    };

    this.showInfoNotification('Creating your account...');

    this.http.post('http://localhost:8000/api/v1/register', userData).subscribe({
      next: () => {
        this.showSuccessNotification('Registration successful!');
        this.resetSignupForm();
        this.toggleForms();
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Registration failed';
        this.showErrorNotification(errorMsg);
      }
    });
  }

  onCompanySignupSubmit() {
    if (!this.validateCompanyForm()) return;

    const formData = new FormData();
    Object.keys(this.company).forEach(key => {
      if (this.company[key] !== null) {
        formData.append(key, this.company[key]);
      }
    });

    this.showInfoNotification('Registering your company...');

    this.http.post('http://localhost:8000/api/company/register', formData).subscribe({
      next: () => {
        this.showSuccessNotification('Company registration successful! Pending verification');
        this.resetCompanyForm();
        this.toggleForms();
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Company registration failed';
        this.showErrorNotification(errorMsg);
      }
    });
  }

  onLoginSubmit() {
    if (!this.validateLoginForm()) return;

    this.showInfoNotification('Logging in...');

    if (this.userType === 'company') {
      this.companyAuthService.login({
        company_email: this.loginEmail,
        password: this.loginPassword
      }).subscribe({
        next: (success) => {
          if (success) {
            this.showSuccessNotification('Login successful as company');
            this.router.navigate(['/company']);
          } else {
            this.showErrorNotification('Invalid credentials');
          }
        },
        error: () => {
          this.showErrorNotification('Login failed');
        }
      });
    } else {
      this.authService.login({
        email: this.loginEmail,
        password: this.loginPassword
      }).subscribe({
        next: (response: any) => {
          this.showSuccessNotification('Login successful');
          this.authService.saveToken(response.access_token);
          this.authService.saveUser(response.user);
          this.router.navigate(['/maindashboard']);
        },
        error: () => {
          this.showErrorNotification('Invalid credentials');
        }
      });
    }
  }

  // Other methods
  toggleLoginType() {
    this.userType = this.userType === 'user' ? 'company' : 'user';
    this.showInfoNotification(`Switched to ${this.userType} login`);
  }

  toggleSignupMode() {
    this.isCompanySignup = !this.isCompanySignup;
    this.showInfoNotification(`Switched to ${this.isCompanySignup ? 'company' : 'individual'} signup`);
  }

  toggleForms() {
    const container = document.getElementById('container');
    container?.classList.toggle('active');
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.company[field] = file;
      this.showSuccessNotification(`${field.replace('_', ' ')} file selected`);
    }
  }

  resetSignupForm() {
    this.first_name = '';
    this.last_name = '';
    this.email = '';
    this.phone_number = '';
    this.country = '';
    this.password = '';
    this.confirmPassword = '';
    this.terms_and_conditions = false;
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));
  }

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
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));
  }

  signInWithGoogle() {
    this.showInfoNotification('Redirecting to Google login...');
    window.location.href = 'http://localhost:8000/api/v1/social/auth/google';
  }

  navigateToForgotPassword() {
    this.showInfoNotification('Redirecting to password recovery...');
    this.router.navigate(['/forgot-password']);
  }

  ngAfterViewInit() {
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
        const field = input.id;
        if (field && this.errors[field]) {
          this.errors[field] = '';
        }
      });
    });
  }
}