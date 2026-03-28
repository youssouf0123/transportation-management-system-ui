import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FinanceRoutingModule } from './finance-routing.module';
import { ListPage } from './list/list.page';
import { CreatePage } from './create/create.page';
import { ReportsPage } from './reports/reports.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    FinanceRoutingModule
  ],
  declarations: [ListPage, CreatePage, ReportsPage]
})
export class FinanceModule { }
