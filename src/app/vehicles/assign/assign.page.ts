import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-vehicles-assign',
  templateUrl: './assign.page.html',
  styleUrls: ['./assign.page.scss'],
  standalone: false,
})
export class AssignPage implements OnInit {
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  selectedVehicleId: number | null = null;
  selectedDriverId: number | null = null;
  saving = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getVehicles().subscribe({
      next: vehicles => {
        this.vehicles = vehicles;
      },
      error: () => {
        this.error = this.i18n.t('load_vehicles_error');
      },
    });

    this.api.getDrivers().subscribe({
      next: drivers => {
        this.drivers = drivers;
      },
      error: () => {
        this.error = this.i18n.t('load_drivers_short_error');
      },
    });
  }

  assign(): void {
    if (!this.selectedVehicleId || !this.selectedDriverId) {
      this.error = this.i18n.t('select_vehicle_and_driver');
      return;
    }

    this.saving = true;
    this.error = '';
    this.api.assignDriverToVehicle(this.selectedVehicleId, this.selectedDriverId).subscribe({
      next: updatedVehicle => {
        this.vehicles = this.vehicles.map(vehicle => vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle);
        this.saving = false;
        const assignedDriver = this.drivers.find(driver => driver.id === this.selectedDriverId);
        if (assignedDriver) {
          this.api.updateDriver(assignedDriver.id as number, {
            ...assignedDriver,
            status: 'ON_TRIP',
          }).subscribe(() => this.router.navigateByUrl('/vehicles/list'));
          return;
        }
        this.router.navigateByUrl('/vehicles/list');
      },
      error: () => {
        this.error = this.i18n.t('assign_driver_error');
        this.saving = false;
      },
    });
  }
}
