import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminAuthService = inject(AdminAuthService);

  // Check if the user is logged in
  const isLoggedIn = adminAuthService.isLoggedIn();
  console.log('AuthGuard: isLoggedIn:', isLoggedIn);

  if (!isLoggedIn) {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    console.log('AuthGuard: User not logged in, redirecting to:', expectedRoles?.includes('admin') ? '/admin/login' : '/login');
    return router.createUrlTree(
      expectedRoles?.includes('admin') ? ['/admin/login'] : ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
  }

  // Get cached user role
  const userRole = adminAuthService.getUserRole();
  const expectedRoles = route.data['roles'] as string[] | undefined;
  console.log('AuthGuard: userRole:', userRole, 'expectedRoles:', expectedRoles);

  // If no cached role, fetch it from the server
  if (!userRole) {
    return adminAuthService.fetchUserRole().pipe(
      map(role => {
        console.log('AuthGuard: Fetched user role:', role);
        if (role === 'super-admin' || (expectedRoles && role && expectedRoles.includes(role))) {
          console.log('AuthGuard: Role matches or super-admin, allowing access');
          return true;
        }
        console.log('AuthGuard: Role mismatch, redirecting to /admin/login');
        return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }

  // Check if the user has the required role or is a super-admin
  if (userRole === 'super-admin' || (expectedRoles && expectedRoles.includes(userRole))) {
    console.log('AuthGuard: Role matches or super-admin, allowing access');
    return true;
  }

  console.log('AuthGuard: Role mismatch, redirecting to /admin/login');
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};