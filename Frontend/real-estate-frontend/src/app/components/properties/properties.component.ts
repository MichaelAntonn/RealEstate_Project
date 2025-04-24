import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { Property, PropertyApiResponse } from '../../models/property';
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
  totalItems: number = 0; // Add totalItems
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.currentPage = filters.page || 1;
        this.loadProperties(filters);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
        this.totalItems = response.total; // Set totalItems
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
}
