import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { PropertyFilters } from '../../models/property';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

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

  cities: { value: string; label: string }[] = [
    { value: '', label: 'Location' },
  ];

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCities();

    // مزامنة الـ filters مع الخدمة
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

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.propertyService.updateFilters({ listing_type: type, page: 1 });

    this.router.navigate(['/properties'], {
      queryParams: { listing_type: type },
    });
  }

  onSearch(): void {
    this.propertyService.updateFilters({
      keyword: this.filters.keyword,
      page: 1,
    });

    this.router.navigate(['/properties'], {
      queryParams: {
        keyword: this.filters.keyword,
        listing_type: this.filters.listing_type,
        city: this.filters.city,
        type: this.filters.type,
        page: 1,
      },
    });
  }
}
