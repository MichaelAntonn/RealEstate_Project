import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  showModal = false;
  adminForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    city: '',
    address: '',
    terms_and_conditions: false,
    password: ''
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // No role check needed; AuthGuard ensures only super-admins reach this component
  }

  openModal(): void {
    this.showModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submitForm(): void {
    if (!this.adminForm.terms_and_conditions) {
      this.errorMessage = 'You must agree to the terms and conditions.';
      return;
    }

    this.dashboardService.createAdmin(this.adminForm).subscribe({
      next: (response) => {
        console.log('Admin created:', response);
        this.successMessage = 'Admin created successfully!';
        this.errorMessage = null;
        setTimeout(() => this.closeModal(), 2000); // Close after 2 seconds
      },
      error: (error) => {
        console.error('Error creating admin:', error);
        this.errorMessage = error.error?.message || 'Failed to create admin. Please try again.';
        this.successMessage = null;
      }
    });
  }

  resetForm(): void {
    this.adminForm = {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      country: '',
      city: '',
      address: '',
      terms_and_conditions: false,
      password: ''
    };
  }
}