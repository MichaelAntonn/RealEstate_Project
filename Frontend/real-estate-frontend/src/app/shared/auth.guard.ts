import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { CompanyAuthService } from '../services/company-auth.service';
import { AuthService } from '../services/auth.service'; // Import AuthService
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminAuthService = inject(AdminAuthService);
  const companyAuthService = inject(CompanyAuthService);
  const authService = inject(AuthService); // Inject AuthService

  //console.log('AuthGuard: Checking route:', state.url);

  // Determine route type
  const isAdminRoute = state.url.startsWith('/admin');
  const isCompanyRoute = state.url.startsWith('/company');
  const isAddPropertyRoute = state.url.startsWith('/add-property');

  // Handle /add-property route
  if (isAddPropertyRoute) {
    const isUserLoggedIn = authService.isLoggedIn();
    const isCompanyLoggedIn = companyAuthService.isLoggedIn();

    //console.log('AuthGuard: Add Property route, isUserLoggedIn:', isUserLoggedIn, 'isCompanyLoggedIn:', isCompanyLoggedIn);

    if (isUserLoggedIn || isCompanyLoggedIn) {
      //console.log('AuthGuard: User or Company authenticated, allowing access to', state.url);
      return true;
    }

    //console.log('AuthGuard: Neither User nor Company logged in, redirecting to /login with returnUrl:', state.url);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Existing logic for company routes
  if (isCompanyRoute) {
    const isLoggedIn = companyAuthService.isLoggedIn();
    //console.log('AuthGuard: Company route, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      //console.log('AuthGuard: Company authenticated, allowing access to', state.url);
      return true;
    }
    //console.log('AuthGuard: Company not logged in, redirecting to /login with returnUrl:', state.url);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Existing logic for admin routes
  if (isAdminRoute) {
    const isLoggedIn = adminAuthService.isLoggedIn();
    //console.log('AuthGuard: Admin route, isLoggedIn:', isLoggedIn);

    if (!isLoggedIn) {
      //console.log('AuthGuard: Admin not logged in, redirecting to /admin/login');
      return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
    }

    const userRole = adminAuthService.getUserRole();
    const expectedRoles = route.data['roles'] as string[] | undefined;
    //console.log('AuthGuard: userRole:', userRole, 'expectedRoles:', expectedRoles);

    if (!userRole) {
      return adminAuthService.fetchUserRole().pipe(
        map(role => {
          //console.log('AuthGuard: Fetched user role:', role);
          if (role === 'super-admin' || (expectedRoles && role && expectedRoles.includes(role))) {
            //console.log('AuthGuard: Role matches or super-admin, allowing access');
            return true;
          }
          //console.log('AuthGuard: Role mismatch, redirecting to /admin/login');
          return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
        })
      );
    }

    if (userRole === 'super-admin' || (expectedRoles && expectedRoles.includes(userRole))) {
      //console.log('AuthGuard: Role matches or super-admin, allowing access');
      return true;
    }

    //console.log('AuthGuard: Role mismatch, redirecting to /admin/login');
    return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
  }

  // Default case (e.g., user routes)
  //console.log('AuthGuard: Non-admin/company route, redirecting to /login');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
