import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Mark as standalone
  imports: [DashboardSidebarComponent, DashboardNavbarComponent], // Import child components
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit() {
    const salesCtx = document.getElementById('myChart') as HTMLCanvasElement;
    new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales',
          data: [120, 190, 300, 500, 200, 300],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

    const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Profit Trend',
          data: [100, 150, 250, 400, 180, 280],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}