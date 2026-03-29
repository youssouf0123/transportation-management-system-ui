import { Component } from '@angular/core';

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
export class ReportsPage {
  drivers: Driver[] = [];
  driverId: number | null = null;
  filterMode: 'date' | 'range' = 'date';
  date = '';
  start = '';
  end = '';
  type = '';
  records: FinanceRecord[] = [];
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {
    this.api.getDrivers().subscribe(drivers => this.drivers = drivers);
  }

  onFilterModeChange(): void {
    if (this.filterMode === 'date') {
      this.start = '';
      this.end = '';
      return;
    }

    this.date = '';
  }

  runReport(): void {
    this.error = '';
    this.api.getFinanceRecords({
      driverId: this.driverId,
      type: this.type,
      date: this.filterMode === 'date' ? this.date : '',
      start: this.filterMode === 'range' ? this.start : '',
      end: this.filterMode === 'range' ? this.end : '',
    }).subscribe({
      next: records => {
        this.records = records.map(record => this.api.normalizeFinanceRecord(record));
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
