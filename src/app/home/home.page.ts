import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter, forkJoin } from 'rxjs';

import { DashboardSummary } from '../models/dashboard-summary.model';
import { FinanceRecord } from '../models/finance-record.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  error = '';
  private languageSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private readonly api: ApiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly router: Router,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.i18n.language$.subscribe(() => {
      if (this.router.url.startsWith('/home')) {
        this.loadSummary();
        return;
      }

      queueMicrotask(() => this.changeDetectorRef.markForCheck());
    });

    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        if (event.urlAfterRedirects.startsWith('/home')) {
          this.loadSummary();
        }
      });

    this.loadSummary();
  }

  ionViewWillEnter(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    const { start, end } = this.currentMonthRange();

    forkJoin({
      summary: this.api.getDashboardSummary(),
      financeRecords: this.api.getFinanceRecords({ start, end }),
    }).subscribe({
      next: ({ summary, financeRecords }) => {
        this.summary = financeRecords.length
          ? {
              ...summary,
              ...this.calculateMonthlyNet(financeRecords),
            }
          : summary;
      },
      error: () => {
        this.error = this.i18n.t('dashboard_load_error');
      }
    });
  }

  private calculateMonthlyNet(records: FinanceRecord[]): Pick<DashboardSummary, 'earnings' | 'expenses' | 'net'> {
    const earnings = records
      .filter(record => record.type?.toUpperCase() === 'EARNING')
      .reduce((sum, record) => sum + (record.amount || 0), 0);

    const expenses = records
      .filter(record => record.type?.toUpperCase() === 'EXPENSE')
      .reduce((sum, record) => sum + (record.amount || 0), 0);

    return {
      earnings,
      expenses,
      net: earnings - expenses,
    };
  }

  private currentMonthRange(): { start: string; end: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${day}`,
    };
  }

  statusLabel(status: string, fallback = 'SCHEDULED'): string {
    return this.i18n.enum('status', status, fallback);
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

}
