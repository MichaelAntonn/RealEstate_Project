import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router} from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PropertyService } from '../services/property.service';
import { AuthService } from '../services/auth.service';

export const propertyOwnerGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const propertyService = inject(PropertyService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const propertyId = route.paramMap.get('id');
  const currentUser = authService.getUser();

  if (!propertyId || !currentUser) {
    router.navigate(['/unauthorized']);
    return of(false);
  }

  return propertyService.getProperty(+propertyId).pipe(
    map((property) => {
      console.log('Property:', property);
      console.log('CurrentUser:', currentUser);
      if (property.user_id === currentUser.id) {
        return true;
      } else {
        router.navigate(['/unauthorized']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/unauthorized']);
      return of(false);
    })
  );
};
