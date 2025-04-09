import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-chart.component.html',
  styleUrls: ['./stats-chart.component.css']
})
export class StatsChartComponent implements AfterViewInit {
  @ViewChild('statsChart') statsChart!: ElementRef;

  @Input() listedCount = 0;
  @Input() bookedCount = 0;
  @Input() soldCount = 0;
  @Input() givenReviews = 0;
  @Input() receivedReviews = 0;

  ngAfterViewInit() {
    new Chart(this.statsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: [
          'Listed Properties',
          'Booked Properties',
          'Sold Properties',
          'Given Reviews',
          'Received Reviews'
        ],
        datasets: [{
          label: 'User Statistics',
          data: [
            this.listedCount,
            this.bookedCount,
            this.soldCount,
            this.givenReviews,
            this.receivedReviews
          ],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
            '#858796'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
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
