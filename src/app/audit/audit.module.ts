import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AuditRoutingModule } from './audit-routing.module';
import { AuditPage } from './audit.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AuditRoutingModule],
  declarations: [AuditPage]
})
export class AuditModule {}
