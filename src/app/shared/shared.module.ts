import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { DateInputComponent } from './date-input/date-input.component';

@NgModule({
  declarations: [DateInputComponent],
  imports: [CommonModule, IonicModule],
  exports: [DateInputComponent],
})
export class SharedModule {}
