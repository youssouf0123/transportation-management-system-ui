import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { Trip } from '../../models/trip.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-trips-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit {
  trips: Trip[] = [];
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  filters = {
    status: '',
    driverId: null as number | null,
    vehicleId: null as number | null,
    date: '',
  };
  editingId: number | null = null;
  draft: Trip | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadTrips();
  }

  ionViewWillEnter(): void {
    this.loadTrips();
  }

  loadLookups(): void {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.api.getVehicles().subscribe(vehicles => this.vehicles = vehicles);
  }

  loadTrips(): void {
    this.api.getTrips(this.filters).subscribe({
      next: trips => {
        this.trips = trips.map(trip => this.api.normalizeTrip(trip));
      },
      error: () => {
        this.error = this.i18n.t('load_trips_error');
      }
    });
  }

  startEdit(trip: Trip): void {
    this.editingId = trip.id ?? null;
    this.draft = this.api.normalizeTrip({
      ...trip,
      driver: trip.driver ? { id: trip.driver.id, name: '', licenseNumber: '' } : null,
      vehicle: trip.vehicle ? { id: trip.vehicle.id, make: '', model: '', plateNumber: '' } : null,
    });
  }

  saveEdit(): void {
    if (!this.editingId || !this.draft) {
      return;
    }

    this.api.updateTrip(this.editingId, this.draft).subscribe(() => {
      this.editingId = null;
      this.draft = null;
      this.loadTrips();
    });
  }

  deleteTrip(id?: number): void {
    if (!id) {
      return;
    }
    this.api.deleteTrip(id).subscribe(() => this.loadTrips());
  }
}
