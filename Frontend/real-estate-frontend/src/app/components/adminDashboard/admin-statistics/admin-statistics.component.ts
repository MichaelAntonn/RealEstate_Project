import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Statistics {
  total_commissions: number;
  total_properties: number;
  total_users: number;
  net_profit: number;
}

interface MonthlyData {
  month: string;
  commissions: number;
  costs: number;
  profit: number;
  profit_margin: number;
  properties_sold: number;
  new_listings: number;
  new_users: number;
}

interface Property {
  title: string;
  price: number;
  city: string;
  listing_type: 'for_sale' | 'for_rent';
  user: { first_name: string; last_name: string };
  created_at: string;
}

interface YearlySummary {
  month: string;
  sales: number;
  revenue: number;
  new_listings: number;
}

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-statistics.component.html',
  styleUrls: ['./admin-statistics.component.css']
})
export class AdminStatisticsComponent implements OnInit, AfterViewInit {
  statistics: Statistics | string | null = null;
  monthlyData: MonthlyData[] = [];
  yearlyData: MonthlyData[] = [];
  latestProperties: Property[] | string = [];
  yearlySummary: YearlySummary[] = [];
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  private salesChart: Chart | null = null;
  private profitTrendChart: Chart | null = null;
  private usersListingsChart: Chart | null = null;
  private yearlyDataChart: Chart | null = null;
  private yearlySummaryChart: Chart | null = null;
  loadingStatistics: boolean = false;
  loadingYearlySummary: boolean = false;

  constructor(private dashboardService: DashboardService) {
    console.log('AdminStatisticsComponent: Constructor called');
  }

  ngOnInit(): void {
    console.log('ngOnInit: Initializing component and fetching data');
    this.fetchDashboardData();
    this.fetchYearlySummary(this.selectedYear);
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: DOM should be ready, rendering charts');
    this.renderCharts();
    setTimeout(() => {
      console.log('ngAfterViewInit: Retrying chart rendering after 500ms');
      this.renderCharts();
    }, 500);
  }

  isStatistics(value: Statistics | string | null): value is Statistics {
    return value !== null && typeof value !== 'string';
  }

  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  fetchDashboardData(): void {
    this.loadingStatistics = true;
    console.log('fetchDashboardData: Fetching statistics');
    this.dashboardService.getStatistics()
      .pipe(
        catchError(error => {
          console.error('Error fetching statistics:', error);
          this.statistics = 'Error';
          this.loadingStatistics = false;
          return throwError(() => error);
        })
      )
      .subscribe((data: { statistics: Statistics }) => {
        console.log('Statistics fetched:', data);
        this.statistics = data.statistics;
        this.loadingStatistics = false;
      });

    console.log('fetchDashboardData: Fetching latest properties');
    this.dashboardService.getLatestProperties()
      .pipe(
        catchError(error => {
          console.error('Error fetching latest properties:', error);
          this.latestProperties = 'Error';
          return throwError(() => error);
        })
      )
      .subscribe((data: { latest_properties: Property[] }) => {
        console.log('Latest properties fetched:', data);
        this.latestProperties = data.latest_properties || [];
      });

    console.log('fetchDashboardData: Fetching monthly data');
    this.dashboardService.getMonthlyData()
      .pipe(
        catchError(error => {
          console.error('Error fetching monthly data:', error);
          this.monthlyData = [];
          this.renderCharts();
          return throwError(() => error);
        })
      )
      .subscribe((data: { success: boolean; data: MonthlyData[] }) => {
        console.log('Raw API response for monthly data:', data);
        this.monthlyData = data.success ? data.data : [];
        console.log('Processed monthlyData:', this.monthlyData);
        this.renderCharts();
      });

    console.log('fetchDashboardData: Fetching yearly data');
    this.dashboardService.getYearlyData()
      .pipe(
        catchError(error => {
          console.error('Error fetching yearly data:', error);
          this.yearlyData = [];
          this.renderCharts();
          return throwError(() => error);
        })
      )
      .subscribe((data: { success: boolean; data: MonthlyData[] }) => {
        console.log('Raw API response for yearly data:', data);
        this.yearlyData = data.success ? data.data : [];
        console.log('Processed yearlyData:', this.yearlyData);
        this.renderCharts();
      });
  }

  fetchYearlySummary(year: number): void {
    this.loadingYearlySummary = true;
    console.log('fetchYearlySummary: Fetching yearly summary for year:', year);
    this.dashboardService.getYearlySummary(year)
      .pipe(
        catchError(error => {
          console.error('Error fetching yearly summary:', error);
          this.yearlySummary = [];
          this.loadingYearlySummary = false;
          this.renderYearlySummaryChart();
          return throwError(() => error);
        })
      )
      .subscribe((data: { success: boolean; year: string; summary: YearlySummary[] }) => {
        console.log('Yearly summary response:', data);
        this.yearlySummary = data.success ? data.summary : [];
        console.log('Processed yearlySummary:', this.yearlySummary);
        this.loadingYearlySummary = false;
        this.renderYearlySummaryChart();
      });
  }

  onYearChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedYear = +selectElement.value;
    console.log('onYearChange: Year changed to:', this.selectedYear);
    this.fetchYearlySummary(this.selectedYear);
  }

  private renderCharts(): void {
    console.log('renderCharts: Rendering all charts');
    this.renderSalesChart();
    this.renderProfitTrendChart();
    this.renderUsersListingsChart();
    this.renderYearlyDataChart();
    this.renderYearlySummaryChart();
  }

  renderSalesChart(): void {
    console.log('renderSalesChart: Attempting to render sales chart');
    const salesCtx = document.getElementById('myChart') as HTMLCanvasElement;
    if (!salesCtx) {
      console.error('renderSalesChart: Sales chart canvas not found');
      return;
    }
    const existingChart = Chart.getChart('myChart');
    if (existingChart) existingChart.destroy();

    const labels = this.monthlyData.length ? this.monthlyData.map(item => item.month) : ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
    const data = this.monthlyData.length ? this.monthlyData.map(item => item.properties_sold) : [0, 0, 0, 0, 0, 0];

    this.salesChart = new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Properties Sold',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: 'top' } }
      }
    });
    console.log('renderSalesChart: Sales chart rendered successfully');
  }

  renderProfitTrendChart(): void {
    console.log('renderProfitTrendChart: Attempting to render profit trend chart');
    const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!lineCtx) {
      console.error('renderProfitTrendChart: Profit trend chart canvas not found');
      return;
    }
    const existingChart = Chart.getChart('lineChart');
    if (existingChart) existingChart.destroy();

    const labels = this.monthlyData.length ? this.monthlyData.map(item => item.month) : ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
    const data = this.monthlyData.length ? this.monthlyData.map(item => item.profit_margin) : [0, 0, 0, 0, 0, 0];

    this.profitTrendChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Profit Margin (%)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Profit Margin (%)' } } }
      }
    });
    console.log('renderProfitTrendChart: Profit trend chart rendered successfully');
  }

  renderUsersListingsChart(): void {
    console.log('renderUsersListingsChart: Attempting to render users vs listings chart');
    const usersListingsCtx = document.getElementById('usersListingsChart') as HTMLCanvasElement;
    if (!usersListingsCtx) {
      console.error('renderUsersListingsChart: Users vs Listings chart canvas not found');
      return;
    }
    const existingChart = Chart.getChart('usersListingsChart');
    if (existingChart) existingChart.destroy();

    const labels = this.monthlyData.length ? this.monthlyData.map(item => item.month) : ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
    const newUsersData = this.monthlyData.length ? this.monthlyData.map(item => item.new_users) : [0, 0, 0, 0, 0, 0];
    const newListingsData = this.monthlyData.length ? this.monthlyData.map(item => item.new_listings) : [0, 0, 0, 0, 0, 0];

    this.usersListingsChart = new Chart(usersListingsCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'New Users',
            data: newUsersData,
            borderColor: '#FF6F61',
            backgroundColor: 'rgba(255, 111, 97, 0.2)',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: '#FF6F61',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'New Listings',
            data: newListingsData,
            borderColor: '#6B5B95',
            backgroundColor: 'rgba(107, 91, 149, 0.2)',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: '#6B5B95',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 14 }, color: '#333' } },
          title: { display: true, text: 'New Users vs New Listings Over Time', font: { size: 16 }, color: '#333' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Count', font: { size: 14 }, color: '#333' } },
          x: { title: { display: true, text: 'Month', font: { size: 14 }, color: '#333' } }
        }
      }
    });
    console.log('renderUsersListingsChart: Users vs Listings chart rendered successfully');
  }

  renderYearlyDataChart(): void {
    console.log('renderYearlyDataChart: Attempting to render yearly data chart');
    const yearlyDataCtx = document.getElementById('yearlyDataChart') as HTMLCanvasElement;
    if (!yearlyDataCtx) {
      console.error('renderYearlyDataChart: Yearly data chart canvas not found');
      return;
    }
    const existingChart = Chart.getChart('yearlyDataChart');
    if (existingChart) existingChart.destroy();

    const labels = this.yearlyData.length ? this.yearlyData.map(item => item.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const profitData = this.yearlyData.length ? this.yearlyData.map(item => item.profit) : Array(12).fill(0);

    this.yearlyDataChart = new Chart(yearlyDataCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Yearly Profit',
          data: profitData,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'Yearly Profit Overview', font: { size: 16 } }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Profit ($)' } }
        }
      }
    });
    console.log('renderYearlyDataChart: Yearly data chart rendered successfully');
  }

  renderYearlySummaryChart(): void {
    console.log('renderYearlySummaryChart: Attempting to render yearly summary chart');
    const yearlySummaryCtx = document.getElementById('yearlySummaryChart') as HTMLCanvasElement;
    if (!yearlySummaryCtx) {
      console.error('renderYearlySummaryChart: Yearly summary chart canvas not found');
      setTimeout(() => this.renderYearlySummaryChart(), 100); // Retry after 100ms
      return;
    }
    const existingChart = Chart.getChart('yearlySummaryChart');
    if (existingChart) existingChart.destroy();
  
    const labels = this.yearlySummary.length ? this.yearlySummary.map(item => item.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = this.yearlySummary.length ? this.yearlySummary.map(item => item.sales) : Array(12).fill(0);
    const revenueData = this.yearlySummary.length ? this.yearlySummary.map(item => item.revenue / 1000) : Array(12).fill(0);
    const newListingsData = this.yearlySummary.length ? this.yearlySummary.map(item => item.new_listings) : Array(12).fill(0);
  
    this.yearlySummaryChart = new Chart(yearlySummaryCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sales',
            data: salesData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Revenue ($K)',
            data: revenueData,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          {
            label: 'New Listings',
            data: newListingsData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: `Yearly Summary for ${this.selectedYear}`, font: { size: 16 } }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Sales / New Listings' },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: { display: true, text: 'Revenue ($K)' },
            position: 'right',
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
    console.log('renderYearlySummaryChart: Yearly summary chart rendered successfully');
  }
}