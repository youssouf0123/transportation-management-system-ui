import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchResponse } from '../models/search-result.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit {
  query = '';
  searching = false;
  error = '';
  results: SearchResponse = {
    query: '',
    totalResults: 0,
    sections: [],
  };

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.query = (params.get('q') || '').trim();
      if (!this.query) {
        this.results = { query: '', totalResults: 0, sections: [] };
        return;
      }
      this.runSearch(false);
    });
  }

  runSearch(updateUrl = true): void {
    const trimmed = this.query.trim();
    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: trimmed || null },
        queryParamsHandling: 'merge',
      });
      if (!trimmed) {
        return;
      }
    }

    if (!trimmed) {
      this.results = { query: '', totalResults: 0, sections: [] };
      return;
    }

    this.searching = true;
    this.error = '';
    this.api.getGlobalSearch(trimmed, this.i18n.currentLanguage).subscribe({
      next: (response) => {
        this.results = response;
        this.searching = false;
      },
      error: () => {
        this.error = this.i18n.t('search_page_error');
        this.searching = false;
      },
    });
  }
}
