import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import {
  Property,
  PropertySearchApiResponse,
  PropertyFilters,
} from '../../models/property';
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
    FormsModule,
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
    window.scrollTo({ top: 0 });

    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = parseInt(params['page'] || '1', 10);
        const filtersFromParams = {
          keyword: params['keyword'] || '',
          type: params['type'] || '',
          city: params['city'] || '',
          listing_type: params['listing_type'] || '',
          page: this.currentPage,
        };
        this.filterService.updateFilters(filtersFromParams);
      })
    );

    this.subscription.add(
      this.filterService.filters$.subscribe((filters) => {
        this.filters = { ...this.filters, ...filters };
        this.currentPage = filters.page || 1;
        this.loadProperties();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page: this.currentPage,
            keyword: filters.keyword || undefined,
            type: filters.type || undefined,
            city: filters.city || undefined,
            listing_type: filters.listing_type || undefined,
          },
          queryParamsHandling: 'merge',
        });
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

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;

    console.time('getProperties');

    this.propertyService
      .searchProperties(this.perPage, this.filters)
      .subscribe({
        next: (response: PropertySearchApiResponse) => {
          console.timeEnd('getProperties');

          if ('status' in response && response.status === 'error') {
            this.errorMessage = response.message;
            this.properties = [];
            this.currentPage = response.pagination?.current_page ?? 1;
            this.lastPage = response.pagination?.total_pages ?? 1;
            this.totalItems = response.pagination?.total_items ?? 0;
            this.perPage = response.pagination?.per_page ?? this.perPage;
          } else {
            this.errorMessage = null;
            this.properties = response.data || [];
            this.currentPage = response.pagination?.current_page ?? 1;
            this.lastPage = response.pagination?.total_pages ?? 1;
            this.totalItems = response.pagination?.total_items ?? 0;
            this.perPage = response.pagination?.per_page ?? this.perPage;
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.timeEnd('getProperties');
          console.error('Unexpected error:', error);
          this.errorMessage =
            'An unexpected error occurred while fetching properties';
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
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.filterService.updateFilters({ ...this.filters, page });
  }

  onFilterChange(): void {
    this.filterService.updateFilters({
      ...this.filters,
      page: 1,
    });
  }

  onSearch(): void {
    this.filterService.updateFilters({
      ...this.filters,
      page: 1,
    });
  }
}
