import { Component, Input, OnInit } from '@angular/core';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyMedia } from '../../models/property';
import { CommonModule } from '@angular/common';
import { JsonParsePipe } from '../../pipes/json-parse.pipe';

@Component({
  selector: 'app-details-section',
  standalone: true,
  imports: [CommonModule, JsonParsePipe],
  templateUrl: './details-section.component.html',
  styleUrls: ['./details-section.component.css'],
})
export class DetailsSectionComponent implements OnInit {
  @Input() propertyId: number | null = null;
  property: Property | null = null;
  media: PropertyMedia[] = [];
  loading = false;
  error: string | null = null;
  showImageModal = false;
  selectedImage: string | null = null;
  currentPage = 0;
  itemsPerPage = 3;

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

  get displayedMedia(): PropertyMedia[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.media.slice(start, start + this.itemsPerPage);
  }

  get isLastPage(): boolean {
    return (
      this.currentPage >= Math.ceil(this.media.length / this.itemsPerPage) - 1
    );
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
    }
  }

  bookNow(): void {
    console.log('Book Now clicked for property:', this.propertyId);
  }

  openImageModal(mediaURL: string): void {
    this.selectedImage = `http://127.0.0.1:8000/storage/${mediaURL}`;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImage = null;
  }

  closeImageModalOnBackground(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('bg-black')) {
      this.closeImageModal();
    }
  }
}
