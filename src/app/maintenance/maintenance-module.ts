import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    MaintenanceRoutingModule
  ],
  declarations: [ListPage, CreatePage]
})
export class MaintenanceModule { }
