import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';
import { ReplaceUnderscorePipe } from '../../../pipes/replace-underscore.pipe'; // Adjust path

@Component({
  selector: 'app-admin-activities',
  standalone: true,
  imports: [CommonModule, ReplaceUnderscorePipe], // Add the pipe here
  templateUrl: './admin-activities.component.html',
  styleUrls: ['./admin-activities.component.css']
})
export class AdminActivitiesComponent implements OnInit {
  activities: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.dashboardService.getUserActivities().subscribe({
      next: (response) => {
        this.activities = (response.activities || [])
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 15);
        console.log('Activities loaded:', this.activities);
      },
      error: (error) => {
        console.error('Error fetching activities:', error);
        this.activities = [];
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Add getTypeClass method
  getTypeClass(type: string): string {
    switch (type) {
      case 'property_added':
        return 'property-added';
      case 'property_purchased':
        return 'property-purchased';
      case 'booking_added':
        return 'booking-added';
      default:
        return 'default-type';
    }
  }
}