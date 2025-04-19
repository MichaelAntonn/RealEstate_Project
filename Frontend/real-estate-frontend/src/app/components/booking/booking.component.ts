import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbCalendar, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  @Input() propertyId!: string;
  @Output() bookingSubmitted = new EventEmitter<boolean>();
  @ViewChild('customDay', { static: true }) customDayTemplate!: TemplateRef<any>;
  
  bookingForm!: FormGroup;
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  today: NgbDateStruct;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private calendar: NgbCalendar,
    private config: NgbDatepickerConfig,
    private toastr: ToastrService
  ) {
    // Initialize dates after constructor
    this.today = this.calendar.getToday();
    const currentDate = new Date();
    this.minDate = { 
      year: currentDate.getFullYear(), 
      month: currentDate.getMonth() + 1, 
      day: currentDate.getDate() 
    };
    this.maxDate = { 
      year: currentDate.getFullYear() + 1, 
      month: 12, 
      day: 31 
    };

    // Configure datepicker
    this.config.markDisabled = (date: NgbDateStruct) => {
      const d = new Date(date.year, date.month - 1, date.day);
      return d.getDay() === 0 || d.getDay() === 6;
    };
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      property_id: [this.propertyId, Validators.required],
      booking_date: [null, Validators.required],
      visit_date: [null],
      notes: ['']
    });
  }

  isWeekend(date: NgbDateStruct): boolean {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  onSubmit(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Please login to book a property');
      this.router.navigate(['/login']);
      return;
    }

    if (this.bookingForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;

    // Format dates for backend
    const formValue = {
      ...this.bookingForm.value,
      booking_date: this.formatDate(this.bookingForm.value.booking_date),
      visit_date: this.bookingForm.value.visit_date ? this.formatDate(this.bookingForm.value.visit_date) : null
    };

    this.bookingService.createBooking(formValue).subscribe({
      next: (response) => {
        this.toastr.success('Booking request submitted successfully!');
        this.bookingSubmitted.emit(true);
        this.bookingForm.reset();
        this.bookingForm.patchValue({ property_id: this.propertyId });
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.toastr.error(err.message || 'Failed to submit booking');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private formatDate(dateObj: NgbDateStruct): string {
    if (!dateObj) return '';
    return `${dateObj.year}-${this.padNumber(dateObj.month)}-${this.padNumber(dateObj.day)}`;
  }

  private padNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}