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
  // Signup form fields
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

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  // Toggle between login and signup forms
  toggleForms() {
    const container = document.getElementById('container');
    container?.classList.toggle("active");
  }

  // Handle signup form submission
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

      this.http.post('http://localhost:8000/api/v1/register', userData, { headers }).subscribe({
        next: () => {
          alert('Registration successful!');
          this.toggleForms(); // Switch to login form
          this.resetSignupForm();
        },
        error: (error) => {
          alert('Registration failed: ' + JSON.stringify(error.error));
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
        alert('Login failed. Please check your credentials.');
      }
    );
  }

  // Reset signup form
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
    window.location.href = 'http://localhost:8000/api/v1/social/auth/google';
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