import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../services/property.service';
import { Property } from '../user-dashboard/models/property.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent implements OnInit {
  propertyForm!: FormGroup;
  isEditMode = false;
  propertyId: number | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  existingMedia: any[] = [];
  mediaToDelete: number[] = [];

  // Dropdown options
  propertyTypes = ['land', 'apartment', 'villa', 'office'];
  listingTypes = ['for_sale', 'for_rent'];
  constructionStatuses = ['available', 'under_construction'];
  legalStatuses = ['licensed', 'unlicensed', 'pending'];
  cities: string[] = [];

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
      title: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      full_address: [''],
      area: ['', [Validators.required, Validators.min(0)]],
      bedrooms: ['', Validators.min(0)],
      bathrooms: ['', Validators.min(0)],
      listing_type: ['', Validators.required],
      construction_status: ['', Validators.required],
      building_year: [''],
      legal_status: [''],
      furnished: [false],
      amenities: [''],
      payment_options: [''],
      property_code: ['', Validators.required],
      cover_image: ['']
    });
  }

  checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.propertyId = +params['id'];
        this.loadPropertyData(this.propertyId);
      }
    });
  }

  loadPropertyData(id: number): void {
    this.propertyService.getProperty(id).subscribe({
      next: (property) => {
        // تحويل المصفوفات إلى نص مفصول بفواصل
        const amenitiesText = property.amenities?.join(', ') || '';
        const paymentOptionsText = property.payment_options?.join(', ') || '';

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
          cover_image: property.cover_image
        });

        if (property.media) {
          this.existingMedia = property.media;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load property data');
        console.error(err);
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
      this.toastr.warning('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    const formValue = this.propertyForm.value;

    // Append all form fields
    Object.keys(formValue).forEach(key => {
      if (key === 'amenities' || key === 'payment_options') {
        const items = formValue[key] 
          ? formValue[key].split(',').map((item: string) => item.trim()).filter((item: string) => item !== '')
          : [];
        formData.append(key, JSON.stringify(items));
      } else if (key === 'furnished') {
        formData.append(key, formValue[key] ? '1' : '0'); 
      } else {
        formData.append(key, formValue[key]);
      }
    });
    
    // Append new files
    this.selectedFiles.forEach(file => {
      formData.append('media[]', file);
    });

    // Append media to delete
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
      error: (err) => {
        this.toastr.error('Failed to create property');
        console.error(err);
      }
    });
  }

  updateProperty(formData: FormData): void {
    if (!this.propertyId) return;

    this.propertyService.updateProperty(this.propertyId, formData).subscribe({
      next: () => {
        this.toastr.success('Property updated successfully!');
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.toastr.error('Failed to update property');
        console.error(err);
      }
    });
  }

  deleteProperty(): void {
    if (!this.propertyId) return;

    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyService.deleteProperty(this.propertyId).subscribe({
        next: () => {
          this.toastr.success('Property deleted successfully!');
          this.router.navigate(['/properties']);
        },
        error: (err) => {
          this.toastr.error('Failed to delete property');
          console.error(err);
        }
      });
    }
  }
  
}