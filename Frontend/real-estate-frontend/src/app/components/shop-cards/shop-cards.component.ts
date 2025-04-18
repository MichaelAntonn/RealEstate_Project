import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { PropertyCardComponent } from '../property-card/property-card.component';
import {
  Property,
  Pagination,
  PropertySearchApiResponse,
} from '../../models/property';

@Component({
  selector: 'app-shop-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyCardComponent],
  templateUrl: './shop-cards.component.html',
  styleUrls: ['./shop-cards.component.css'],
})
export class ShopCardsComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  pagination: Pagination = {
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    per_page: 10,
  };
  pages: number[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  // viewMode: 'grid' | 'list' = 'grid';

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    // Subscribe to filters to update UI when filters change
    this.subscription.add(
      this.filterService.filters$.subscribe((filters) => {
        // if (filters['viewMode']) {
        //   this.viewMode = filters['viewMode'];
        // }
        this.loadProperties();
      })
    );

    // Initial load of properties
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.subscription.add(
      this.propertyService.searchProperties().subscribe({
        next: (response: PropertySearchApiResponse) => {
          if ('status' in response && response.status === 'error') {
            this.errorMessage = response.message;
            this.properties = [];
            this.pagination = response.pagination || {
              current_page: 1,
              total_pages: 0,
              total_items: 0,
              per_page: 10,
            };
            this.pages = [];
          } else {
            this.errorMessage = null;
            this.properties = response.data || [];
            this.pagination = response.pagination || {
              current_page: 1,
              total_pages: 0,
              total_items: 0,
              per_page: 10,
            };
            this.pages = Array.from(
              { length: this.pagination.total_pages },
              (_, i) => i + 1
            );
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Unexpected error:', error);
          this.errorMessage = 'An unexpected error occurred';
          this.properties = [];
          this.pagination = {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            per_page: 10,
          };
          this.pages = [];
          this.isLoading = false;
        },
      })
    );
  }

  onPageChange(page: number): void {
    this.filterService.updateFilters({ page });
  }
}
