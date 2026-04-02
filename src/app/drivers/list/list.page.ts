import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Driver } from '../../models/driver.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-drivers-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false,
})
export class ListPage implements OnInit {
  drivers: Driver[] = [];
  filters = {
    search: '',
    status: '',
  };
  editingId: number | null = null;
  highlightedDriverId: number | null = null;
  draft: Driver | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly confirmService: ConfirmService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const driverId = Number(params.get('driverId'));
      this.highlightedDriverId = Number.isFinite(driverId) && driverId > 0 ? driverId : null;
      this.loadDrivers();
    });
  }

  ionViewWillEnter(): void {
    this.loadDrivers();
  }

  loadDrivers(event?: CustomEvent): void {
    this.api.getDrivers(this.filters.status, this.filters.search).subscribe({
      next: drivers => {
        this.drivers = drivers;
        this.focusHighlightedDriver();
        event?.detail.complete();
      },
      error: () => {
        this.error = this.i18n.t('load_drivers_error');
        event?.detail.complete();
      },
    });
  }

  startEdit(driver: Driver): void {
    this.editingId = driver.id ?? null;
    this.draft = { ...driver };
  }

  saveEdit(): void {
    if (!this.editingId || !this.draft) {
      return;
    }
    this.api.updateDriver(this.editingId, this.draft).subscribe(() => {
      this.editingId = null;
      this.draft = null;
      this.loadDrivers();
    });
  }

  async deleteDriver(id?: number): Promise<void> {
    if (!id) {
      return;
    }
    if (!await this.confirmService.confirmDelete()) {
      return;
    }
    this.api.deleteDriver(id).subscribe(() => this.loadDrivers());
  }

  private focusHighlightedDriver(): void {
    if (!this.highlightedDriverId) {
      return;
    }

    window.setTimeout(() => {
      const element = document.getElementById(`driver-record-${this.highlightedDriverId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
