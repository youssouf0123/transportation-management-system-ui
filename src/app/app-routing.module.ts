import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard, guestGuard, platformAdminGuard, roleGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    canMatch: [guestGuard],
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'home',
    canMatch: [authGuard],
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'dispatch',
    canMatch: [authGuard],
    loadChildren: () => import('./dispatch/dispatch.module').then( m => m.DispatchModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'drivers',
    canMatch: [authGuard],
    loadChildren: () => import('./drivers/drivers-module').then( m => m.DriversModule)
  },
  {
    path: 'vehicles',
    canMatch: [authGuard],
    loadChildren: () => import('./vehicles/vehicles-module').then( m => m.VehiclesModule)
  },
  {
    path: 'finance',
    canMatch: [authGuard],
    loadChildren: () => import('./finance/finance-module').then( m => m.FinanceModule)
  },
  {
    path: 'trips',
    canMatch: [authGuard],
    loadChildren: () => import('./trips/trips-module').then( m => m.TripsModule)
  },
  {
    path: 'maintenance',
    canMatch: [authGuard],
    loadChildren: () => import('./maintenance/maintenance-module').then( m => m.MaintenanceModule)
  },
  {
    path: 'users',
    canMatch: [authGuard, roleGuard(['OWNER', 'MANAGER'])],
    loadChildren: () => import('./users/users.module').then( m => m.UsersModule)
  },
  {
    path: 'manage-users',
    canMatch: [authGuard, platformAdminGuard],
    loadChildren: () => import('./manage-users/manage-users.module').then( m => m.ManageUsersModule)
  },
  {
    path: 'audit',
    canMatch: [authGuard, roleGuard(['OWNER', 'MANAGER'])],
    loadChildren: () => import('./audit/audit.module').then( m => m.AuditModule)
  },
  {
    path: 'documents',
    canMatch: [authGuard],
    loadChildren: () => import('./documents/documents.module').then( m => m.DocumentsModule)
  },
  {
    path: 'search',
    canMatch: [authGuard],
    loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
