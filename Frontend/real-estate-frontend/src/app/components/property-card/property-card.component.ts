import { Component, Input } from '@angular/core';
import { Property } from '../../models/property';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-property-card',
  imports: [RouterLink, DatePipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
})
export class PropertyCardComponent {
  @Input()
  properties: Property[] = [];
  todayDate: any;
  property: any;
  getImageUrl() {
    return this.property?.cover_image || 'https://placehold.co/600x400';
  }
}
