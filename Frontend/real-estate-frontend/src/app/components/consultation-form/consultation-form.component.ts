import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule,} from '@angular/forms';
import { ConsultantService } from '../../services/consultant.service';


@Component({
  selector: 'app-consultation-form',
  standalone: true,
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.css'],
  imports: [ReactiveFormsModule],
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
      message: [''] 
    });
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
        this.successMessage = response.message || 'Consultation request submitted successfully!';
        this.consultationForm.reset();
        setTimeout(() => (this.successMessage = ''), 5000);
      },
      error: (error) => {
        console.error('Error:', error); 
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message ||
          error.error?.errors?.[Object.keys(error.error?.errors)[0]]?.[0] ||
          'An error occurred. Please try again.';
        setTimeout(() => (this.errorMessage = ''), 5000);
      },
    });
  }
}