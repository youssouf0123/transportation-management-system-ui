import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../shared/shared.module';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsPage } from './documents.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, DocumentsRoutingModule],
  declarations: [DocumentsPage]
})
export class DocumentsModule {}
