import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { PropertyFilters } from '../../models/property';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
})
export class BannerComponent implements OnInit, OnDestroy {
  filters: PropertyFilters = {
    keyword: '',
    type: '',
    city: '',
    listing_type: 'for_sale',
    page: 1,
  };

  propertyTypes = [
    { value: '', label: 'Property Type' },
    { value: 'land', label: 'Land' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'office', label: 'Office' },
  ];

  cities: { value: string; label: string }[] = [{ value: '', label: 'Location' }];

  private subscription: Subscription = new Subscription();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    // جلب المدن
    this.loadCities();

    // الاشتراك في الـ filters$ لتحديث الـ filters المحلية
    this.subscription.add(
      this.propertyService.filters$.subscribe((filters) => {
        this.filters = { ...filters };
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCities(): void {
    this.propertyService.getCities().subscribe({
      next: (cities) => {
        this.cities = [
          { value: '', label: 'Location' },
          ...cities.map((city) => ({ value: city, label: city })),
        ];
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
      },
    });
  }

  onSearch(): void {
    this.propertyService.updateFilters({ keyword: this.filters.keyword, page: 1 });
  }

  onFilterChange(): void {
    this.propertyService.updateFilters({
      type: this.filters.type,
      city: this.filters.city,
      page: 1,
    });
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.propertyService.updateFilters({ listing_type: type, page: 1 });
  }
}
