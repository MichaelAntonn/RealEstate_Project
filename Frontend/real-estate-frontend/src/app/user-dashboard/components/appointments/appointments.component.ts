import { Component, Input } from '@angular/core';
import { Appointment } from '../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {
  @Input() appointments: Appointment[] = [];
  faEdit = faEdit;
  faTrash = faTrash;

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Confirmed': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Scheduled': return 'bg-info';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
