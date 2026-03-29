import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { FinanceRecord } from '../../models/finance-record.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-finance-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit {
  records: FinanceRecord[] = [];
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  filterMode: 'date' | 'range' = 'date';
  filters = {
    driverId: null as number | null,
    type: '',
    scope: '',
    date: '',
    start: '',
    end: '',
  };
  editingId: number | null = null;
  driverId: number | null = null;
  selectedVehicle: Vehicle | null = null;
  draft: FinanceRecord | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.api.getVehicles().subscribe(vehicles => this.vehicles = vehicles);
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    const payload = {
      ...this.filters,
      date: this.filterMode === 'date' ? this.filters.date : '',
      start: this.filterMode === 'range' ? this.filters.start : '',
      end: this.filterMode === 'range' ? this.filters.end : '',
    };

    this.api.getFinanceRecords(payload).subscribe({
      next: records => this.records = records.map(record => this.api.normalizeFinanceRecord(record)),
      error: () => this.error = this.i18n.t('load_finance_error'),
    });
  }

  onFilterModeChange(): void {
    if (this.filterMode === 'date') {
      this.filters.start = '';
      this.filters.end = '';
      return;
    }

    this.filters.date = '';
  }

  startEdit(record: FinanceRecord): void {
    this.editingId = record.id ?? null;
    this.draft = this.api.normalizeFinanceRecord({
      ...record,
      description: this.localizedDescription(record),
      amount: this.i18n.toDisplayAmount(record.amount),
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

    if (this.draft.recordScope !== 'MISC') {
      if (!this.driverId) {
        this.error = this.i18n.t('driver_required');
        return;
      }

      if (!this.selectedVehicle?.id) {
        this.error = this.i18n.t('selected_driver_must_have_vehicle');
        return;
      }

      this.draft.vehicle = { id: this.selectedVehicle.id } as Vehicle;
    } else {
      this.draft.vehicle = null;
    }

    const payload: FinanceRecord = {
      ...this.draft,
      inputLanguage: this.i18n.currentLanguage,
      amount: this.i18n.toStorageAmount(this.draft.amount),
    };

    this.api.updateFinanceRecord(this.editingId, payload).subscribe(() => {
      this.editingId = null;
      this.driverId = null;
      this.selectedVehicle = null;
      this.draft = null;
      this.load();
    });
  }

  deleteRecord(id?: number): void {
    if (!id) {
      return;
    }
    this.api.deleteFinanceRecord(id).subscribe(() => this.load());
  }

  localizedDescription(record: FinanceRecord): string {
    if (this.i18n.currentLanguage === 'fr') {
      return record.descriptionFr || record.description || record.descriptionEn || '';
    }

    return record.descriptionEn || record.description || record.descriptionFr || '';
  }
}
