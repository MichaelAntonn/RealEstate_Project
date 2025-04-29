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
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component';
import { SignupaandloginComponent } from './auth/signupaandlogin/signupaandlogin.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { BookingComponent } from './components/booking/booking.component';
import { ProfileComponent } from './profile/profile.component';
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

// Company imports
import { CompanyLayoutComponent } from './components/companyDashboard/company-layout/company-layout.component';
import { CompanyPropertiesComponent } from './components/companyDashboard/company-properties/company-properties.component';
import { CompanyBookingsComponent } from './components/companyDashboard/company-bookings/company-bookings.component';
import { CompanyStatisticsComponent } from './components/companyDashboard/company-statistics/company-statistics.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

import { ConsultationComponent } from './components/consultation/consultation.component';




import { ConsultationFormComponent } from './components/consultation-form/consultation-form.component';
import { MyPropertiesComponent } from './my-properties/my-properties.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { RealEstateBlogComponent } from './components/real-estate-blog/real-estate-blog.component';
import { ContactUsComponent } from './components/adminDashboard/contact-us/contact-us.component';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Public routes
  {
    path: 'login',
    component: SignupaandloginComponent,
    data: { log: 'Accessing login route' }
  },
  { path: 'sign-up', component: SignupaandloginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'consultation', component: ConsultationComponent },
  { path: 'blog', component: RealEstateBlogComponent },

  { path: 'consultation-form', component: ConsultationFormComponent },

  { path: 'aboutus', component: AboutUsComponent },

  { path: 'properties', component: PropertiesComponent },
  { path: 'property-details/:slug', component: PropertyDetailsComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'add-property', component: AddPropertyComponent },
  { path: 'edit-property/:id', component: AddPropertyComponent },
  { path: 'signupandlogin', component: SignupaandloginComponent },

  // User dashboard routes
  {
    path: 'maindashboard',
    component: MainDashboardComponent,
    children: [
      { path: 'statistics', component: UserDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'messages', component: MessagesComponent },
      // { path: 'statistics', component: StatisticsComponent },
      { path: 'settings', component: SettingsComponent },
      {path:'properties',component:MyPropertiesComponent},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Company routes
  {
    path: 'company',
    component: CompanyLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'properties', component: CompanyPropertiesComponent },
      { path: 'bookings', component: CompanyBookingsComponent },
      { path: 'statistics', component: CompanyStatisticsComponent },
      { path: '', redirectTo: 'statistics', pathMatch: 'full' },
    ],
  },

  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'super-admin'] },
  },
  {
    path: 'admin/layout',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'super-admin'] },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        component: AdminUsersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'properties',
        component: AdminPropertiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'bookings',
        component: AdminBookingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'activities',
        component: AdminActivitiesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] },
      },
      {
        path: 'statistics',
        component: AdminStatisticsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] },
      },
      {
        path: 'contact-us',
        component: ContactUsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['super-admin'] },
      },
    ],
  },

  // Wildcard route (fallback)
  { path: '**', redirectTo: 'home' },
];