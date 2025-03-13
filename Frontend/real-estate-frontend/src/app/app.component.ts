import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ إذا كنت تستخدم Standalone Components
  imports: [RouterOutlet ,DashboardComponent],  // ✅ إزالة Chart لأنها ليست Angular Module
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  // ✅ تصحيح التسمية
})
export class AppComponent implements AfterViewInit {
  title = 'real-estate-frontend';
  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    // Bar Chart
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Sales',
            data: [10, 20, 30, 40, 50],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      console.error("Canvas element 'myChart' not found!");
    }

    // Line Chart
    const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (lineCtx) {
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
            tension: 0.1, // لجعل الخط سلسًا
            fill: true // لملء المساحة تحت الخط
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
    } else {
      console.error("Canvas element 'lineChart' not found!");
    }
  }
}