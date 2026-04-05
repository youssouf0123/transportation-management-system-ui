import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Driver } from '../../models/driver.model';
import { FinanceRecord } from '../../models/finance-record.model';
import { ApiService } from '../../services/api.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-finance-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false,
})
export class ReportsPage implements OnInit, OnDestroy {
  drivers: Driver[] = [];
  readonly miscCategories = ['FAMILY_EXPENSE', 'PERSONAL', 'OTHER', 'HOUSEHOLD'];
  scope = '';
  driverId: number | null = null;
  category = '';
  filterMode: 'date' | 'range' = 'date';
  date = '';
  start = '';
  end = '';
  type = '';
  records: FinanceRecord[] = [];
  error = '';
  private languageSubscription?: Subscription;

  constructor(
    private readonly api: ApiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public readonly i18n: I18nService,
  ) {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
  }

  ngOnInit(): void {
    this.languageSubscription = this.i18n.language$.subscribe(() => {
      queueMicrotask(() => this.changeDetectorRef.markForCheck());
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  onFilterModeChange(): void {
    if (this.filterMode === 'date') {
      this.start = '';
      this.end = '';
      return;
    }

    this.date = '';
  }

  onScopeChange(): void {
    this.driverId = null;
    this.category = '';
  }

  secondaryFilterLabel(): string {
    if (this.scope === 'MISC') {
      return this.i18n.t('miscellaneous');
    }

    if (!this.scope) {
      return `${this.i18n.t('entity_driver')}/${this.i18n.t('miscellaneous')}`;
    }

    return this.i18n.t('entity_driver');
  }

  scopeSelectedText(): string {
    return this.scope ? this.i18n.enum('scope', this.scope) : this.i18n.t('all');
  }

  secondarySelectedText(): string {
    if (this.scope === 'VEHICLE') {
      if (!this.driverId) {
        return this.i18n.t('all');
      }
      return this.drivers.find(driver => driver.id === this.driverId)?.name || this.i18n.t('all');
    }

    if (this.scope === 'MISC') {
      return this.category ? this.i18n.enum('category', this.category) : this.i18n.t('all');
    }

    return this.i18n.t('all');
  }

  typeSelectedText(): string {
    return this.type ? this.i18n.enum('status', this.type) : this.i18n.t('all');
  }

  filterModeSelectedText(): string {
    return this.filterMode === 'range' ? this.i18n.t('date_range') : this.i18n.t('single_date');
  }

  runReport(): void {
    this.error = '';
    this.api.getFinanceRecords({
      driverId: this.scope === 'VEHICLE' ? this.driverId : null,
      category: this.scope === 'MISC' ? this.category : '',
      scope: this.scope,
      type: this.type,
      date: this.filterMode === 'date' ? this.date : '',
      start: this.filterMode === 'range' ? this.start : '',
      end: this.filterMode === 'range' ? this.end : '',
    }).subscribe({
      next: records => {
        const normalizedRecords = records.map(record => this.api.normalizeFinanceRecord(record));
        this.records = normalizedRecords.filter(record => {
          if (this.scope && this.scope.toUpperCase() !== (record.recordScope || '').toUpperCase()) {
            return false;
          }

          if (this.scope === 'VEHICLE' && this.driverId && record.vehicle?.driver?.id !== this.driverId) {
            return false;
          }

          if (this.scope === 'MISC' && this.category && this.category.toUpperCase() !== (record.category || '').toUpperCase()) {
            return false;
          }

          return true;
        });
      },
      error: () => {
        this.error = this.i18n.t('finance_report_error');
      },
    });
  }

  get earnings(): number {
    return this.records.filter(record => record.type === 'EARNING').reduce((sum, record) => sum + record.amount, 0);
  }

  get expenses(): number {
    return this.records.filter(record => record.type === 'EXPENSE').reduce((sum, record) => sum + record.amount, 0);
  }
}
