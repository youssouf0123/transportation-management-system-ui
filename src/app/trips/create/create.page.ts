import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { Trip } from '../../models/trip.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-trips-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage implements OnInit {
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  trip: Trip = {
    origin: '',
    destination: '',
    status: 'PLANNED',
    scheduledDate: '',
    cargoDescription: '',
    notes: '',
    driver: null,
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

  save(): void {
    this.error = '';
    if (!this.trip.origin?.trim()) {
      this.error = this.i18n.t('trip_origin_required');
      return;
    }
    if (!this.trip.destination?.trim()) {
      this.error = this.i18n.t('trip_destination_required');
      return;
    }

    const payload: Trip = {
      ...this.trip,
      scheduledDate: this.trip.scheduledDate?.trim() ? this.trip.scheduledDate : this.today(),
    };

    this.api.createTrip(payload).subscribe({
      next: () => this.router.navigateByUrl('/trips/list'),
      error: () => this.error = this.i18n.t('create_trip_error')
    });
  }

  private today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
