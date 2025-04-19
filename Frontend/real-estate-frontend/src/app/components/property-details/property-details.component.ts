import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property';
import { AddressSectionComponent } from '../address-section/address-section.component';
import { DetailsSectionComponent } from '../details-section/details-section.component';
import { DetailsRightSectionComponent } from '../details-right-section/details-right-section.component';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-property-details',
  imports: [
    AddressSectionComponent,
    DetailsRightSectionComponent,
    DetailsSectionComponent,
    FooterComponent,
    NavbarComponent,
  ],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css'],
})
export class PropertyDetailsComponent implements OnInit {
  propertyId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.propertyService.getPropertyBySlug(slug).subscribe({
          next: (property: Property) => {
            this.propertyId = property.id;
          },
          error: (error) => {
            this.propertyId = null;
          },
        });
      } else {
        this.propertyId = null;
      }
    });
  }
}
