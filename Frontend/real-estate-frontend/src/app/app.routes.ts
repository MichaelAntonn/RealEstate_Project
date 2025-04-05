import { Routes } from '@angular/router';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/adminDashboard/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/adminDashboard/admin-users/admin-users.component';
import { AdminPropertiesComponent } from './components/adminDashboard/admin-properties/admin-properties.component';
import { AdminBookingsComponent } from './components/adminDashboard/admin-bookings/admin-bookings.component';
import { AdminActivitiesComponent } from './components/adminDashboard/admin-activities/admin-activities.component';
import { AdminSettingsComponent } from './components/adminDashboard/admin-settings/admin-settings.component';
import { AdminLayoutComponent } from './components/adminDashboard/admin-layout/admin-layout.component'; // Import AdminLayoutComponent
import { AuthGuard } from './shared/auth.guard';
import { AdminStatisticsComponent } from './components/adminDashboard/admin-statistics/admin-statistics.component';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' }, // Redirect to admin landing page
  { path: 'admin/login', component: AdminLoginComponent }, // Admin login
  { path: 'admin', component: AdminDashboardComponent }, // Main admin landing page (no sidebar/navbar)
  {
    path: 'admin/layout', // Layout route with sidebar and navbar
    component: AdminLayoutComponent, // Set AdminLayoutComponent as the parent
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: AdminUsersComponent },
      { path: 'properties', component: AdminPropertiesComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'activities', component: AdminActivitiesComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'statistics', component: AdminStatisticsComponent },
    ],
  },
  { path: '**', redirectTo: 'admin' } // Redirect unknown routes to admin landing page
];