import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { FinanceRecord } from '../../models/finance-record.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-finance-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage implements OnInit {
  activeTab: 'vehicle' | 'misc' = 'vehicle';
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  driverId: number | null = null;
  selectedVehicle: Vehicle | null = null;
  vehicleRecord: FinanceRecord = {
    type: 'EARNING',
    recordScope: 'VEHICLE',
    category: 'OPERATIONS',
    description: '',
    amount: 0,
    date: '',
  };
  miscRecord: FinanceRecord = {
    type: 'EXPENSE',
    recordScope: 'MISC',
    category: 'OTHER',
    description: '',
    amount: 0,
    date: '',
  };
  saving = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.api.getDrivers().subscribe(drivers => {
      this.drivers = drivers;
    });
    this.api.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
    });
  }

  onDriverChange(): void {
    this.selectedVehicle = this.vehicles.find(vehicle => vehicle.driver?.id === this.driverId) ?? null;
    if (!this.selectedVehicle) {
      this.error = this.i18n.t('driver_has_no_vehicle');
      return;
    }
    this.error = '';
  }

  saveVehicleRecord(): void {
    if (!this.driverId) {
      this.error = this.i18n.t('driver_required');
      return;
    }

    if (!this.selectedVehicle?.id) {
      this.error = this.i18n.t('selected_driver_must_have_vehicle');
      return;
    }

    const payload: FinanceRecord = {
      ...this.vehicleRecord,
      inputLanguage: this.i18n.currentLanguage,
      amount: this.i18n.toStorageAmount(this.vehicleRecord.amount),
      date: this.vehicleRecord.date?.trim() ? this.vehicleRecord.date : this.today(),
    };

    this.saving = true;
    this.error = '';
    this.api.addFinanceRecord(this.selectedVehicle.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.driverId = null;
        this.selectedVehicle = null;
        this.vehicleRecord = {
          type: 'EARNING',
          recordScope: 'VEHICLE',
          category: 'OPERATIONS',
          description: '',
          amount: 0,
          date: '',
        };
      },
      error: () => {
        this.error = this.i18n.t('save_finance_error');
        this.saving = false;
      },
    });
  }

  saveMiscRecord(): void {
    const payload: FinanceRecord = {
      ...this.miscRecord,
      inputLanguage: this.i18n.currentLanguage,
      amount: this.i18n.toStorageAmount(this.miscRecord.amount),
      date: this.miscRecord.date?.trim() ? this.miscRecord.date : this.today(),
      recordScope: 'MISC',
    };

    this.saving = true;
    this.error = '';
    this.api.addMiscFinanceRecord(payload).subscribe({
      next: () => {
        this.saving = false;
        this.miscRecord = {
          type: 'EXPENSE',
          recordScope: 'MISC',
          category: 'OTHER',
          description: '',
          amount: 0,
          date: '',
        };
      },
      error: () => {
        this.error = this.i18n.t('save_misc_finance_error');
        this.saving = false;
      },
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
