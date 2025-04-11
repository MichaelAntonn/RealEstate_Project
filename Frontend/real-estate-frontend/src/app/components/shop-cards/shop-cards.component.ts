import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property';
import { RouterLink } from '@angular/router';
import { PropertyCardComponent } from '../property-card/property-card.component';

@Component({
  selector: 'app-shop-cards',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent, RouterLink],
  templateUrl: './shop-cards.component.html',
  styleUrls: ['./shop-cards.component.css'],
})
export class ShopCardsComponent implements OnInit {
  properties: Property[] = [];
  currentPage: number = 1;
  lastPage: number = 1;
  isLoading: boolean = false;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.propertyService.getProperties(this.currentPage).subscribe({
      next: (response) => {
        this.properties = [...this.properties, ...response.data];
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.isLoading = false;
      },
    });
  }

  loadMore(): void {
    if (this.currentPage < this.lastPage && !this.isLoading) {
      this.currentPage++;
      this.loadProperties();
    }
  }
}
