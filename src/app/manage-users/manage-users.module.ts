import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ManageUsersRoutingModule } from './manage-users-routing.module';
import { ManageUsersPage } from './manage-users.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ManageUsersRoutingModule],
  declarations: [ManageUsersPage]
})
export class ManageUsersModule {}
