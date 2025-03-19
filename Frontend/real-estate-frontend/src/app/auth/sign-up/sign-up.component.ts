import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  fullName: string = '';
  username: string = '';
  email: string = '';
  phone: string = '';
  country: string = '';
  password: string = '';
  confirmPassword: string = '';

  onSubmit() {
    let isValid = true;

    const validateInput = (input: HTMLInputElement | HTMLSelectElement, message: string, pattern?: RegExp) => {
      if (input.value.trim() === '' || 
         (input instanceof HTMLInputElement && input.type === 'email' && !input.value.match(input.pattern)) || 
         (input.id === 'password' && input.value.length < 6) ||
         (input.id === 'username' && input.value.length < 8) ||
         (input.id === 'phone' && !input.value.match(/^01[0-9]{9}$/)) ||
         (input.id === 'fullName' && input.value.length < 3)) {
        
        input.classList.add('error');
        (input as HTMLInputElement).placeholder = message;
        input.value = ''; 
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    };

    const fullNameInput = document.getElementById('fullName') as HTMLInputElement;
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    const countryInput = document.getElementById('country') as HTMLSelectElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;

    validateInput(fullNameInput, 'Full name must be at least 3 characters');
    validateInput(usernameInput, 'Username must be at least 8 characters');
    validateInput(emailInput, 'Please enter a valid email');
    validateInput(phoneInput, 'Phone number must start with 01 and be 10 digits');
    validateInput(countryInput, 'Please select a country');
    validateInput(passwordInput, 'Password is required and must be at least 6 characters');

    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.classList.add('error');
      confirmPasswordInput.placeholder = 'Passwords must match';
      confirmPasswordInput.value = ''; 
      isValid = false;
    }

    if (isValid) {
      alert('Successfully signed up!');
      this.resetForm();
    }
  }

  resetForm() {
    this.fullName = '';
    this.username = '';
    this.email = '';
    this.phone = '';
    this.country = '';
    this.password = '';
    this.confirmPassword = '';
  }

  ngAfterViewInit() {
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
        input.placeholder = input.id.charAt(0).toUpperCase() + input.id.slice(1).replace(/([A-Z])/g, ' $1');  
      });
    });
  }
}