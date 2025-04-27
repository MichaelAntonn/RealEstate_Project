import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap ,MapMarker} from '@angular/google-maps';
import { CommonModule } from '@angular/common'; // استورد CommonModule

@Component({
  selector: 'app-address-section',
  standalone: true,
  imports: [CommonModule, GoogleMap,MapMarker], // ضيف CommonModule و GoogleMap هنا
  templateUrl: './address-section.component.html',
  styleUrl: './address-section.component.css',
})
export class AddressSectionComponent implements OnChanges {
  @Input() property: any;
  latitude: number | null = null;
  longitude: number | null = null;
  center: google.maps.LatLngLiteral | null = null;
  zoom = 16;
  markerOptions: google.maps.MarkerOptions = { draggable: false };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && changes['property'].currentValue) {
      this.latitude = parseFloat(this.property.latitude);
      this.longitude = parseFloat(this.property.longitude);
      this.center = {
        lat: this.latitude,
        lng: this.longitude,
      };
    } else {
      this.center = null;
    }
  }
}