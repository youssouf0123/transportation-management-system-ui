import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-vehicles-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit {
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  filters = {
    search: '',
    status: '',
    driverId: null as number | null,
  };
  editingId: number | null = null;
  draft: Vehicle | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly confirmService: ConfirmService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  readonly compareById = (first: { id?: number | null } | null, second: { id?: number | null } | null): boolean =>
    (first?.id ?? null) === (second?.id ?? null);

  ngOnInit(): void {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.loadVehicles();
  }

  ionViewWillEnter(): void {
    this.loadVehicles();
  }

  loadVehicles(event?: CustomEvent): void {
    this.api.getVehicles(this.filters.status, this.filters.search, this.filters.driverId).subscribe({
      next: vehicles => {
        this.vehicles = vehicles;
        event?.detail.complete();
      },
      error: () => {
        this.error = this.i18n.t('load_vehicles_error');
        event?.detail.complete();
      },
    });
  }

  startEdit(vehicle: Vehicle): void {
    this.editingId = vehicle.id ?? null;
    this.draft = {
      ...vehicle,
      driver: vehicle.driver ? { id: vehicle.driver.id, name: '', licenseNumber: '' } : null,
    };
  }

  saveEdit(): void {
    if (!this.editingId || !this.draft) {
      return;
    }
    this.api.updateVehicle(this.editingId, this.draft).subscribe(() => {
      this.editingId = null;
      this.draft = null;
      this.loadVehicles();
    });
  }

  async deleteVehicle(id?: number): Promise<void> {
    if (!id) {
      return;
    }
    if (!await this.confirmService.confirmDelete()) {
      return;
    }
    this.api.deleteVehicle(id).subscribe(() => this.loadVehicles());
  }
}
