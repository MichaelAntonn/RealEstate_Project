import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // أضف FormsModule عشان ngModel
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { Property, PropertyApiResponse, PropertyFilters } from '../../models/property';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { PropertyFilterComponent } from '../property-filter/property-filter.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // أضف FormsModule
    NavbarComponent,
    FooterComponent,
    PropertyCardComponent,
    PropertyFilterComponent,
    PaginationComponent,
  ],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  currentPage: number = 1;
  lastPage: number = 1;
  perPage: number = 8;
  totalItems: number = 0;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Filters state (نقلناه من property-filter.component.ts)
  filters: PropertyFilters = {
    keyword: '',
    type: '',
    city: '',
    listing_type: 'for_sale',
    page: 1,
    sort_by: 'newest',
    is_new_building: false,
    min_price: 0,
    max_price: 10000000,
    min_area: 0,
    max_area: 1000,
    bedrooms: undefined,
    bathrooms: undefined,
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

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCities();

    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = parseInt(params['page'] || '1', 10);
        const filters = {
          keyword: params['keyword'] || '',
          type: params['type'] || '',
          city: params['city'] || '',
          listing_type: params['listing_type'] || 'for_sale',
          page: this.currentPage,
        };
        this.filterService.updateFilters(filters);
      })
    );

    this.subscription.add(
      this.filterService.filters$.subscribe((filters) => {
        this.filters = { ...this.filters, ...filters };
        this.currentPage = filters.page || 1;
        this.loadProperties(filters);
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

  loadProperties(filters: any): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.propertyService.getProperties(this.currentPage, this.perPage, filters).subscribe({
      next: (response) => {
        this.errorMessage = null;
        this.properties = response.data || [];
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.perPage = response.per_page;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Unexpected error:', error);
        this.errorMessage = 'An unexpected error occurred while fetching properties';
        this.properties = [];
        this.currentPage = 1;
        this.lastPage = 1;
        this.perPage = 8;
        this.totalItems = 0;
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
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
}
