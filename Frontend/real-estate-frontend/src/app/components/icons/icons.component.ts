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
  @Output() filterChange = new EventEmitter<{
    type?: string;
    is_new_building?: boolean;
  }>();

  selectedType: string = '';

  iconTypes = [
    { label: 'Houses', type: 'villa', icon: 'fa-house' },
    { label: 'Apartments', type: 'apartment', icon: 'fa-building' },
    { label: 'Commercial', type: 'office', icon: 'fa-store' },
    { label: 'Daily rental', type: 'land', icon: 'fa-calendar-day' },
    { label: 'New buildings', type: 'new_buildings', icon: 'fa-city' },
    { label: 'More', type: 'all', icon: 'fa-ellipsis' },
  ];

  // onIconClick(type: string) {
  //   this.selectedType = type;
  //   const filterType = type === 'new_buildings' || type === 'all' ? '' : type;
  //   this.filterChange.emit(filterType);
  // }

  onIconClick(type: string) {
    this.selectedType = type;

    if (type === 'new_buildings') {
      this.filterChange.emit({ is_new_building: true });
    } else if (type === 'all') {
      this.filterChange.emit({ type: '', is_new_building: false });
    } else {
      this.filterChange.emit({ type, is_new_building: false });
    }
  }
}
