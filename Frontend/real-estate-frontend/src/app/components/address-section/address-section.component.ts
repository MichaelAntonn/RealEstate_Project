import { Component } from '@angular/core';

@Component({
  selector: 'app-address-section',
  standalone: true,
  imports: [],
  templateUrl: './address-section.component.html',
  styleUrl: './address-section.component.css',
})
export class AddressSectionComponent {
  address = 'Caior 1, Egypt';
  code = '2365';
}
