import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';
import { AssignPage } from './assign/assign.page';
import { roleActivateGuard } from '../services/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: ListPage
  },
  {
    path: 'create',
    component: CreatePage,
    canActivate: [roleActivateGuard(['OWNER', 'MANAGER', 'DISPATCHER'])]
  },
  {
    path: 'assign',
    component: AssignPage,
    canActivate: [roleActivateGuard(['OWNER', 'MANAGER', 'DISPATCHER'])]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
