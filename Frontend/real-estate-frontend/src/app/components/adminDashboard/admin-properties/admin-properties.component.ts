import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-property-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit {
  pendingProperties: any[] = [];
  acceptedProperties: any[] = [];
  rejectedProperties: any[] = [];
  searchQuery: string = '';         // For pending properties
  acceptedSearchQuery: string = ''; // For accepted properties
  rejectedSearchQuery: string = ''; // For rejected properties

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.dashboardService.getPendingProperties().subscribe((response) => {
      this.pendingProperties = response.properties.data;
    });

    this.dashboardService.getAcceptedProperties().subscribe((response) => {
      this.acceptedProperties = response.properties.data;
    });

    this.dashboardService.getRejectedProperties().subscribe((response) => {
      this.rejectedProperties = response.properties.data;
    });
  }

  // Filter pending properties
  get filteredPendingProperties(): any[] {
    if (!this.searchQuery) {
      return this.pendingProperties;
    }
    return this.pendingProperties.filter(property =>
      property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Filter accepted properties
  get filteredAcceptedProperties(): any[] {
    if (!this.acceptedSearchQuery) {
      return this.acceptedProperties;
    }
    return this.acceptedProperties.filter(property =>
      property.title.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.acceptedSearchQuery.toLowerCase())
    );
  }

  // Filter rejected properties
  get filteredRejectedProperties(): any[] {
    if (!this.rejectedSearchQuery) {
      return this.rejectedProperties;
    }
    return this.rejectedProperties.filter(property =>
      property.title.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase()) ||
      property.property_code.toLowerCase().includes(this.rejectedSearchQuery.toLowerCase())
    );
  }

  acceptProperty(id: number): void {
    this.dashboardService.acceptProperty(id).subscribe(() => {
      this.loadProperties();
    });
  }

  rejectProperty(id: number): void {
    this.dashboardService.rejectProperty(id).subscribe(() => {
      this.loadProperties();
    });
  }

  deleteProperty(id: number): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.dashboardService.deleteProperty(id).subscribe(() => {
        this.loadProperties();
      });
    }
  }
}