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
    label: { // label هي أوبجكت
      text: '', // هنحدث النص ده في ngOnChanges
      color: 'white',
      fontSize: '14px',
      className: 'marker-label' // ممكن تضيف كلاس CSS للتصميم
    },
    icon: {
      url: 'URL_TO_YOUR_DEFAULT_MARKER_ICON' // ممكن تستخدم أيقونة افتراضية لو عايز
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
      // حدث نص التسمية هنا
      this.markerOptions = { // لازم نحدث الأوبجكت كله
        ...this.markerOptions,
        label: {
          text: this.property?.title || 'عقار', // استخدم عنوان العقار كتسمية أو أي نص افتراضي
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