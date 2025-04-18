import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { PropertyFilters } from '../../models/property';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
})
export class BannerComponent {
  filters: PropertyFilters;

  constructor(private filterService: FilterService, private router: Router) {
    this.filters = this.filterService.getFilters();
  }

  onSearch(): void {
    this.filterService.search(this.filters.keyword);
    this.router.navigate(['/properties']);
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.filterService.toggleListingType(type);
    this.router.navigate(['/properties']);
  }
}
