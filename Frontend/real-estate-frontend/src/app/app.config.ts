import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/auth-interceptor.interceptor'; // Import the functional interceptor
import { routes } from './app.routes'; // Import the routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), // Use the updated routes
    provideHttpClient(
      withInterceptors([authInterceptor]) // Use the functional interceptor
    ),
  ],
};
