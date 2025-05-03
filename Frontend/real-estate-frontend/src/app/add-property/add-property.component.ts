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
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { Property, PropertyMedia } from '../models/property';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
declare const L: any;

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css'],
})
export class AddPropertyComponent implements OnInit, AfterViewInit {
  propertyForm!: FormGroup;
  isLoading = true;
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
  mediaErrors: string[] = [];
  coverImageErrors: string[] = [];
  notifications: { id: number; message: string; type: 'success' | 'error' | 'warning' }[] = [];
  private notificationId = 0;

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

    this.propertyForm.get('full_address')?.valueChanges.subscribe((value) => {
      this.address = value || '';
    });
  }

  initMap(): void {
    const defaultLat = 30.0444;
    const defaultLng = 31.2357;

    this.map = L.map('map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.setMarker(e.latlng.lat, e.latlng.lng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    if (!this.isEditMode) {
      this.setMarker(defaultLat, defaultLng);
    }
  }

  private setMarker(lat: number, lng: number): void {
    // إنشاء أيقونة مخصصة
    const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/69/69524.png', // مسار الصورة
      iconSize: [22, 25], // حجم الأيقونة
      iconAnchor: [16, 32], // نقطة تثبيت الأيقونة
      popupAnchor: [0, -32] // نقطة ظهور البوب أب
    });
  
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        draggable: true,
        icon: customIcon // استخدام الأيقونة المخصصة
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
        this.showNotification('Could not retrieve address', 'warning');
      },
    });
  }

  searchAddress(): void {
    if (!this.address) {
      this.showNotification('Please enter an address', 'warning');
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
          this.showNotification('Address not found', 'error');
        }
      },
      error: () => {
        this.showNotification('Error searching address', 'error');
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
        this.showNotification('Failed to load property data', 'error');
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
    this.mediaErrors = [];
    Array.from(files).forEach((file) => {
      if (!this.VALID_MEDIA_TYPES.includes(file.type)) {
        this.mediaErrors.push(
          `Unsupported file type for ${file.name}. Only JPEG, PNG, MP4, MOV, AVI are allowed.`
        );
        return;
      }
      if (file.size > this.MAX_FILE_SIZE) {
        this.mediaErrors.push(
          `File ${file.name} exceeds 20MB limit. Please upload a smaller file.`
        );
        return;
      }
      this.selectedFiles.push(file);
      const url = URL.createObjectURL(file);
      this.previewUrls.push({ url, type: file.type });
    });
    if (this.mediaErrors.length > 0) {
      this.scrollToFirstError();
    }
  }

  handleCoverFile(file: File): void {
    this.coverImageErrors = [];
    if (!this.VALID_IMAGE_TYPES.includes(file.type)) {
      this.coverImageErrors.push(
        `Unsupported file type for ${file.name}. Only JPEG and PNG are allowed.`
      );
      this.scrollToFirstError();
      return;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.coverImageErrors.push(
        `Cover image ${file.name} exceeds 20MB limit. Please upload a smaller file.`
      );
      this.scrollToFirstError();
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
    this.mediaErrors = [];
    this.coverImageErrors = [];

    if (this.propertyForm.invalid) {
      // Define the order of fields to ensure notifications follow form order
      const formFieldsOrder = [
        'title',
        'slug',
        'description',
        'type',
        'listing_type',
        'construction_status',
        'city',
        'district',
        'full_address',
        'latitude',
        'longitude',
        'price',
        'area',
        'property_code',
        'legal_status',
        'bedrooms',
        'bathrooms',
        'building_year',
        'furnished',
        'amenities',
        'payment_options',
      ];

      // Find the first invalid field
      const firstInvalidField = formFieldsOrder.find(
        (key) => this.propertyForm.get(key)?.invalid
      );

      if (firstInvalidField) {
        const fieldName = this.getFieldDisplayName(firstInvalidField);
        if (firstInvalidField === 'latitude' || firstInvalidField === 'longitude') {
          this.showNotification(
            'Please click on the map to select a location or use the search button',
            'error'
          );
        } else {
          this.showNotification(
            `Please enter a valid ${fieldName}`,
            'error'
          );
        }
      }
      this.scrollToFirstError();
      return;
    }

    if (!this.coverSelectedFile && !this.coverPreviewUrl) {
      this.coverImageErrors.push('Please upload a cover image');
      this.showNotification('Please upload a cover image', 'error');
      this.scrollToFirstError();
      return;
    }

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
    };

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
        this.showNotification('Property created successfully!', 'success');
        this.router.navigate(['/properties']);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
  
        Swal.fire({
          icon: 'error',
          title: 'Access Denied!',
          html:  `
          <strong>You are not subscribed to this service.</strong><br><br>
          To access this feature, you need an active subscription.<br>
          Please subscribe now to unlock all premium features and continue enjoying our platform.
        `,
          confirmButtonText: 'Go to Subscription',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/subscription']);
          }
        });
      }
    });
  }
  

  updateProperty(formData: FormData): void {
    if (!this.propertyId) return;

    this.propertyService.updateProperty(this.propertyId, formData).subscribe({
      next: () => {
        this.showNotification('Property updated successfully!', 'success');
        this.router.navigate(['/properties']);
      },
      error: (err) => this.handleError(err),
    });
  }

  private getFieldDisplayName(key: string): string {
    const fieldNames: { [key: string]: string } = {
      title: 'Title',
      slug: 'Slug',
      description: 'Description',
      type: 'Property Type',
      price: 'Price',
      city: 'City',
      district: 'District',
      full_address: 'Address',
      area: 'Area',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      listing_type: 'Listing Type',
      construction_status: 'Construction Status',
      transaction_status: 'Transaction Status',
      building_year: 'Building Year',
      legal_status: 'Legal Status',
      furnished: 'Furnished',
      amenities: 'Amenities',
      payment_options: 'Payment Options',
      property_code: 'Property Code',
      latitude: 'Location',
      longitude: 'Location',
    };
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  private handleError(err: any): void {
    if (err.status === 422 && err.error?.errors) {
      const errors = err.error.errors;
      Object.keys(errors).forEach((field) => {
        const control = this.propertyForm.get(field);
        if (control) {
          control.setErrors({ serverError: errors[field].join(', ') });
          this.showNotification(
            `Error in ${this.getFieldDisplayName(field)}: ${errors[field].join(', ')}`,
            'error'
          );
        }
      });
      this.scrollToFirstError();
    } else {
      const errorMessage = err.error?.message || err.message || 'Unknown error';
      this.showNotification(`Operation failed: ${errorMessage}`, 'error');
    }
    console.error('Error:', err);
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      // Define the order of fields as they appear in the form
      const formFieldsOrder = [
        'title',
        'slug',
        'description',
        'type',
        'listing_type',
        'construction_status',
        'city',
        'district',
        'full_address',
        'latitude',
        'longitude',
        'price',
        'area',
        'property_code',
        'legal_status',
        'bedrooms',
        'bathrooms',
        'building_year',
        'furnished',
        'amenities',
        'payment_options',
      ];

      // Find the first invalid field in the defined order
      const firstInvalidField = formFieldsOrder.find(
        (key) => this.propertyForm.get(key)?.invalid
      );

      if (firstInvalidField) {
        if (firstInvalidField === 'latitude' || firstInvalidField === 'longitude') {
          const mapElement = document.getElementById('map');
          if (mapElement) {
            window.scrollTo({
              top: mapElement.getBoundingClientRect().top + window.scrollY - 100,
              behavior: 'smooth',
            });
          }
        } else {
          const element = document.getElementById(firstInvalidField);
          if (element) {
            window.scrollTo({
              top: element.getBoundingClientRect().top + window.scrollY - 100,
              behavior: 'smooth',
            });
            element.focus();
          }
        }
      } else if (this.coverImageErrors.length > 0) {
        const coverInput = document.getElementById('cover_image');
        if (coverInput) {
          window.scrollTo({
            top: coverInput.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'smooth',
          });
        }
      } else if (this.mediaErrors.length > 0) {
        const mediaInput = document.getElementById('media_files');
        if (mediaInput) {
          window.scrollTo({
            top: mediaInput.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'smooth',
          });
        }
      }
    }, 100);
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    const id = this.notificationId++;
    this.notifications.push({ id, message, type });

    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    }, 6000);
  }
}
