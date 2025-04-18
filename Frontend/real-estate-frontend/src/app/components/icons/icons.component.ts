import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-icons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.css'],
})
export class IconsComponent {
  selectedType: string = 'villa';

  iconTypes = [
    { label: 'Houses', type: 'villa', icon: 'fa-house' },
    { label: 'Apartments', type: 'apartment', icon: 'fa-building' },
    { label: 'Commercial', type: 'office', icon: 'fa-store' },
    { label: 'Daily rental', type: 'land', icon: 'fa-calendar-day' },
    { label: 'New buildings', type: 'new_buildings', icon: 'fa-city' },
    { label: 'More', type: 'all', icon: 'fa-ellipsis' },
  ];

  constructor(private filterService: FilterService) {}

  onIconClick(type: string): void {
    this.selectedType = type;
    const isNewBuilding = type === 'new_buildings';
    const filterType = type === 'new_buildings' || type === 'all' ? '' : type;
    this.filterService.applyFilters(filterType, '', isNewBuilding);
  }
}
