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
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const routes: Routes = [

  // Default route (choose one based on your app's primary audience)
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default to user home; change to 'admin' if admin-focused
 


  // User routes
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'super-admin'] } // Both admins and super-admins can access
  },
  {
    path: 'admin/layout', // Admin layout with sidebar and navbar
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'super-admin'] }, // Both admins and super-admins can access the layout
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { 
        path: 'users', 
        component: AdminUsersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] } // Both can access
      },
      { 
        path: 'properties', 
        component: AdminPropertiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] } // Both can access
      },
      { 
        path: 'bookings', 
        component: AdminBookingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] } // Both can access
      },
      { 
        path: 'activities', 
        component: AdminActivitiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] } // Both can access
      },
      { 
        path: 'settings', 
        component: AdminSettingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] } // Only super-admins
      },
      { 
        path: 'statistics', 
        component: AdminStatisticsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] } // Only super-admins
      },
    ],
  },

  // Wildcard route (fallback)
  { path: '**', redirectTo: 'home' } // Default to user home
];