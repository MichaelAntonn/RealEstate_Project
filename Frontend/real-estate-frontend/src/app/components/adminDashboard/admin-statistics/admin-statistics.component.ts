import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './admin-statistics.component.html',
  styleUrls: ['./admin-statistics.component.css']
})
export class AdminStatisticsComponent implements OnInit, AfterViewInit {
  loadingStatistics: boolean = true;
  statistics: any = null;
  // Define latestProperties as an array of objects or a string 'Error'
  latestProperties: any[] | 'Error' = [];

  // Chart configurations for Properties Sold (Bar Chart)
  barChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Properties Sold',
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        borderWidth: 1
      }
    ]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Chart configurations for Profit Margin Trend (Line Chart)
  lineChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Profit Margin (%)',
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Chart configurations for New Users vs Added Properties (Bar Chart)
  usersPropertiesChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'New Users',
        backgroundColor: '#17a2b8',
        borderColor: '#17a2b8',
        borderWidth: 1
      },
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Added Properties',
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };
  usersPropertiesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStatistics();
    this.fetchLatestProperties();
  }

  ngAfterViewInit() {
    // Can be used for additional chart initialization after the DOM is loaded
  }

  // Fetch statistics data from the backend
  fetchStatistics() {
    this.loadingStatistics = true;
    this.http.get('http://localhost:8000/api/admin/statistics', {
      withCredentials: true
    }).subscribe({
      next: (data: any) => {
        this.statistics = data;
        this.loadingStatistics = false;

        // Update chart data based on the fetched statistics
        if (data.properties_sold) {
          this.barChartData.datasets[0].data = data.properties_sold;
        }
        if (data.profit_margin) {
          this.lineChartData.datasets[0].data = data.profit_margin;
        }
        if (data.new_users && data.added_properties) {
          this.usersPropertiesChartData.datasets[0].data = data.new_users;
          this.usersPropertiesChartData.datasets[1].data = data.added_properties;
        }
      },
      error: (error) => {
        console.error('Error fetching statistics:', error);
        this.statistics = 'Error';
        this.loadingStatistics = false;
      }
    });
  }

  // Fetch the latest properties from the backend
  fetchLatestProperties() {
    this.http.get('http://localhost:8000/api/admin/latest-properties', {
      withCredentials: true
    }).subscribe({
      next: (data: any) => {
        this.latestProperties = data;
      },
      error: (error) => {
        console.error('Error fetching latest properties:', error);
        this.latestProperties = 'Error';
      }
    });
  }

  // Helper function to check if the data is valid statistics and not an error
  isStatistics(data: any): boolean {
    return data !== 'Error' && data !== null && typeof data === 'object';
  }

  // Helper function to check if the data is an array
  isArray(data: any): boolean {
    return Array.isArray(data);
  }
}