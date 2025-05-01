import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
  FormsModule,
} from '@angular/forms';
import { PropertyService } from '../services/property.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { Property, PropertyMedia } from '../models/property';
import { HttpClient } from '@angular/common/http';
declare const L: any;
// import * as L from 'leaflet';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css'],
})
export class AddPropertyComponent implements OnInit, AfterViewInit {
  propertyForm!: FormGroup;
  isEditMode = false;
  propertyId: number | null = null;
  selectedFiles: File[] = [];
  existingMedia: PropertyMedia[] = [];
  mediaToDelete: number[] = [];
  coverSelectedFile: File | null = null;
  coverPreviewUrl: string | null = null;
  previewUrls: { url: string; type: string }[] = [];
  isDraggingMedia = false;
  isDraggingCover = false;
  currentYear = new Date().getFullYear();
  submitted = false;

  // Map variables
  private map: any;
  private marker: any;
  address: string = '';

  propertyTypes = ['land', 'apartment', 'villa', 'office'] as const;
  listingTypes = ['for_sale', 'for_rent'] as const;
  constructionStatuses = ['available', 'under_construction'] as const;
  legalStatuses = ['licensed', 'unlicensed', 'pending'] as const;
  transactionStatuses = ['pending', 'completed'] as const;

  readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  readonly VALID_IMAGE_TYPES = ['image/jpeg', 'image/png'];
  readonly VALID_MEDIA_TYPES = [
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/quicktime',
    'video/avi',
  ];

  @ViewChild('mediaInput') mediaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    public router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      slug: ['', [Validators.required], [this.uniqueSlugValidator()]],
      description: ['', Validators.required],
      type: [
        '',
        [
          Validators.required,
          Validators.pattern('^(land|apartment|villa|office)$'),
        ],
      ],
      price: ['', [Validators.required, Validators.min(0)]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      full_address: ['', Validators.required],
      area: ['', [Validators.required, Validators.min(0)]],
      bedrooms: [null, [Validators.min(0)]],
      bathrooms: [null, [Validators.min(0)]],
      listing_type: [
        '',
        [Validators.required, Validators.pattern('^(for_sale|for_rent)$')],
      ],
      construction_status: [
        '',
        [
          Validators.required,
          Validators.pattern('^(available|under_construction)$'),
        ],
      ],
      transaction_status: [
        null,
        [Validators.pattern('^(pending|completed)?$')],
      ],
      building_year: [null, [this.buildingYearValidator()]],
      legal_status: [
        null,
        [Validators.pattern('^(licensed|unlicensed|pending)?$')],
      ],
      furnished: [false],
      amenities: [''],
      payment_options: [''],
      property_code: [
        '',
        [Validators.required],
        [this.uniquePropertyCodeValidator()],
      ],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });

    // Sync address input with form
    this.propertyForm.get('full_address')?.valueChanges.subscribe((value) => {
      this.address = value || '';
    });
  }

  initMap(): void {
    // Initialize map with default coordinates (Cairo)
    const defaultLat = 30.0444;
    const defaultLng = 31.2357;

    this.map = L.map('map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Allow clicking on the map to set marker
    this.map.on('click', (e: any) => {
      this.setMarker(e.latlng.lat, e.latlng.lng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    if (!this.isEditMode) {
      this.setMarker(defaultLat, defaultLng);
    }
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        draggable: true,
      }).addTo(this.map);

      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.updateFormCoordinates(position.lat, position.lng);
        this.reverseGeocode(position.lat, position.lng);
      });
    }

    this.map.setView([lat, lng], 13);
    this.updateFormCoordinates(lat, lng);
  }

  private updateFormCoordinates(lat: number, lng: number): void {
    this.propertyForm.patchValue({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    this.http.get(url, {
      headers: { 'User-Agent': 'EasyState/1.0 (your.email@example.com)' },
    }).subscribe({
      next: (data: any) => {
        const address = data.display_name || '';
        this.address = address;
        this.propertyForm.patchValue({ full_address: address });
      },
      error: () => {
        this.toastr.warning('Could not retrieve address');
      },
    });
  }

  searchAddress(): void {
    if (!this.address) {
      this.toastr.warning('Please enter an address');
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.address)}&limit=1`;
    this.http.get(url, {
      headers: { 'User-Agent': 'YourAppName/1.0 (your.email@example.com)' },
    }).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          this.setMarker(parseFloat(lat), parseFloat(lon));
          this.propertyForm.patchValue({ full_address: this.address });
        } else {
          this.toastr.error('Address not found');
        }
      },
      error: () => {
        this.toastr.error('Error searching address');
      },
    });
  }

  buildingYearValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const year = new Date(value).getFullYear();
      if (year < 1900 || year > this.currentYear) {
        return { invalidYear: true };
      }
      return null;
    };
  }

  uniqueSlugValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (
        !control.value ||
        (this.isEditMode &&
          this.propertyForm.get('slug')?.value === control.value)
      ) {
        return of(null);
      }
      return this.propertyService.checkSlugAvailability(control.value).pipe(
        debounceTime(500),
        map((isAvailable) => (isAvailable ? null : { slugTaken: true })),
        catchError(() => of(null))
      );
    };
  }

  uniquePropertyCodeValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (
        !control.value ||
        (this.isEditMode &&
          this.propertyForm.get('property_code')?.value === control.value)
      ) {
        return of(null);
      }
      return this.propertyService
        .checkPropertyCodeAvailability(control.value)
        .pipe(
          debounceTime(500),
          map((isAvailable) =>
            isAvailable ? null : { propertyCodeTaken: true }
          ),
          catchError(() => of(null))
        );
    };
  }

  checkEditMode(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.propertyId = +params['id'];
        this.loadPropertyData(this.propertyId);
      }
    });
  }

  loadPropertyData(id: number): void {
    this.propertyService.getProperty(id).subscribe({
      next: (property: Property) => {
        const safeProperty = {
          title: property.title || '',
          slug: property.slug || '',
          description: property.description || '',
          type: this.propertyTypes.includes(property.type as any)
            ? property.type
            : '',
          price: property.price ?? 0,
          city: property.city || '',
          district: property.district || '',
          full_address: property.full_address || '',
          area: property.area ?? 0,
          bedrooms: property.bedrooms ?? null,
          bathrooms: property.bathrooms ?? null,
          listing_type: this.listingTypes.includes(property.listing_type as any)
            ? property.listing_type
            : '',
          construction_status: this.constructionStatuses.includes(
            property.construction_status as any
          )
            ? property.construction_status
            : '',
          transaction_status: this.transactionStatuses.includes(
            property.transaction_status as any
          )
            ? property.transaction_status
            : null,
          building_year: property.building_year
            ? new Date(property.building_year, 0, 1).toISOString().split('T')[0]
            : null,
          legal_status: this.legalStatuses.includes(
            property.legal_status as any
          )
            ? property.legal_status
            : null,
          furnished: property.furnished ?? false,
          amenities: Array.isArray(property.amenities)
            ? property.amenities.join(', ')
            : property.amenities || '',
          payment_options: Array.isArray(property.payment_options)
            ? property.payment_options.join(', ')
            : property.payment_options || '',
          property_code: property.property_code || '',
          latitude: property.latitude || '',
          longitude: property.longitude || '',
        };

        this.propertyForm.patchValue(safeProperty);
        this.address = property.full_address || '';

        // Update map if coordinates exist
        if (property.latitude && property.longitude) {
          this.setMarker(property.latitude, property.longitude);
        }

        if (property.media) {
          this.existingMedia = property.media;
        }
        if (property.cover_image) {
          this.coverPreviewUrl = property.cover_image;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load property data');
        console.error('Error loading property:', err);
      },
    });
  }

  onDragOver(event: DragEvent, type: 'media' | 'cover'): void {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'media') {
      this.isDraggingMedia = true;
    } else {
      this.isDraggingCover = true;
    }
  }

  onDragLeave(event: DragEvent, type: 'media' | 'cover'): void {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'media') {
      this.isDraggingMedia = false;
    } else {
      this.isDraggingCover = false;
    }
  }

  onDrop(event: DragEvent, type: 'media' | 'cover'): void {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'media') {
      this.isDraggingMedia = false;
      const files = event.dataTransfer?.files;
      if (files) {
        this.handleMediaFiles(files);
      }
    } else {
      this.isDraggingCover = false;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleCoverFile(files[0]);
      }
    }
  }

  onMediaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleMediaFiles(input.files);
      input.value = '';
    }
  }

  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleCoverFile(input.files[0]);
      input.value = '';
    }
  }

  handleMediaFiles(files: FileList): void {
    Array.from(files).forEach((file) => {
      if (!this.VALID_MEDIA_TYPES.includes(file.type)) {
        this.toastr.warning(`Unsupported file type: ${file.name}`);
        return;
      }
      if (file.size > this.MAX_FILE_SIZE) {
        this.toastr.warning(`File ${file.name} exceeds 20MB limit`);
        return;
      }
      this.selectedFiles.push(file);
      const url = URL.createObjectURL(file);
      this.previewUrls.push({ url, type: file.type });
    });
  }

  handleCoverFile(file: File): void {
    if (!this.VALID_IMAGE_TYPES.includes(file.type)) {
      this.toastr.warning(`Unsupported file type for cover image: ${file.name}`);
      return;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.toastr.warning(`Cover image ${file.name} exceeds 20MB limit`);
      return;
    }
    this.coverSelectedFile = file;
    this.coverPreviewUrl = URL.createObjectURL(file);
  }

  removeMedia(url: string): void {
    const index = this.previewUrls.findIndex((preview) => preview.url === url);
    if (index !== -1) {
      this.previewUrls.splice(index, 1);
      this.selectedFiles.splice(index, 1);
      URL.revokeObjectURL(url);
    }
  }

  removeCoverImage(): void {
    if (this.coverPreviewUrl) {
      URL.revokeObjectURL(this.coverPreviewUrl);
    }
    this.coverSelectedFile = null;
    this.coverPreviewUrl = null;
  }

  markMediaForDeletion(id: number): void {
    this.mediaToDelete.push(id);
    this.existingMedia = this.existingMedia.filter((media) => media.id !== id);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.propertyForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly');
      this.propertyForm.markAllAsTouched();
      return;
    }
    this.submitted = false;

    const formData = new FormData();
    const formValue = this.propertyForm.value;

    Object.keys(formValue).forEach((key) => {
      if (key === 'amenities' || key === 'payment_options') {
        const items = formValue[key]
          ? formValue[key]
              .split(',')
              .map((item: string) => item.trim())
              .filter((item: string) => item)
          : [];
        formData.append(key, JSON.stringify(items));
      } else if (key === 'furnished') {
        formData.append(key, formValue[key] ? '1' : '0');
      } else if (key === 'building_year' && formValue[key]) {
        formData.append(key, new Date(formValue[key]).getFullYear().toString());
      } else if (formValue[key] != null && formValue[key] !== '') {
        formData.append(key, formValue[key]);
      }
    });

    this.selectedFiles.forEach((file) => {
      formData.append(`media[]`, file, file.name);
    });

    if (this.coverSelectedFile) {
      formData.append('cover_image', this.coverSelectedFile);
    }

    if (this.mediaToDelete.length > 0) {
      formData.append('media_to_delete', JSON.stringify(this.mediaToDelete));
    }

    if (this.isEditMode && this.propertyId) {
      this.updateProperty(formData);
    } else {
      this.createProperty(formData);
    }
  }

  createProperty(formData: FormData): void {
    this.propertyService.createProperty(formData).subscribe({
      next: () => {
        this.toastr.success('Property created successfully!');
        this.router.navigate(['/properties']);
      },
      error: (err) => this.handleError(err),
    });
  }

  updateProperty(formData: FormData): void {
    if (!this.propertyId) return;

    this.propertyService.updateProperty(this.propertyId, formData).subscribe({
      next: () => {
        this.toastr.success('Property updated successfully!');
        this.router.navigate(['/properties']);
      },
      error: (err) => this.handleError(err),
    });
  }

  private handleError(err: any): void {
    if (err.status === 422 && err.error?.errors) {
      const errors = err.error.errors;
      Object.keys(errors).forEach((field) => {
        const control = this.propertyForm.get(field);
        if (control) {
          control.setErrors({ serverError: errors[field].join(', ') });
        }
        this.toastr.error(errors[field].join(', '), `Error in ${field}`);
      });
    } else {
      const errorMessage = err.error?.message || err.message || 'Unknown error';
      this.toastr.error(`Operation failed: ${errorMessage}`);
    }
    console.error('Error:', err);
  }
}
