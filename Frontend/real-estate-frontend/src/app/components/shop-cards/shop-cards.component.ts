import { Component, OnInit, OnDestroy } from '@angular/core';
import { PropertyService } from '../../services/property.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { PropertyFilters, PropertySearchResponse } from '../../models/property';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IconsComponent } from '../icons/icons.component';

@Component({
  selector: 'app-shop-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PropertyCardComponent,
    RouterLink,
    IconsComponent,
  ],
  templateUrl: './shop-cards.component.html',
  styleUrls: ['./shop-cards.component.css'],
})
export class ShopCardsComponent implements OnInit, OnDestroy {
  properties: any[] = [];
  pagination: any = {};
  pages: number[] = [];
  isLoading = false;

  filters: PropertyFilters = {
    keyword: '',
    type: '',
    city: '',
    listing_type: 'for_sale',
    page: 1,
    is_new_building: false,
  };

  cities: { value: string; label: string }[] = [
    { value: '', label: 'All Cities' },
  ];

  private subscription: Subscription = new Subscription();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadCities();

    this.subscription.add(
      this.propertyService.filters$.subscribe((filters) => {
        this.filters = { ...filters };
      })
    );

    this.isLoading = true;
    this.subscription.add(
      this.propertyService.searchProperties().subscribe({
        next: (response: PropertySearchResponse) => {
          this.properties = response.data;
          this.pagination = response.pagination;
          this.pages = Array.from(
            { length: this.pagination.total_pages },
            (_, i) => i + 1
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching properties:', error);
          this.properties = [];
          this.pagination = { total_pages: 0 };
          this.pages = [];
          this.isLoading = false;
        },
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
          { value: '', label: 'All Cities' },
          ...cities.map((city) => ({ value: city, label: city })),
        ];
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
      },
    });
  }

  onSearch(): void {
    this.propertyService.updateFilters({
      keyword: this.filters.keyword,
      page: 1,
    });
  }

  onFilterChange(event: { type?: string; is_new_building?: boolean }): void {
    // تحديث الـ type و is_new_building بناءً على الـ event
    this.filters.type =
      event.type !== undefined ? event.type : this.filters.type;
    this.filters.is_new_building =
      event.is_new_building !== undefined
        ? event.is_new_building
        : this.filters.is_new_building;

    this.propertyService.updateFilters({
      type: this.filters.type,
      city: this.filters.city,
      is_new_building: this.filters.is_new_building,
      page: 1,
    });
  }

  onPageChange(page: number): void {
    this.propertyService.updateFilters({ page });
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.propertyService.updateFilters({ listing_type: type, page: 1 });
  }
}
