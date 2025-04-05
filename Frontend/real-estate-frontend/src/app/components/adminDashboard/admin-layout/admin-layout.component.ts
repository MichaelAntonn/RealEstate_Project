import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminDashboardSidebarComponent } from '../admin-dashboard-sidebar/admin-dashboard-sidebar.component';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';


@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet,AdminDashboardSidebarComponent, DashboardNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

}
