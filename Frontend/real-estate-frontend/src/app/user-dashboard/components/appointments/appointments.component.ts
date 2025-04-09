import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Appointment } from '../../models/appointment.model';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {
  @Input() appointments: Appointment[] = [];
  @Input() properties: Property[] = [];
  @Output() edit = new EventEmitter<Appointment>();
  @Output() delete = new EventEmitter<number>();
  @Output() save = new EventEmitter<Appointment>();

  currentAppointment: Appointment = {
    date: '',
    time: '',
    client: '',
    property_id: 0,
    purpose: 'Property Viewing',
    status: 'Scheduled'
  };
  isEditing = false;
  isModalVisible = false;  // Flag to control modal visibility

  getPropertyTitle(propertyId: number): string {
    const property = this.properties.find(p => p.id === propertyId);
    return property ? property.title : 'Unknown Property';
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Confirmed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Scheduled': return 'badge-info';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  openAddModal(): void {
    this.currentAppointment = {
      date: '',
      time: '',
      client: '',
      property_id: 0,
      purpose: 'Property Viewing',
      status: 'Scheduled'
    };
    this.isEditing = false;
    this.isModalVisible = true;  // Show modal
  }

  openEditModal(appointment: Appointment): void {
    this.currentAppointment = { ...appointment };
    this.isEditing = true;
    this.isModalVisible = true;  // Show modal
  }

  closeModal(): void {
    this.isModalVisible = false;  // Hide modal
  }

  onSave(): void {
    this.save.emit(this.currentAppointment);
    this.closeModal();
  }

  onEdit(appointment: Appointment): void {
    this.openEditModal(appointment);
  }

  onDelete(id: number | undefined): void {
    if (id !== undefined) {
      this.delete.emit(id);
    }
  }
}
