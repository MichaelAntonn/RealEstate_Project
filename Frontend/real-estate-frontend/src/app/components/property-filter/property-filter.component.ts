import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { PropertyFilters } from '../../models/property';

@Component({
  selector: 'app-property-filter',
  standalone: true,
  imports: [FormsModule],
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
    listing_type: 'for_sale',
    page: 1,
    sort_by: 'newest',
  };

  listingTypes = [
    { value: '', label: 'Status' },
    { value: 'for_sale', label: 'Buy' },
    { value: 'for_rent', label: 'Rent' },
  ];

  propertyTypes = [
    { value: '', label: 'Type' },
    { value: 'villa', label: 'Houses' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'office', label: 'Office' },
    { value: 'land', label: 'Daily rental' },
  ];

  cities = [{ value: '', label: 'Location' }];

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'best_seller', label: 'Best Seller' },
    { value: 'price_low', label: 'Low Price' },
    { value: 'price_high', label: 'High Price' },
  ];

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.loadCities();

    this.subscription.add(
      this.filterService.filters$.subscribe((filters) => {
        this.filters = { ...this.filters, ...filters };
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

  onFilterChange(): void {
    this.filterService.updateFilters({
      type: this.filters.type,
      city: this.filters.city,
      listing_type: this.filters.listing_type,
      page: 1,
    });
  }

  onSearch(): void {
    this.filterService.updateFilters({
      keyword: this.filters.keyword,
      page: 1,
    });
  }

  onSortChange(): void {
    this.filterService.updateFilters({
      sort_by: this.filters['sort_by'],
      page: 1,
    });
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.filters.listing_type = type;
    this.onFilterChange();
  }

  // Add method to calculate the end range
  getEndRange(): number {
    return Math.min(this.currentPage * this.perPage, this.totalItems);
  }
}
