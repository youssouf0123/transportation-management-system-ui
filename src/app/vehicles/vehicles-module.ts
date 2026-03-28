import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehiclesRoutingModule } from './vehicles-routing.module';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';
import { AssignPage } from './assign/assign.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehiclesRoutingModule
  ],
  declarations: [ListPage, CreatePage, AssignPage]
})
export class VehiclesModule { }