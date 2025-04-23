import { Routes } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';

// Admin imports
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/adminDashboard/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/adminDashboard/admin-users/admin-users.component';
import { AdminPropertiesComponent } from './components/adminDashboard/admin-properties/admin-properties.component';
import { AdminBookingsComponent } from './components/adminDashboard/admin-bookings/admin-bookings.component';
import { AdminActivitiesComponent } from './components/adminDashboard/admin-activities/admin-activities.component';
import { AdminSettingsComponent } from './components/adminDashboard/admin-settings/admin-settings.component';
import { AdminLayoutComponent } from './components/adminDashboard/admin-layout/admin-layout.component';
import { AdminStatisticsComponent } from './components/adminDashboard/admin-statistics/admin-statistics.component';

// User imports
// import { LoginComponent } from './auth/login/login.component';
// import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component';
import { SignupaandloginComponent } from './auth/signupaandlogin/signupaandlogin.component';
import { PropertiesComponent } from './components/properties/properties.component';
//BOOKING
import { BookingComponent } from './components/booking/booking.component';
// Dashboard components
import { ProfileComponent } from './profile/profile.component';
// import { MyPropertiesComponent } from './my-properties/my-properties.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { MessagesComponent } from './messages/messages.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { SettingsComponent } from './settings/settings.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AddPropertyComponent } from './add-property/add-property.component';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { propertyOwnerGuard } from './guards/property-owner.guard';


export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: SignupaandloginComponent },
  { path: 'sign-up', component: SignupaandloginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: 'property-details/:slug', component: PropertyDetailsComponent },
  // booking route
  {path: 'booking/:id', component: BookingComponent},

  // User dashboard routes

  { path: 'add-property', component: AddPropertyComponent ,
   // canActivate: [AuthGuard]
  }, // users can access this route
  { path: 'edit-property/:id', component: AddPropertyComponent ,
  //  canActivate: [AuthGuard, propertyOwnerGuard]
  }, // Only property Owner can access this route

  { path: 'signupandlogin', component: SignupaandloginComponent },


  {
    path: 'maindashboard',
    component: MainDashboardComponent,
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      // { path: 'properties', component: MyPropertiesComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'settings', component: SettingsComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'super-admin'] }, // Both admins and super-admins can access
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
        data: { roles: ['admin', 'super-admin'] }, // Both can access
      },
      {
        path: 'properties',
        component: AdminPropertiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] }, // Both can access
      },
      {
        path: 'bookings',
        component: AdminBookingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] }, // Both can access
      },
      {
        path: 'activities',
        component: AdminActivitiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] }, // Both can access
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] }, // Only super-admins
      },
      {
        path: 'statistics',
        component: AdminStatisticsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] }, // Only super-admins
      },
    ],
  },

  // Wildcard route (fallback)
  { path: '**', redirectTo: 'home' }, // Default to user home
];
