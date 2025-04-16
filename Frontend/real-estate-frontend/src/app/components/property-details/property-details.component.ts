import { Component } from '@angular/core';
import { AddressSectionComponent } from '../address-section/address-section.component';
import { DetailsSectionComponent } from "../details-section/details-section.component";
import { DetailsRightSectionComponent } from "../details-right-section/details-right-section.component";
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-property-details',
  imports: [AddressSectionComponent, DetailsRightSectionComponent, DetailsSectionComponent, FooterComponent, NavbarComponent],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css',
})
export class PropertyDetailsComponent { }
