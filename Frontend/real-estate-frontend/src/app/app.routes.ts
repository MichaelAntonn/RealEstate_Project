import { Routes } from '@angular/router';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/adminDashboard/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/adminDashboard/admin-users/admin-users.component';
import { AdminPropertiesComponent } from './components/adminDashboard/admin-properties/admin-properties.component';
import { AdminBookingsComponent } from './components/adminDashboard/admin-bookings/admin-bookings.component';
import { AdminActivitiesComponent } from './components/adminDashboard/admin-activities/admin-activities.component';
import { AdminSettingsComponent } from './components/adminDashboard/admin-settings/admin-settings.component';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/login', pathMatch: 'full' }, // Redirect to admin login by default
  { path: 'admin/login', component: AdminLoginComponent }, // Admin login
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'properties', component: AdminPropertiesComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'activities', component: AdminActivitiesComponent },
      { path: 'settings', component: AdminSettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'admin/login' } // Redirect unknown routes to admin login
];