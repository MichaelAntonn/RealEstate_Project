import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminAuthService = inject(AdminAuthService);

  const isLoggedIn = adminAuthService.isLoggedIn();
  console.log('AuthGuard: isLoggedIn:', isLoggedIn);

  if (!isLoggedIn) {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    console.log('User not logged in, redirecting to:', expectedRoles?.includes('admin') ? '/admin/login' : '/login');
    return router.createUrlTree(
      expectedRoles && expectedRoles.includes('admin') ? ['/admin/login'] : ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
  }

  const expectedRoles = route.data['roles'] as string[] | undefined;
  const userRole = adminAuthService.getUserRole();
  console.log('AuthGuard: userRole:', userRole, 'expectedRoles:', expectedRoles);

  if (!userRole) {
    return adminAuthService.fetchUserRole().pipe(
      map(role => {
        console.log('Fetched user role:', role);
        if (expectedRoles && role && (expectedRoles.includes(role) || role === 'super-admin')) {
          return true;
        }
        console.log('Role mismatch, redirecting to /admin/login');
        return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }

  if (expectedRoles && userRole && (expectedRoles.includes(userRole) || userRole === 'super-admin')) {
    console.log('Role matches, allowing access');
    return true;
  }

  console.log('Role mismatch, redirecting to /admin/login');
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};