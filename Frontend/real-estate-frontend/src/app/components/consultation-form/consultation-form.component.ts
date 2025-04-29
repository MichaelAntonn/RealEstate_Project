import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultantService } from '../../services/consultant.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ConsultationFormComponent {
  consultationForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private consultantService: ConsultantService
  ) {
    this.consultationForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      type: ['', Validators.required],
      message: [''],
    });
  }

  // Getters for form controls
  get fullName() {
    return this.consultationForm.get('full_name');
  }

  get email() {
    return this.consultationForm.get('email');
  }

  get phone() {
    return this.consultationForm.get('phone');
  }

  get type() {
    return this.consultationForm.get('type');
  }

  onSubmit(): void {
    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      return;
    }

    console.log('Form Data:', this.consultationForm.value);

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.consultantService.submitConsultation(this.consultationForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Show SweetAlert2 success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Consultation request sent successfully!',
          timer: 3000,
          showConfirmButton: false,
        });
        this.consultationForm.reset();
      },
      error: (error) => {
        console.error('Error:', error);
        this.isSubmitting = false;
        // Show SweetAlert2 error message
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: error.error?.message || 'An error occurred. Please try again.',
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });
  }
}