import { Component, OnInit } from '@angular/core';

import { AuditLog } from '../models/audit-log.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.page.html',
  styleUrls: ['./audit.page.scss'],
  standalone: false,
})
export class AuditPage implements OnInit {
  logs: AuditLog[] = [];
  filters = {
    entityType: '',
    action: '',
  };
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.api.getAuditLogs(this.filters).subscribe({
      next: logs => this.logs = logs,
      error: () => this.error = this.i18n.t('load_audit_error'),
    });
  }
}
