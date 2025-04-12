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

  selectedType: string = ''; // لتتبع النوع المختار

  // قايمة الأنواع المرتبطة بالأيقونات
  iconTypes = [
    { label: 'Houses', type: 'villa', icon: 'fa-house' },
    { label: 'Apartments', type: 'apartment', icon: 'fa-building' },
    { label: 'Commercial', type: 'office', icon: 'fa-store' },
    { label: 'Daily rental', type: 'land', icon: 'fa-calendar-day' }, // ممكن نغير الـ type هنا لو فيه نوع مخصص لـ "Daily rental"
    { label: 'New buildings', type: '', icon: 'fa-city' }, // بيظهر كل الأنواع
    { label: 'More', type: '', icon: 'fa-ellipsis' }, // بيظهر كل الأنواع
  ];

  onIconClick(type: string) {
    this.selectedType = type;
    this.filterChange.emit(type); // بيبعت الـ type للـ ShopCardsComponent
  }
}
