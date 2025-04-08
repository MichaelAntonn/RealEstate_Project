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

  commissionRate: number = 0; // Current commission rate
  newCommissionRate: number = 0; // For input binding
  commissionError: string | null = null;
  commissionSuccess: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchCommissionRate();
  }

  fetchCommissionRate(): void {
    this.dashboardService.getCommissionRate().subscribe({
      next: (response) => {
        if (response.success) {
          this.commissionRate = response.commission_rate * 100; // Convert to percentage
          this.newCommissionRate = this.commissionRate; // Sync input field
          console.log('Commission rate fetched:', this.commissionRate);
        }
      },
      error: (error) => {
        console.error('Error fetching commission rate:', error);
        this.commissionError = 'Failed to load commission rate.';
      }
    });
  }

  updateCommissionRate(): void {
    if (this.newCommissionRate < 0 || this.newCommissionRate > 100) {
      this.commissionError = 'Commission rate must be between 0% and 100%.';
      return;
    }

    this.dashboardService.updateCommissionRate(this.newCommissionRate / 100).subscribe({
      next: (response) => {
        this.commissionRate = this.newCommissionRate;
        this.commissionSuccess = 'Commission rate updated successfully!';
        this.commissionError = null;
        console.log('Commission rate updated:', this.commissionRate);
        setTimeout(() => this.commissionSuccess = null, 3000); // Clear success message after 3s
      },
      error: (error) => {
        console.error('Error updating commission rate:', error);
        this.commissionError = 'Failed to update commission rate.';
        this.commissionSuccess = null;
      }
    });
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
        setTimeout(() => this.closeModal(), 2000);
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