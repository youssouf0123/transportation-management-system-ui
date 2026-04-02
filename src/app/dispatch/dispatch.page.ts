import { Component, OnInit } from '@angular/core';

import { DispatchBoard } from '../models/dispatch-board.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.page.html',
  styleUrls: ['./dispatch.page.scss'],
  standalone: false,
})
export class DispatchPage implements OnInit {
  board: DispatchBoard | null = null;
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
    this.api.getDispatchBoard().subscribe({
      next: board => this.board = board,
      error: () => this.error = this.i18n.t('load_dispatch_error'),
    });
  }

  clearFocusedCard(event: Event): void {
    const target = event.currentTarget;
    if (target instanceof HTMLElement) {
      target.blur();
    }
  }
}
