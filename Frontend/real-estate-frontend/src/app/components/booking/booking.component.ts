import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Property } from '../../models/property';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  @Output() bookingSubmitted = new EventEmitter<boolean>();
  bookingForm!: FormGroup;
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  today: NgbDateStruct;
  isLoading = false;
  propertyId: string | null = null;
  propertyTitle: string | null = null;
  propertySlug: string | null = null;
  isBookingDatepickerOpen = false;
  isVisitDatepickerOpen = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private calendar: NgbCalendar,
    private toastr: ToastrService
  ) {
    // Initialize today/min/max dates
    this.today = this.calendar.getToday();
    const currentDate = new Date();
    this.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };
    this.maxDate = {
      year: currentDate.getFullYear() + 1,
      month: 12,
      day: 31,
    };
  }

  ngOnInit(): void {
    // Get property ID from route
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (!this.propertyId) {
      this.toastr.error('Invalid property ID');
      this.router.navigate(['/properties']);
      return;
    }
    this.initForm();
    this.loadPropertyDetails();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      property_id: [this.propertyId, Validators.required],
      booking_date: [null, Validators.required],
      visit_date: [null],
      notes: [''],
    });
  }

  loadPropertyDetails(): void {
    if (!this.propertyId) return;
    this.propertyService.getProperty(+this.propertyId).subscribe({
      next: (property: Property) => {
        this.propertyTitle = property.title;
        this.propertySlug = property.slug;
      },
      error: (err) => {
        this.toastr.error('Failed to load property details');
        console.error(err);
      },
    });
  }

  goBackToProperty(): void {
    if (this.propertySlug) {
      this.router.navigate(['/properties', this.propertySlug]);
    } else {
      this.toastr.error('Unable to navigate back to property');
      this.router.navigate(['/properties']);
    }
  }

  onSubmit(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Please login to book a property');
      return;
    }

    if (this.bookingForm.invalid) {
      this.toastr.error('Please fill all required fields');
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValue = {
      property_id: this.bookingForm.value.property_id,
      booking_date: this.formatDate(this.bookingForm.value.booking_date),
      visit_date: this.bookingForm.value.visit_date
        ? this.formatDate(this.bookingForm.value.visit_date)
        : null,
      notes: this.bookingForm.value.notes,
      status: 'pending',
    };

    this.bookingService.createBooking(formValue).subscribe({
      next: () => {
        this.toastr.success('Booking request submitted successfully!');
        this.bookingSubmitted.emit(true);
        this.bookingForm.reset();
        this.bookingForm.patchValue({ property_id: this.propertyId });
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Failed to submit booking';
        this.toastr.error(errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private formatDate(dateObj: NgbDateStruct): string {
    if (!dateObj) return '';
    return `${dateObj.year}-${this.padNumber(dateObj.month)}-${this.padNumber(
      dateObj.day
    )}`;
  }

  private padNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  toggleBookingDatepicker(): void {
    this.isBookingDatepickerOpen = !this.isBookingDatepickerOpen;
    if (this.isVisitDatepickerOpen) {
      this.isVisitDatepickerOpen = false;
    }
  }

  toggleVisitDatepicker(): void {
    this.isVisitDatepickerOpen = !this.isVisitDatepickerOpen;
    if (this.isBookingDatepickerOpen) {
      this.isBookingDatepickerOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isInsideDatepicker = target.closest('.ngb-datepicker');
    const isInsideInput = target.closest('.form-control');

    if (!isInsideDatepicker && !isInsideInput) {
      this.isBookingDatepickerOpen = false;
      this.isVisitDatepickerOpen = false;
    }
  }
}