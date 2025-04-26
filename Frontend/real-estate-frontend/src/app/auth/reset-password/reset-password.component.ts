import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule], // Removed Router from imports
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetData = {
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  };

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Get token from URL
    this.route.params.subscribe(params => {
      this.resetData.token = params['token'];
    });
  }

  onSubmit() {
    if (this.resetData.password !== this.resetData.password_confirmation) {
      alert('Passwords do not match!');
      return;
    }

    this.http.post('http://localhost:8000/api/v1/password/reset-password', this.resetData)
      .subscribe({
        next: (response) => {
          alert('Password reset successfully!');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          alert('Error resetting password: ' + error.message);
        }
      });
  }
}