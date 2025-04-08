import { Component, Input } from '@angular/core';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-recent-properties',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './recent-properties.component.html',
  styleUrls: ['./recent-properties.component.css']
})
export class RecentPropertiesComponent {
  @Input() properties: Property[] = [];
  faEdit = faEdit;
  faTrash = faTrash;

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Available': return 'bg-success';
      case 'Under Contract': return 'bg-warning text-dark';
      case 'Sold': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}