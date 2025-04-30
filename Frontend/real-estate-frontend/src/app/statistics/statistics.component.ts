import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from '../user-dashboard/user-dashboard.service';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from '../user-dashboard/components/stats-cards/stats-cards.component';
import { DashboardChartComponent } from '../user-dashboard/components/dashboard-chart/dashboard-chart.component';
import { StatsChartComponent } from '../user-dashboard/components/stats-chart/stats-chart.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardsComponent,
    DashboardChartComponent,
    StatsChartComponent
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  // Easy Estatestatistics
  listedCount: number = 0;
  bookedCount: number = 0;
  soldCount: number = 0;
  
  // Review statistics
  averageRating: string = '0.0';
  givenReviews: number = 0;
  receivedReviews: number = 0;

  constructor(private dashboardService: UserDashboardService) { }

  ngOnInit(): void {
    this.loadStatisticsData();
  }

  // Function to fetch statistics data
  loadStatisticsData(): void {
    // Fetch Dashboard data
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const data = res.dashboard;
        this.updateStatistics(
          data.properties.total,
          data.bookings.upcoming,
          data.bookings.completed,
          data.reviews.average_rating,
          data.reviews.given,
          data.reviews.received
        );
      },
      error: (error) => {
        console.error('Error fetching Dashboard data:', error);
      }
    });

    // Fetch additional statistics data
    this.dashboardService.getStatistics().subscribe({
      next: (stats) => {
        this.updateStatistics(
          stats.properties.total,
          stats.bookings.upcoming,
          stats.bookings.completed,
          stats.reviews.average_rating,
          stats.reviews.given,
          stats.reviews.received
        );
      },
      error: (error) => {
        console.error('Error fetching statistics data:', error);
      }
    });
  }

  // Helper function to update statistics
  private updateStatistics(
    listed: number,
    booked: number,
    sold: number,
    rating: string,
    given: number,
    received: number
  ): void {
    this.listedCount = listed;
    this.bookedCount = booked;
    this.soldCount = sold;
    this.averageRating = rating;
    this.givenReviews = given;
    this.receivedReviews = received;
  }
}
