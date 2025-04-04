import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isLoggedIn().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        const expectedRoles = route.data['roles'] as string[] | undefined;
        if (expectedRoles && expectedRoles.includes('admin')) {
          return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
        }
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }

      const expectedRoles = route.data['roles'] as string[] | undefined;
      const userRole = authService.getUserRole();

      if (expectedRoles && userRole && (expectedRoles.includes(userRole) || userRole === 'super-admin')) {
        return true;
      }
      return router.createUrlTree(['/admin/login']);
    })
  );
};