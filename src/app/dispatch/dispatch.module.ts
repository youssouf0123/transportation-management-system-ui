import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DispatchRoutingModule } from './dispatch-routing.module';
import { DispatchPage } from './dispatch.page';

@NgModule({
  imports: [CommonModule, IonicModule, DispatchRoutingModule],
  declarations: [DispatchPage]
})
export class DispatchModule {}
