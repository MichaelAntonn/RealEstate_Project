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

  // Get the image URL for a property, with a fallback if no image is provided
  getImageUrl(property: Property): string {
    return property?.cover_image || 'assets/6fbcaa7c-3dbe-494e-afdf-5896e2e2a090.webp';
  }
}