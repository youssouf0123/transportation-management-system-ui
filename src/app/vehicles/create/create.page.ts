import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-vehicles-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage {
  vehicle: Vehicle = {
    make: '',
    model: '',
    plateNumber: '',
    status: 'ACTIVE',
    currentMileage: 0,
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
    if (!this.vehicle.make?.trim()) {
      this.error = this.i18n.t('vehicle_make_required');
      return;
    }

    this.saving = true;
    this.api.createVehicle(this.vehicle).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigateByUrl('/vehicles/list');
      },
      error: () => {
        this.error = this.i18n.t('create_vehicle_error');
        this.saving = false;
      },
    });
  }
}
