import { Component, Input } from '@angular/core';
import { Property } from '../../models/property';

@Component({
  selector: 'app-property-card',
  imports: [],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
})
export class PropertyCardComponent {
  @Input()
  properties: Property[] = [];
}
