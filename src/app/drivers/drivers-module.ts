import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriversRoutingModule } from './drivers-routing.module';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriversRoutingModule
  ],
  declarations: [ListPage, CreatePage]
})
export class DriversModule { }