import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.css'],
})
export class PropertyCardComponent {
  @Input() properties: Property[] = [];

  getImageUrl(property: Property): string {
    return property.cover_image 
      ? `http://127.0.0.1:8000/storage/${property.cover_image}` 
      : 'assets/6fbcaa7c-3dbe-494e-afdf-5896e2e2a090.webp';
  }

  getPriceDisplay(property: Property): string {
    if (property.listing_type === 'for_sale') {
      return `$${property.price.toLocaleString()}`; // Added toLocaleString for better formatting
    } else if (property.listing_type === 'for_rent') {
      return `$${property.price.toLocaleString()}`; // Added toLocaleString for better formatting
    }
    return '';
  }
}