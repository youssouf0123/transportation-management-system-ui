import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { MaintenanceRecord } from '../../models/maintenance-record.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-maintenance-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage implements OnInit {
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  driverId: number | null = null;
  selectedVehicle: Vehicle | null = null;
  record: MaintenanceRecord = {
    serviceType: '',
    status: 'SCHEDULED',
    serviceDate: '',
    mileage: null,
    cost: 0,
    notes: '',
    vehicle: null,
  };
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.api.getVehicles().subscribe(vehicles => this.vehicles = vehicles);
  }

  onDriverChange(): void {
    this.selectedVehicle = this.vehicles.find(vehicle => vehicle.driver?.id === this.driverId) ?? null;

    if (this.selectedVehicle?.id) {
      this.record.vehicle = { id: this.selectedVehicle.id } as Vehicle;
      this.error = '';
      return;
    }

    this.record.vehicle = null;
    this.error = this.driverId ? this.i18n.t('driver_has_no_vehicle') : '';
  }

  save(): void {
    if (!this.driverId) {
      this.error = this.i18n.t('driver_required');
      return;
    }

    if (!this.selectedVehicle?.id) {
      this.error = this.i18n.t('selected_driver_must_have_vehicle');
      return;
    }

    this.record.vehicle = { id: this.selectedVehicle.id } as Vehicle;
    const payload: MaintenanceRecord = {
      ...this.record,
      cost: this.i18n.toStorageAmount(this.record.cost),
    };

    this.api.createMaintenanceRecord(payload).subscribe({
      next: () => this.router.navigateByUrl('/maintenance/list'),
      error: () => this.error = this.i18n.t('create_maintenance_error')
    });
  }
}
