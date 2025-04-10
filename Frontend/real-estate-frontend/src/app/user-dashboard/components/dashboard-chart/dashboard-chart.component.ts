import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.css']
})
export class DashboardChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() listed: number = 0;
  @Input() booked: number = 0;
  @Input() sold: number = 0;

  chart: any;

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Listed', 'Booked', 'Sold'],
        datasets: [{
          data: [this.listed, this.booked, this.sold],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
