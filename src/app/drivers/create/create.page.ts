import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-drivers-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage {
  driver: Driver = {
    name: '',
    licenseNumber: '',
    phoneNumber: '',
    status: 'AVAILABLE',
  };
  saving = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  save(): void {
    this.error = '';
    if (!this.driver.name?.trim()) {
      this.error = this.i18n.t('driver_name_required');
      return;
    }

    this.saving = true;
    this.api.createDriver(this.driver).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigateByUrl('/drivers/list');
      },
      error: () => {
        this.error = this.i18n.t('create_driver_error');
        this.saving = false;
      },
    });
  }
}
