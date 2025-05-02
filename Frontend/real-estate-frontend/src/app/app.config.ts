import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { provideRouter, withHashLocation } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withXsrfConfiguration,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './shared/auth-interceptor.interceptor'; // Import the functional interceptor
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      // withHashLocation()
    ),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]), // Use the functional interceptor
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
  ],
};
