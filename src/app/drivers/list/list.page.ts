import { Component, OnInit } from '@angular/core';

import { Driver } from '../../models/driver.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  draft: Driver | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  ionViewWillEnter(): void {
    this.loadDrivers();
  }

  loadDrivers(event?: CustomEvent): void {
    this.api.getDrivers(this.filters.status, this.filters.search).subscribe({
      next: drivers => {
        this.drivers = drivers;
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

  deleteDriver(id?: number): void {
    if (!id) {
      return;
    }
    this.api.deleteDriver(id).subscribe(() => this.loadDrivers());
  }
}
