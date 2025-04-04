import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isLoggedIn().pipe(
    tap(isLoggedIn => console.log('AuthGuard: isLoggedIn:', isLoggedIn)),
    switchMap(isLoggedIn => {
      if (!isLoggedIn) {
        const expectedRoles = route.data['roles'] as string[] | undefined;
        console.log('User is not logged in, redirecting to login page');
        if (expectedRoles && expectedRoles.includes('admin')) {
          return of(router.createUrlTree(['/admin/login'], { 
            queryParams: { returnUrl: state.url as string } 
          }));
        }
        return of(router.createUrlTree(['/login'], { 
          queryParams: { returnUrl: state.url as string } 
        }));
      }

      const expectedRoles = route.data['roles'] as string[] | undefined;
      const userRole = authService.getUserRole();

      if (!userRole) {
        return authService.fetchUserRole().pipe(
          map(role => {
            console.log('Fetched user role:', role);
            if (expectedRoles && role && (expectedRoles.includes(role) || role === 'super-admin')) {
              return true;
            }
            console.log('User role does not match expected roles, redirecting to login');
            return router.createUrlTree(['/admin/login']);
          })
        );
      }

      if (expectedRoles && userRole && (expectedRoles.includes(userRole) || userRole === 'super-admin')) {
        return of(true);
      }
      console.log('User role does not match expected roles, redirecting to login');
      return of(router.createUrlTree(['/admin/login']));
    })
  );
};