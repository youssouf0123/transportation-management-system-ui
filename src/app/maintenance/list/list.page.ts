import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { MaintenanceRecord } from '../../models/maintenance-record.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit {
  records: MaintenanceRecord[] = [];
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  filters = {
    vehicleId: null as number | null,
    status: '',
    date: '',
  };
  editingId: number | null = null;
  driverId: number | null = null;
  selectedVehicle: Vehicle | null = null;
  draft: MaintenanceRecord | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.api.getVehicles().subscribe(vehicles => this.vehicles = vehicles);
    this.loadRecords();
  }

  ionViewWillEnter(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.api.getMaintenanceRecords(this.filters).subscribe({
      next: records => this.records = records.map(record => this.api.normalizeMaintenanceRecord(record)),
      error: () => this.error = this.i18n.t('load_maintenance_error')
    });
  }

  startEdit(record: MaintenanceRecord): void {
    this.editingId = record.id ?? null;
    this.draft = this.api.normalizeMaintenanceRecord({
      ...record,
      cost: this.i18n.toDisplayAmount(record.cost),
      vehicle: record.vehicle ? { id: record.vehicle.id, make: '', model: '', plateNumber: '' } : null,
    });
    this.selectedVehicle = this.vehicles.find(vehicle => vehicle.id === record.vehicle?.id) ?? null;
    this.driverId = this.selectedVehicle?.driver?.id ?? null;
    this.error = '';
  }

  onDriverChange(): void {
    this.selectedVehicle = this.vehicles.find(vehicle => vehicle.driver?.id === this.driverId) ?? null;

    if (!this.draft) {
      return;
    }

    if (this.selectedVehicle?.id) {
      this.draft.vehicle = { id: this.selectedVehicle.id } as Vehicle;
      this.error = '';
      return;
    }

    this.draft.vehicle = null;
    this.error = this.driverId ? this.i18n.t('driver_has_no_vehicle') : '';
  }

  saveEdit(): void {
    if (!this.editingId || !this.draft) {
      return;
    }

    if (!this.driverId) {
      this.error = this.i18n.t('driver_required');
      return;
    }

    if (!this.selectedVehicle?.id) {
      this.error = this.i18n.t('selected_driver_must_have_vehicle');
      return;
    }

    this.draft.vehicle = { id: this.selectedVehicle.id } as Vehicle;
    const payload: MaintenanceRecord = {
      ...this.draft,
      cost: this.i18n.toStorageAmount(this.draft.cost),
    };

    this.api.updateMaintenanceRecord(this.editingId, payload).subscribe(() => {
      this.editingId = null;
      this.driverId = null;
      this.selectedVehicle = null;
      this.draft = null;
      this.loadRecords();
    });
  }

  deleteRecord(id?: number): void {
    if (!id) {
      return;
    }
    this.api.deleteMaintenanceRecord(id).subscribe(() => this.loadRecords());
  }
}
