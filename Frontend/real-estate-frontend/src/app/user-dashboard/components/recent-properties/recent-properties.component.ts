import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recent-properties',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './recent-properties.component.html',
  styleUrls: ['./recent-properties.component.css']
})
export class RecentPropertiesComponent {
  @Input() properties: Property[] = [];
  @Output() edit = new EventEmitter<Property>();
  @Output() delete = new EventEmitter<number>();
  @Output() save = new EventEmitter<Property>();

  currentProperty: Property = {
    title: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    location: '',
    image: '',
    status: 'Available',
    description: ''
  };
  isEditing = false;
  isModalVisible = false;  // Flag to control modal visibility

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Available': return 'badge-success';
      case 'Under Contract': return 'badge-warning';
      case 'Sold': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  openAddModal(): void {
    this.currentProperty = {
      title: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      location: '',
      image: '',
      status: 'Available',
      description: ''
    };
    this.isEditing = false;
    this.isModalVisible = true;  // Show modal
  }

  openEditModal(property: Property): void {
    this.currentProperty = { ...property };
    this.isEditing = true;
    this.isModalVisible = true;  // Show modal
  }

  closeModal(): void {
    this.isModalVisible = false;  // Hide modal
  }

  onSave(): void {
    this.save.emit(this.currentProperty);
    this.closeModal();
  }

  onEdit(property: Property): void {
    this.openEditModal(property);
  }

  onDelete(id: number | undefined): void {
    if (id !== undefined) {
      this.delete.emit(id);
    }
  }
}
