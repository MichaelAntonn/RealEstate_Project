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
  isLoading = true;

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
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    // مسح الأخطاء السابقة
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));
  
    // التحقق من الاسم الأول
    if (!this.first_name) {
      this.showFieldError('first_name', 'First name required');
      isValid = false;
    } else if (this.first_name.length < 2) {
      this.showFieldError('first_name', 'Minimum 2 characters');
      isValid = false;
    }
  
    // التحقق من الاسم الأخير
    if (!this.last_name) {
      this.showFieldError('last_name', 'Last name required');
      isValid = false;
    } else if (this.last_name.length < 2) {
      this.showFieldError('last_name', 'Minimum 2 characters');
      isValid = false;
    }
  
    // التحقق من البريد الإلكتروني
    if (!this.email) {
      this.showFieldError('email', 'Email required');
      isValid = false;
    } else if (!emailPattern.test(this.email)) {
      this.showFieldError('email', 'Enter valid email (e.g., example@gmail.com)');
      isValid = false;
    }
  
    // التحقق من كلمة المرور
    if (!this.password) {
      this.showFieldError('password', 'Password required');
      isValid = false;
    } else if (this.password.length < 8) {
      this.showFieldError('password', 'Minimum 8 characters');
      isValid = false;
    } else if (!passwordPattern.test(this.password)) {
      this.showFieldError('password', 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');
      isValid = false;
    }
  
    // التحقق من تأكيد كلمة المرور
    if (!this.confirmPassword) {
      this.showFieldError('confirmPassword', 'Confirm password');
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.showFieldError('confirmPassword', 'Passwords don\'t match');
      isValid = false;
    }
  
    // التحقق من الشروط والأحكام
    if (!this.terms_and_conditions) {
      this.showFieldError('terms_and_conditions', 'Accept terms to continue');
      isValid = false;
    }
  
    if (!isValid) {
      this.showNotification('Please check the form', 'error');
    }
  
    return isValid;
  }
passwordRequirements = {
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false
};

checkPasswordRequirements() {
  const pass = this.password;
  this.passwordRequirements = {
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /\d/.test(pass),
    specialChar: /[@$!%*?&]/.test(pass)
  };
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
      this.showFieldError('company_email', 'Enter valid email (e.g., company@example.com)');
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
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Same pattern used in Signup
  
    // Clear previous errors
    this.clearFieldError('loginEmail');
    this.clearFieldError('loginPassword');
  
    // Email validation
    if (!this.loginEmail) {
      this.showFieldError('loginEmail', 'Email is required');
      isValid = false;
    } else if (!emailPattern.test(this.loginEmail)) {
      this.showFieldError('loginEmail', 'Invalid email format (e.g., user@gmail.com)');
      isValid = false;
    }
  
    // Password validation
    if (!this.loginPassword) {
      this.showFieldError('loginPassword', 'Password is required');
      isValid = false;
    }
  
    if (!isValid) {
      // this.showNotification('errors in the entered data', 'error');
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
  
    this.authService.register(userData).subscribe({
      next: () => {
        this.showNotification('Registration complete', 'success');
        this.resetSignupForm();
        this.toggleForms();
      },
      error: (error) => {
        if (error.errors) {
          // معالجة أخطاء التحقق من الخادم
          this.handleServerValidationErrors(error.errors);
        } else {
          const errorMsg = error.message || 'Registration failed';
          this.showNotification(errorMsg, 'error');
        }
      }
    });
  }
  
  // دالة جديدة لمعالجة أخطاء التحقق من الخادم
  handleServerValidationErrors(errors: any) {
    // مسح الأخطاء السابقة
    Object.keys(this.errors).forEach(key => this.clearFieldError(key));
  
    // تعيين الأخطاء الجديدة
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        const errorMessages = errors[field];
        if (errorMessages.length > 0) {
          // نأخذ أول رسالة خطأ فقط لكل حقل
          this.showFieldError(field, errorMessages[0]);
        }
      }
    }
  
    this.showNotification('Please correct the form errors', 'error');
  }

  emailErrorMessage: string = '';
  loginErrorMessage: string = '';
  
  onLoginSubmit() {
    this.isLoading = true;
    this.emailErrorMessage = '';
    this.loginErrorMessage = '';
  
    if (!this.validateLoginForm()) return;
  
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.loginEmail)) {
      this.emailErrorMessage = 'Please enter a valid email address';
      return;
    }
  
    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.authService.saveToken(response.access_token);
        this.authService.saveUser(response.user);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isLoading = false;
        this.loginErrorMessage = 'Invalid credentials';
      }
    });
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