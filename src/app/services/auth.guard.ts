import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';

import { AuthService } from './auth.service';

const redirectTo = (target: string) => inject(Router).createUrlTree([target]);

export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : redirectTo('/login');
};

export const guestGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? redirectTo('/home') : true;
};

export const roleGuard = (roles: string[]): CanMatchFn => {
  return (_route, _segments: UrlSegment[]) => {
    const authService = inject(AuthService);
    return authService.hasRole(...roles) ? true : redirectTo('/home');
  };
};
