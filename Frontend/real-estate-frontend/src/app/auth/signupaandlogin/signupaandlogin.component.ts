import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyAuthService } from '../../services/company-auth.service';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';

@Component({
  selector: 'app-signupaandlogin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signupaandlogin.component.html',
  styleUrls: ['./signupaandlogin.component.css']
})
export class SignupaandloginComponent implements OnInit, AfterViewInit {
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

  // Simple notification system
  notification = {
    show: false,
    message: '',
    type: 'info' // 'info' | 'success' | 'error'
  };

  // Clean error messages
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
    private companyAuthService: CompanyAuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['access_token'];
      const error = params['error'];

      if (error) {
        this.showNotification('Google login failed', 'error');
        return;
      }

      if (token) {
        localStorage.setItem('auth_token', token);
        this.authService.saveToken(token);

        this.authService.getUser().subscribe({
          next: (user: User) => {
            this.authService.saveUser(user);
            this.showNotification('Login successful', 'success');
            this.router.navigate(['/home']);
          },
          error: () => {
            this.showNotification('Failed to load user data', 'error');
            this.router.navigate(['/home']);
          }
        });
      }
    });
  }

  // Simple notification methods
  showNotification(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 4000) {
    this.notification = {
      show: true,
      message: message,
      type: type
    };
    setTimeout(() => this.hideNotification(), duration);
  }

  hideNotification() {
    this.notification.show = false;
  }

  // Field validation helpers
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

  // Form validation methods
  validateUserForm(): boolean {
    let isValid = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Clear previous errors
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));

    // First name
    if (!this.first_name) {
      this.showFieldError('first_name', 'First name required');
      isValid = false;
    } else if (this.first_name.length < 2) {
      this.showFieldError('first_name', 'Minimum 2 characters');
      isValid = false;
    }

    // Last name
    if (!this.last_name) {
      this.showFieldError('last_name', 'Last name required');
      isValid = false;
    } else if (this.last_name.length < 2) {
      this.showFieldError('last_name', 'Minimum 2 characters');
      isValid = false;
    }

    // Email
    if (!this.email) {
      this.showFieldError('email', 'Email required');
      isValid = false;
    } else if (!emailPattern.test(this.email)) {
      this.showFieldError('email', 'Enter valid email');
      isValid = false;
    }

    // Country
    if (!this.country) {
      this.showFieldError('country', 'Select country');
      isValid = false;
    }

    // Phone number (if provided)
    if (this.phone_number && this.country === 'EG' && !this.phone_number.startsWith('+2')) {
      this.showFieldError('phone_number', 'Start with +2');
      isValid = false;
    }

    // Password
    if (!this.password) {
      this.showFieldError('password', 'Password required');
      isValid = false;
    } else if (this.password.length < 8) {
      this.showFieldError('password', 'Minimum 8 characters');
      isValid = false;
    }

    // Confirm password
    if (!this.confirmPassword) {
      this.showFieldError('confirmPassword', 'Confirm password');
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.showFieldError('confirmPassword', 'Passwords don\'t match');
      isValid = false;
    }

    // Terms
    if (!this.terms_and_conditions) {
      this.showFieldError('terms_and_conditions', 'Accept terms to continue');
      isValid = false;
    }

    if (!isValid) {
      this.showNotification('Please check the form', 'error');
    }

    return isValid;
  }

  validateCompanyForm(): boolean {
    let isValid = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Clear previous errors
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));

    // Company name
    if (!this.company.company_name) {
      this.showFieldError('company_name', 'Company name required');
      isValid = false;
    }

    // Company email
    if (!this.company.company_email) {
      this.showFieldError('company_email', 'Email required');
      isValid = false;
    } else if (!emailPattern.test(this.company.company_email)) {
      this.showFieldError('company_email', 'Enter valid email');
      isValid = false;
    }

    // Company phone
    if (!this.company.company_phone_number) {
      this.showFieldError('company_phone_number', 'Phone required');
      isValid = false;
    }

    // Password
    if (!this.company.password) {
      this.showFieldError('company_password', 'Password required');
      isValid = false;
    } else if (this.company.password.length < 8) {
      this.showFieldError('company_password', 'Minimum 8 characters');
      isValid = false;
    }

    // Confirm password
    if (!this.company.password_confirmation) {
      this.showFieldError('company_confirm_password', 'Confirm password');
      isValid = false;
    } else if (this.company.password !== this.company.password_confirmation) {
      this.showFieldError('company_confirm_password', 'Passwords don\'t match');
      isValid = false;
    }

    // Terms
    if (!this.company.accept_terms) {
      this.showFieldError('company_accept_terms', 'Accept terms to continue');
      isValid = false;
    }

    // Documents
    if (!this.company.commercial_registration_doc) {
      this.showNotification('Commercial document required', 'error');
      isValid = false;
    }

    if (!this.company.tax_card_doc) {
      this.showNotification('Tax document required', 'error');
      isValid = false;
    }

    if (!this.company.proof_of_address_doc) {
      this.showNotification('Address proof required', 'error');
      isValid = false;
    }

    return isValid;
  }

  validateLoginForm(): boolean {
    let isValid = true;

    // Clear previous errors
    this.clearFieldError('loginEmail');
    this.clearFieldError('loginPassword');

    // Email
    if (!this.loginEmail) {
      this.showFieldError('loginEmail', 'Email required');
      isValid = false;
    }

    // Password
    if (!this.loginPassword) {
      this.showFieldError('loginPassword', 'Password required');
      isValid = false;
    }

    if (!isValid) {
      this.showNotification('Enter email and password', 'error');
    }

    return isValid;
  }

  // Form toggle methods
  toggleLoginType() {
    this.userType = this.userType === 'user' ? 'company' : 'user';
    this.showNotification(`Switched to ${this.userType} login`, 'info');
  }

  toggleSignupMode() {
    this.isCompanySignup = !this.isCompanySignup;
    this.showNotification(`Switched to ${this.isCompanySignup ? 'company' : 'individual'} signup`, 'info');
  }

  toggleForms() {
    const container = document.getElementById('container');
    container?.classList.toggle('active');
  }

  // File handling
  onFileSelected(event: any, field: string) {
    const file: File = event.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        this.showNotification('Only PDF, JPG or PNG files', 'error');
        return;
      }

      if (file.size > maxSize) {
        this.showNotification('Max file size 5MB', 'error');
        return;
      }

      this.company[field] = file;
      this.showNotification(`${field.replace(/_/g, ' ')} uploaded`, 'success');
    }
  }

  // Form submission methods
  onCompanySignupSubmit() {
    if (!this.validateCompanyForm()) return;

    this.showNotification('Processing registration...', 'info');

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
      formData.append('years_in_real_estate', this.company.years_in_real_estate.toString());
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

    this.http.post('http://localhost:8000/api/v1/companies/register', formData).subscribe({
      next: () => {
        this.showNotification('Registration submitted', 'success');
        this.resetCompanyForm();
        this.toggleForms();
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Registration failed';
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  onSignupSubmit() {
    if (!this.validateUserForm()) return;

    this.showNotification('Creating account...', 'info');

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

    this.http.post('http://localhost:8000/api/v1/companies/register', userData).subscribe({
      next: () => {
        this.showNotification('Registration complete', 'success');
        this.resetSignupForm();
        this.toggleForms();
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Registration failed';
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  onLoginSubmit() {
    if (!this.validateLoginForm()) return;

    this.showNotification('Logging in...', 'info');

    if (this.userType === 'company') {
      this.companyAuthService.login({
        company_email: this.loginEmail,
        password: this.loginPassword
      }).subscribe({
        next: (success) => {
          if (success) {
            this.showNotification('Login successful', 'success');
            this.router.navigate(['/company']);
          } else {
            this.showNotification('Invalid credentials', 'error');
          }
        },
        error: () => {
          this.showNotification('Login failed', 'error');
        }
      });
    } else {
      this.authService.login({
        email: this.loginEmail,
        password: this.loginPassword
      }).subscribe({
        next: (response: any) => {
          this.showNotification('Welcome back', 'success');
          this.authService.saveToken(response.access_token);
          this.authService.saveUser(response.user);
          this.router.navigate(['/home']);
        },
        error: () => {
          this.showNotification('Login failed', 'error');
        }
      });
    }
  }

  // Form reset methods
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

  // Google sign in
  signInWithGoogle(event: Event) {
    event.preventDefault();
    this.showNotification('Redirecting to Google...', 'info');
    window.location.href = 'http://127.0.0.1:8000/auth/google';
  }

  // Forgot password
  navigateToForgotPassword() {
    this.showNotification('Redirecting...', 'info');
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