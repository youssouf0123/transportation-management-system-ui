import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';
import { AssignPage } from './assign/assign.page';

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
    component: CreatePage
  },
  {
    path: 'assign',
    component: AssignPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }