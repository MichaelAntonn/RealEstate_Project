import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { CompanyAuthService } from '../services/company-auth.service';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminAuthService = inject(AdminAuthService);
  const companyAuthService = inject(CompanyAuthService);
  const authService = inject(AuthService);

  // Determine route type
  const isAdminRoute = state.url.startsWith('/admin');
  const isCompanyRoute = state.url.startsWith('/company');
  const isAddPropertyRoute = state.url.startsWith('/add-property');
  const isBookingRoute = state.url.startsWith('/booking');

  // Handle /add-property or /booking/:id routes
  if (isAddPropertyRoute || isBookingRoute) {
    const isUserLoggedIn = authService.isLoggedIn();
    const isCompanyLoggedIn = companyAuthService.isLoggedIn();

    if (isUserLoggedIn || isCompanyLoggedIn) {
      return true;
    }

    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Handle company routes
  if (isCompanyRoute) {
    const isLoggedIn = companyAuthService.isLoggedIn();
    if (isLoggedIn) {
      return true;
    }
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Handle admin routes
  if (isAdminRoute) {
    const isLoggedIn = adminAuthService.isLoggedIn();

    if (!isLoggedIn) {
      return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
    }

    const userRole = adminAuthService.getUserRole();
    const expectedRoles = route.data['roles'] as string[] | undefined;

    if (!userRole) {
      return adminAuthService.fetchUserRole().pipe(
        map(role => {
          if (role === 'super-admin' || (expectedRoles && role && expectedRoles.includes(role))) {
            return true;
          }
          return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
        })
      );
    }

    if (userRole === 'super-admin' || (expectedRoles && expectedRoles.includes(userRole))) {
      return true;
    }

    return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
  }

  // Default case for other protected routes
  const isUserLoggedIn = authService.isLoggedIn();
  if (isUserLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};