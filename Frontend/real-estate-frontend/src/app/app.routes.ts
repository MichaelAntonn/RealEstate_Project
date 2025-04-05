import { Routes } from '@angular/router';

// Admin imports
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/adminDashboard/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/adminDashboard/admin-users/admin-users.component';
import { AdminPropertiesComponent } from './components/adminDashboard/admin-properties/admin-properties.component';
import { AdminBookingsComponent } from './components/adminDashboard/admin-bookings/admin-bookings.component';
import { AdminActivitiesComponent } from './components/adminDashboard/admin-activities/admin-activities.component';
import { AdminSettingsComponent } from './components/adminDashboard/admin-settings/admin-settings.component';
import { AdminLayoutComponent } from './components/adminDashboard/admin-layout/admin-layout.component';
import { AuthGuard } from './shared/auth.guard';
import { AdminStatisticsComponent } from './components/adminDashboard/admin-statistics/admin-statistics.component';

// User imports
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  // Default route (choose one based on your app's primary audience)
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default to user home; change to 'admin' if admin-focused

  // User routes
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },

  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminDashboardComponent }, // Admin landing page (no sidebar/navbar)
  {
    path: 'admin/layout', // Admin layout with sidebar and navbar
    component: AdminLayoutComponent,
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

  // Wildcard route (fallback)
  { path: '**', redirectTo: 'home' } // Default to user home; change to 'admin' if admin-focused
];