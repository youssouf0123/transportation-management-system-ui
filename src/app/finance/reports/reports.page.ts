import { Component } from '@angular/core';

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
  start = '';
  end = '';
  type = '';
  records: FinanceRecord[] = [];
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  runReport(): void {
    this.error = '';
    this.api.getFinanceRecords({
      type: this.type,
      start: this.start,
      end: this.end,
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
