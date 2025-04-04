import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For date pipe

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Import CommonModule for date pipe
  templateUrl: './dashboard-navbar.component.html',
  styleUrls: ['./dashboard-navbar.component.css']
})
export class DashboardNavbarComponent implements OnInit {
  egyptTime: Date = new Date();

  ngOnInit() {
    setInterval(() => {
      this.egyptTime = new Date();
    }, 1000);
  }

  logout() {
    console.log('User logged out');
  }
}