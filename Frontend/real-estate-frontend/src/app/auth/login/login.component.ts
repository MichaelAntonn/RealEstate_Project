import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- استيراد FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // <-- استيراد CommonModule

@Component({
  selector: 'app-login',
  standalone: true, // <-- تحديد أن المكون standalone
  imports: [FormsModule, CommonModule], // <-- إضافة FormsModule و CommonModule هنا
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const credentials = {
      email: this.email,
      password: this.password
    };
    this.authService.login(credentials).subscribe(
      (response: any) => {
        console.log('Login successful:', response);

        this.authService.saveToken(response.access_token);
        this.authService.saveUser(response.user);

        this.router.navigate(['/dashboard']);
        localStorage.setItem('auth_token', response.access_token);
      },
      (error) => {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials.');
      }
    ); 
  }
  
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
  
  
  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}
