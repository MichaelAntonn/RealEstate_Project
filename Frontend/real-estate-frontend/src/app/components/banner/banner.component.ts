import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
})
export class BannerComponent implements OnInit {
  keyword: string = '';

  constructor(private filterService: FilterService, private router: Router) {}

  ngOnInit(): void {
    this.keyword = this.filterService.getFilters().keyword || '';
  }

  onSearch(): void {
    this.filterService.search(this.keyword);
    this.router.navigate(['/properties'], {
      queryParams: { keyword: this.keyword },
    });
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.filterService.toggleListingType(type);
    this.router.navigate(['/properties'], {
      queryParams: { listing_type: type },
    });
  }
}
