import { Component, Input, OnInit } from '@angular/core';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyMedia } from '../../models/property';
import { CommonModule } from '@angular/common';
import { JsonParsePipe } from '../../pipes/json-parse.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-details-section',
  standalone: true,
  imports: [CommonModule, JsonParsePipe, RouterLink ],
  templateUrl: './details-section.component.html',
  styleUrls: ['./details-section.component.css'],
})
export class DetailsSectionComponent implements OnInit {
  @Input() propertyId: number | null = null;
  property: Property | null = null;
  media: PropertyMedia[] = [];
  loading = false;
  error: string | null = null;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    if (this.propertyId) {
      this.loadPropertyDetails();
      this.loadPropertyMedia();
    } else {
      this.error = 'No property ID provided';
    }
  }

  loadPropertyDetails(): void {
    if (!this.propertyId) return;
    this.loading = true;
    this.propertyService.getProperty(this.propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load property details';
        this.loading = false;
        console.error(error);
      },
    });
  }

  loadPropertyMedia(): void {
    if (!this.propertyId) return;
    this.propertyService.getPropertyMedia(this.propertyId).subscribe({
      next: (media) => {
        this.media = media;
      },
      error: (error) => {
        this.error = 'Failed to load property media';
        console.error(error);
      },
    });
  }

  bookNow(): void {
    console.log('Book Now clicked for property:', this.propertyId);
  }
}
