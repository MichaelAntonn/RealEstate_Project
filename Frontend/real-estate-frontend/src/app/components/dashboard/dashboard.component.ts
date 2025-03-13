import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentTime!: string;
  egyptTime!: string;

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000); // تحديث كل ثانية
  }

  updateTime() {
    const now = new Date();
    this.currentTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      timeZone: 'UTC'
    }).format(now);

    this.egyptTime = new Intl.DateTimeFormat('en-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Cairo'
    }).format(now);
  }
}
