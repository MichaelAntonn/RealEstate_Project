import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.css'],
})
export class IconsComponent {
  @Output() filterChange = new EventEmitter<string>();

  selectedType: string = '';


  iconTypes = [
    { label: 'Houses', type: 'villa', icon: 'fa-house' },
    { label: 'Apartments', type: 'apartment', icon: 'fa-building' },
    { label: 'Commercial', type: 'office', icon: 'fa-store' },
    { label: 'Daily rental', type: 'land', icon: 'fa-calendar-day' },
    { label: 'New buildings', type: 'new_buildings', icon: 'fa-city' },
    { label: 'More', type: 'all', icon: 'fa-ellipsis' }
  ];

  onIconClick(type: string) {
    this.selectedType = type;
    const filterType = type === 'new_buildings' || type === 'all' ? '' : type;
    this.filterChange.emit(filterType);
  }
}
