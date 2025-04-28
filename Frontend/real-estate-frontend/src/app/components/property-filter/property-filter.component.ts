import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { PropertyFilters } from '../../models/property';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-property-filter',
  standalone: true,
  imports: [FormsModule, NgxSliderModule],
  templateUrl: './property-filter.component.html',
  styleUrls: ['./property-filter.component.css'],
})
export class PropertyFilterComponent implements OnInit, OnDestroy {
  @Input() currentPage: number = 1;
  @Input() perPage: number = 8;
  @Input() totalItems: number = 0;

  filters: PropertyFilters = {
    keyword: '',
    type: '',
    city: '',
    listing_type: '',
    page: 1,
    sort_by: 'newest',
    is_new_building: false,
    min_price: 0,
    max_price: 10000000,
    min_area: 0,
    max_area: 1000,
    bedrooms: '',
    bathrooms: '',
  };

  priceRange = { min: 0, max: 10000000 };
  areaRange = { min: 0, max: 1000 };

  priceSliderOptions: Options = {
    floor: this.priceRange.min,
    ceil: this.priceRange.max,
    step: 1000,
    showTicks: false,
    translate: (value: number): string => `$${value}`,
  };

  areaSliderOptions: Options = {
    floor: this.areaRange.min,
    ceil: this.areaRange.max,
    step: 10,
    showTicks: false,
    translate: (value: number): string => `${value} m²`,
  };

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'best_seller', label: 'Best Seller' },
    { value: 'price_low', label: 'Low Price' },
    { value: 'price_high', label: 'High Price' },
  ];

  bedroomOptions = [
    { value: '', label: 'Bedrooms' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5+' },
  ];

  bathroomOptions = [
    { value: '', label: 'Bathrooms' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5+' },
  ];

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.filterService.filters$.subscribe((filters) => {
        this.filters = { ...this.filters, ...filters };
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChange(): void {
    this.filterService.updateFilters({
      min_price: this.filters.min_price,
      max_price: this.filters.max_price,
      min_area: this.filters.min_area,
      max_area: this.filters.max_area,
      bedrooms: this.filters.bedrooms,
      bathrooms: this.filters.bathrooms,
      page: 1,
    });
  }

  onSortChange(): void {
    this.filterService.updateFilters({
      sort_by: this.filters.sort_by,
      page: 1,
    });
  }

  getEndRange(): number {
    return Math.min(this.currentPage * this.perPage, this.totalItems);
  }

  resetFilters(): void {
    this.filters = {
      keyword: '',
      type: '',
      city: '',
      listing_type: '',
      page: 1,
      sort_by: 'newest',
      is_new_building: false,
      min_price: this.priceRange.min,
      max_price: this.priceRange.max,
      min_area: this.areaRange.min,
      max_area: this.areaRange.max,
      bedrooms: '',
      bathrooms: '',
    };

    this.filterService.updateFilters(this.filters);
  }
}