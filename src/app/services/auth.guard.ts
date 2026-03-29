import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';

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

const hasRequiredRole = (roles: string[]) => {
  const authService = inject(AuthService);
  return authService.hasRole(...roles) ? true : redirectTo('/home');
};

const hasPlatformAdminAccess = () => {
  const authService = inject(AuthService);
  return authService.isPlatformAdmin() ? true : redirectTo('/home');
};

export const roleGuard = (roles: string[]): CanMatchFn => {
  return (_route, _segments: UrlSegment[]) => {
    return hasRequiredRole(roles);
  };
};

export const roleActivateGuard = (roles: string[]): CanActivateFn => {
  return (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    return hasRequiredRole(roles);
  };
};

export const platformAdminGuard: CanMatchFn = () => {
  return hasPlatformAdminAccess();
};

export const platformAdminActivateGuard: CanActivateFn = () => {
  return hasPlatformAdminAccess();
};
