import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PropertyService } from '../services/property.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css'],
})
export class AddPropertyComponent implements OnInit {
  propertyForm!: FormGroup;
  isEditMode = false;
  propertyId: number | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  existingMedia: any[] = [];
  mediaToDelete: number[] = [];
  isLoading = false;
  propertyTypes = ['land', 'apartment', 'villa', 'office'];
  listingTypes = ['for_sale', 'for_rent'];
  constructionStatuses = ['available', 'under_construction'];
  legalStatuses = ['licensed', 'unlicensed', 'pending'];
  cities: string[] = [];
  currentYear: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    public router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.propertyForm = this.fb.group({
      title: [{ value: '', disabled: this.isLoading }, Validators.required],
      slug: [
        { value: '', disabled: this.isLoading },
        [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)],
      ],
      description: [
        { value: '', disabled: this.isLoading },
        Validators.required,
      ],
      type: [{ value: '', disabled: this.isLoading }, Validators.required],
      price: [
        { value: '', disabled: this.isLoading },
        [Validators.required, Validators.min(0)],
      ],
      city: [{ value: '', disabled: this.isLoading }, Validators.required],
      district: [{ value: '', disabled: this.isLoading }, Validators.required],
      full_address: [{ value: '', disabled: this.isLoading }],
      area: [
        { value: '', disabled: this.isLoading },
        [Validators.required, Validators.min(0)],
      ],
      bedrooms: [{ value: '', disabled: this.isLoading }, [Validators.min(0)]],
      bathrooms: [{ value: '', disabled: this.isLoading }, [Validators.min(0)]],
      listing_type: [
        { value: '', disabled: this.isLoading },
        Validators.required,
      ],
      construction_status: [
        { value: '', disabled: this.isLoading },
        Validators.required,
      ],
      building_year: [
        { value: '', disabled: this.isLoading },
        [
          Validators.pattern(/^\d{4}$/),
          Validators.min(1900),
          Validators.max(new Date().getFullYear()),
        ],
      ],
      legal_status: [{ value: '', disabled: this.isLoading }],
      furnished: [{ value: false, disabled: this.isLoading }],
      amenities: [{ value: '', disabled: this.isLoading }],
      payment_options: [{ value: '', disabled: this.isLoading }],
      property_code: [
        { value: '', disabled: this.isLoading },
        Validators.required,
      ],
      cover_image: [{ value: '', disabled: this.isLoading }],
    });
  }

  setLoadingState(loading: boolean): void {
    this.isLoading = loading;
    if (loading) {
      this.propertyForm.disable();
    } else {
      this.propertyForm.enable();
    }
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
    this.setLoadingState(true);
    this.propertyService.getProperty(id).subscribe({
      next: (property) => {
        this.setLoadingState(false);

        const amenitiesText = property.amenities || '';
        const paymentOptionsText = property.payment_options || '';

        this.propertyForm.patchValue({
          title: property.title,
          slug: property.slug,
          description: property.description,
          type: property.type,
          price: property.price,
          city: property.city,
          district: property.district,
          full_address: property.full_address,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          listing_type: property.listing_type,
          construction_status: property.construction_status,
          building_year: property.building_year,
          legal_status: property.legal_status,
          furnished: property.furnished,
          amenities: amenitiesText,
          payment_options: paymentOptionsText,
          property_code: property.property_code,
          cover_image: property.cover_image,
        });

        if (property.media) {
          this.existingMedia = property.media;
        }
      },
      error: (err) => {
        this.setLoadingState(false);
        this.toastr.error('Failed to load property data');
        console.error(err);
      },
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 20 * 1024 * 1024) {
          this.toastr.error(`${file.name} is too large. Maximum size is 20MB.`);
          continue;
        }

        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
        if (
          !validImageTypes.includes(file.type) &&
          !validVideoTypes.includes(file.type)
        ) {
          this.toastr.error(
            `${file.name} has an invalid file type. Allowed types: jpg, jpeg, png, mp4, mov, avi.`
          );
          continue;
        }

        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  removeExistingMedia(mediaId: number, index: number): void {
    this.mediaToDelete.push(mediaId);
    this.existingMedia.splice(index, 1);
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields');
      return;
    }

    this.setLoadingState(true);
    const formData = new FormData();
    const formValue = this.propertyForm.value;

    Object.keys(formValue).forEach((key) => {
      if (formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'amenities' || key === 'payment_options') {
          const items = formValue[key]
            ? formValue[key]
                .split(',')
                .map((item: string) => item.trim())
                .filter((item: string) => item !== '')
            : [];
          formData.append(key, JSON.stringify(items));
        } else if (key === 'furnished') {
          formData.append(key, formValue[key] ? '1' : '0');
        } else {
          formData.append(key, formValue[key].toString());
        }
      }
    });

    this.selectedFiles.forEach((file, index) => {
      formData.append(`media[${index}]`, file, file.name);
    });

    if (this.mediaToDelete.length > 0) {
      formData.append('media_to_delete', JSON.stringify(this.mediaToDelete));
    }

    const request =
      this.isEditMode && this.propertyId
        ? this.propertyService.updateProperty(this.propertyId, formData)
        : this.propertyService.createProperty(formData);

        // for (const pair of formData.entries()) {
        //   console.log(pair[0], pair[1]);
        // }
    request.subscribe({
      next: () => {
        this.setLoadingState(false);
        this.toastr.success(
          this.isEditMode
            ? 'Property updated successfully!'
            : 'Property created successfully!'
        );
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.setLoadingState(false);
        const errorMessage =
          err.error?.error?.['media.0']?.[0] ||
          err.error?.warning ||
          'Failed to save property';
        this.toastr.error(errorMessage);
        console.error('Error saving property:', err);
      },
    });
  }

  deleteProperty(): void {
    if (!this.propertyId) return;

    if (confirm('Are you sure you want to delete this property?')) {
      this.setLoadingState(true);
      this.propertyService.deleteProperty(this.propertyId).subscribe({
        next: () => {
          this.setLoadingState(false);
          this.toastr.success('Property deleted successfully!');
          this.router.navigate(['/properties']);
        },
        error: (err) => {
          this.setLoadingState(false);
          this.toastr.error('Failed to delete property');
          console.error(err);
        },
      });
    }
  }
}
