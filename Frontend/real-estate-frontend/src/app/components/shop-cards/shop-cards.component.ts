import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { FilterService } from '../../services/filter.service';
import { PropertyCardComponent } from '../property-card/property-card.component';
import {
  Property,
  Pagination,
  PropertySearchApiResponse,
} from '../../models/property';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop-cards',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent ,RouterLink ],
  templateUrl: './shop-cards.component.html',
  styleUrls: ['./shop-cards.component.css'],
})
export class ShopCardsComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  pagination: Pagination = {
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    per_page: 8,
  };
  isLoading = false;
  errorMessage: string | null = null;
  private perPage: number = 8;

  private subscription: Subscription = new Subscription();

  constructor(
    private propertyService: PropertyService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.filterService.filters$.subscribe(() => {
        this.loadProperties();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.subscription.add(
      this.propertyService.searchProperties(this.perPage).subscribe({
        next: (response: PropertySearchApiResponse) => {
          if ('status' in response && response.status === 'error') {
            this.errorMessage = response.message;
            this.properties = [];
            this.pagination = response.pagination || {
              current_page: 1,
              total_pages: 0,
              total_items: 0,
              per_page: this.perPage,
            };
          } else {
            this.errorMessage = null;
            this.properties = response.data || [];
            this.pagination = response.pagination || {
              current_page: 1,
              total_pages: 0,
              total_items: 0,
              per_page: this.perPage,
            };
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
            per_page: this.perPage,
          };
          this.isLoading = false;
        },
      })
    );
  }
}
