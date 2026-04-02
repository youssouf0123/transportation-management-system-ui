import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { Trip } from '../../models/trip.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
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
  highlightedTripId: number | null = null;
  draft: Trip | null = null;
  error = '';

  readonly compareById = (first: { id?: number | null } | null, second: { id?: number | null } | null): boolean =>
    (first?.id ?? null) === (second?.id ?? null);

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly confirmService: ConfirmService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.route.queryParamMap.subscribe(params => {
      const tripId = Number(params.get('tripId'));
      this.highlightedTripId = Number.isFinite(tripId) && tripId > 0 ? tripId : null;
      this.loadTrips();
    });
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
        this.focusHighlightedTrip();
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
      driver: trip.driver ? this.drivers.find(driver => driver.id === trip.driver?.id) ?? trip.driver : null,
      vehicle: trip.vehicle ? this.vehicles.find(vehicle => vehicle.id === trip.vehicle?.id) ?? trip.vehicle : null,
    });
  }

  onDraftDriverChange(): void {
    const driverId = this.draft?.driver?.id;
    if (!this.draft) {
      return;
    }

    if (!driverId) {
      this.draft.vehicle = null;
      return;
    }

    const assignedVehicle = this.vehicles.find(vehicle => vehicle.driver?.id === driverId);
    this.draft.vehicle = assignedVehicle ?? null;
  }

  onDraftVehicleChange(): void {
    const vehicleId = this.draft?.vehicle?.id;
    if (!this.draft) {
      return;
    }

    if (!vehicleId) {
      this.draft.driver = null;
      return;
    }

    const selectedVehicle = this.vehicles.find(vehicle => vehicle.id === vehicleId);
    const assignedDriverId = selectedVehicle?.driver?.id;
    this.draft.driver = assignedDriverId
      ? this.drivers.find(driver => driver.id === assignedDriverId) ?? null
      : null;
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

  async deleteTrip(id?: number): Promise<void> {
    if (!id) {
      return;
    }
    if (!await this.confirmService.confirmDelete()) {
      return;
    }
    this.api.deleteTrip(id).subscribe(() => this.loadTrips());
  }

  private focusHighlightedTrip(): void {
    if (!this.highlightedTripId) {
      return;
    }

    window.setTimeout(() => {
      const element = document.getElementById(`trip-record-${this.highlightedTripId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
