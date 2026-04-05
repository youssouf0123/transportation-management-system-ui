import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Driver } from '../../models/driver.model';
import { FinanceRecord } from '../../models/finance-record.model';
import { Vehicle } from '../../models/vehicle.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-finance-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit, OnDestroy {
  records: FinanceRecord[] = [];
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  readonly miscCategories = ['FAMILY_EXPENSE', 'PERSONAL', 'OTHER', 'HOUSEHOLD'];
  filterMode: 'date' | 'range' = 'date';
  filters = {
    scope: '',
    driverId: null as number | null,
    category: '',
    type: '',
    date: '',
    start: '',
    end: '',
  };
  editingId: number | null = null;
  highlightedRecordId: number | null = null;
  driverId: number | null = null;
  selectedVehicle: Vehicle | null = null;
  draft: FinanceRecord | null = null;
  error = '';
  private languageSubscription?: Subscription;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly confirmService: ConfirmService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.i18n.language$.subscribe(() => {
      queueMicrotask(() => this.changeDetectorRef.markForCheck());
    });
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.api.getVehicles().subscribe(vehicles => this.vehicles = vehicles);
    this.route.queryParamMap.subscribe(params => {
      const recordId = Number(params.get('recordId'));
      this.highlightedRecordId = Number.isFinite(recordId) && recordId > 0 ? recordId : null;
      this.load();
    });
  }

  ionViewWillEnter(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  load(): void {
    const payload = {
      ...this.filters,
      driverId: this.filters.scope === 'VEHICLE' ? this.filters.driverId : null,
      category: this.filters.scope === 'MISC' ? this.filters.category : '',
      date: this.filterMode === 'date' ? this.filters.date : '',
      start: this.filterMode === 'range' ? this.filters.start : '',
      end: this.filterMode === 'range' ? this.filters.end : '',
    };

    this.api.getFinanceRecords(payload).subscribe({
      next: records => {
        const normalizedRecords = records.map(record => this.api.normalizeFinanceRecord(record));
        this.records = this.applyClientFilters(normalizedRecords, payload);
        this.focusHighlightedRecord();
      },
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

  onScopeChange(): void {
    this.filters.driverId = null;
    this.filters.category = '';
  }

  secondaryFilterLabel(): string {
    if (this.filters.scope === 'MISC') {
      return this.i18n.t('miscellaneous');
    }

    if (!this.filters.scope) {
      return `${this.i18n.t('entity_driver')}/${this.i18n.t('miscellaneous')}`;
    }

    return this.i18n.t('entity_driver');
  }

  scopeSelectedText(): string {
    return this.filters.scope ? this.i18n.enum('scope', this.filters.scope) : this.i18n.t('all');
  }

  secondarySelectedText(): string {
    if (this.filters.scope === 'VEHICLE') {
      if (!this.filters.driverId) {
        return this.i18n.t('all');
      }
      return this.drivers.find(driver => driver.id === this.filters.driverId)?.name || this.i18n.t('all');
    }

    if (this.filters.scope === 'MISC') {
      return this.filters.category ? this.i18n.enum('category', this.filters.category) : this.i18n.t('all');
    }

    return this.i18n.t('all');
  }

  typeSelectedText(): string {
    return this.filters.type ? this.i18n.enum('status', this.filters.type) : this.i18n.t('all');
  }

  filterModeSelectedText(): string {
    return this.filterMode === 'range' ? this.i18n.t('date_range') : this.i18n.t('single_date');
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

  async deleteRecord(id?: number): Promise<void> {
    if (!id) {
      return;
    }
    if (!await this.confirmService.confirmDelete()) {
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

  private applyClientFilters(records: FinanceRecord[], payload: typeof this.filters & {
    driverId: number | null;
    category: string;
    date: string;
    start: string;
    end: string;
  }): FinanceRecord[] {
    return records.filter(record => {
      if (payload.scope && payload.scope.toUpperCase() !== (record.recordScope || '').toUpperCase()) {
        return false;
      }

      if (payload.scope === 'VEHICLE' && payload.driverId && record.vehicle?.driver?.id !== payload.driverId) {
        return false;
      }

      if (payload.scope === 'MISC' && payload.category && payload.category.toUpperCase() !== (record.category || '').toUpperCase()) {
        return false;
      }

      if (payload.type && payload.type.toUpperCase() !== (record.type || '').toUpperCase()) {
        return false;
      }

      return true;
    });
  }

  private focusHighlightedRecord(): void {
    if (!this.highlightedRecordId) {
      return;
    }

    window.setTimeout(() => {
      const element = document.getElementById(`finance-record-${this.highlightedRecordId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
