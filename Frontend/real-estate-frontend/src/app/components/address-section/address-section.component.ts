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
    // label: { // label 
    //   text: '', 
    //   color: '#ff6600',
    //   fontSize: '14px',
    //   className: 'marker-label' 
    // },
    icon: {
      url: 'https://cdn-icons-png.flaticon.com/512/69/69524.png', 
      scaledSize: new google.maps.Size(20, 20),    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && changes['property'].currentValue) {
      this.latitude = parseFloat(this.property.latitude);
      this.longitude = parseFloat(this.property.longitude);
      this.center = {
        lat: this.latitude,
        lng: this.longitude,
      };
      this.markerOptions = {
        ...this.markerOptions,
        // label: {
        //   text: this.property?.title || 'property',
        //   color: 'black',
        //   fontSize: '14px',
        //   className: 'marker-label'
        // }
      };
    } else {
      this.center = null;
    }
  }
}