import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-section',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './address-section.component.html',
  styleUrl: './address-section.component.css',
})
export class AddressSectionComponent implements OnChanges {
  @Input() property: any;
  latitude: number | null = null;
  longitude: number | null = null;
  center: google.maps.LatLngLiteral | null = null;
  zoom = 16;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    label: { // label is an object
      text: '', // We will update this text in ngOnChanges
      color: 'white',
      fontSize: '14px',
      className: 'marker-label' // You can add a CSS class for styling
    },
    icon: {
      url: 'URL_TO_YOUR_DEFAULT_MARKER_ICON' // You can use any default icon if needed
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && changes['property'].currentValue) {
      this.latitude = parseFloat(this.property.latitude);
      this.longitude = parseFloat(this.property.longitude);
      this.center = {
        lat: this.latitude,
        lng: this.longitude,
      };
      // Update the label text here
      this.markerOptions = { // We need to update the entire object
        ...this.markerOptions,
        label: {
          text: this.property?.title || 'Property', // Use the property title as label or any default text
          color: 'white',
          fontSize: '14px',
          className: 'marker-label'
        }
      };
    } else {
      this.center = null;
    }
  }
}
