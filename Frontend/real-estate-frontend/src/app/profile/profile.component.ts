import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faLock, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Font Awesome Icons
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faMapMarkerAlt = faMapMarkerAlt;
  faLock = faLock;
  faTrashAlt = faTrashAlt;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  profileData: any;
  isLoading = true;
  isEditing = false;
  isPasswordEditing = false;
  countries = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Other'];
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      country: [''],
      city: [''],
      address: [''],
      profile_image: ['']
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      new_password_confirmation: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('new_password')?.value;
    const confirmPassword = formGroup.get('new_password_confirmation')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profileData = response.profile;
        this.profileForm.patchValue(this.profileData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load profile data. Please try again later.',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.profileForm.patchValue({
          profile_image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue(this.profileData);
      this.previewImage = null;
    }
  }

  togglePasswordEdit(): void {
    this.isPasswordEditing = !this.isPasswordEditing;
    if (!this.isPasswordEditing) {
      this.passwordForm.reset();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    this.isLoading = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.profileData = response.profile;
        this.isEditing = false;
        this.isLoading = false;
        
        // Update local storage if email or name changed
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.first_name = this.profileData.first_name;
        user.last_name = this.profileData.last_name;
        user.email = this.profileData.email;
        localStorage.setItem('user', JSON.stringify(user));
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile updated successfully!',
          confirmButtonColor: '#3085d6',
          timer: 3000
        });
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.error?.message || 'Failed to update profile',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Passwords do not match',
          confirmButtonColor: '#3085d6'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please fill all required fields correctly. Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
          confirmButtonColor: '#3085d6'
        });
      }
      return;
    }

    this.isLoading = true;
    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (response) => {
        this.isPasswordEditing = false;
        this.passwordForm.reset();
        this.isLoading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Password changed successfully!',
          confirmButtonColor: '#3085d6',
          timer: 3000
        });
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.isLoading = false;
        let errorMessage = error.error?.error || 'Failed to change password';
        if (error.error?.message) {
          errorMessage += ': ' + error.error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  confirmDelete(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! All your data will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      backdrop: `
        rgba(210,0,0,0.4)
        url("/assets/images/nyan-cat.gif")
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.profileService.deleteAccount().subscribe({
          next: () => {
            this.authService.logout().subscribe(() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              
              Swal.fire({
                title: 'Deleted!',
                text: 'Your account has been permanently deleted.',
                icon: 'success',
                confirmButtonColor: '#3085d6'
              }).then(() => {
                this.router.navigate(['/login']);
              });
            });
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to delete account. Please try again later.',
              confirmButtonColor: '#3085d6'
            });
          }
        });
      }
    });
  }
}