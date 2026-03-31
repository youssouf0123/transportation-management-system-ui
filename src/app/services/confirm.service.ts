import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(
    private readonly alertController: AlertController,
    private readonly i18n: I18nService,
  ) {}

  async confirmDelete(): Promise<boolean> {
    const alert = await this.alertController.create({
      cssClass: 'delete-confirm-alert',
      header: this.i18n.t('confirm_delete_title'),
      message: this.i18n.t('confirm_delete_message'),
      buttons: [
        {
          text: this.i18n.t('no'),
          role: 'cancel',
          cssClass: 'delete-confirm-cancel',
        },
        {
          text: this.i18n.t('yes'),
          role: 'confirm',
          cssClass: 'delete-confirm-accept',
        },
      ],
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }
}
