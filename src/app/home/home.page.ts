import { Component, OnInit } from '@angular/core';

import { DashboardSummary } from '../models/dashboard-summary.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  summary: DashboardSummary | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  ionViewWillEnter(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.api.getDashboardSummary().subscribe({
      next: summary => {
        this.summary = summary;
      },
      error: () => {
        this.error = this.i18n.t('dashboard_load_error');
      }
    });
  }

}
