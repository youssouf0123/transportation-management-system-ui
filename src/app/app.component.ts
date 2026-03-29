import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { I18nService } from './services/i18n.service';

interface NavSection {
  value: string;
  titleKey: string;
  items: Array<{
    titleKey: string;
    url: string;
    icon: string;
    roles?: string[];
    adminOnly?: boolean;
  }>;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly themeStorageKey = 'tms_theme';
  searchQuery = '';
  isDarkMode = false;
  readonly navSections: NavSection[] = [
    {
      value: 'overview',
      titleKey: 'overview',
      items: [
        { titleKey: 'dashboard', url: '/home', icon: 'grid' },
        { titleKey: 'search_everywhere', url: '/search', icon: 'search' },
        { titleKey: 'dispatch_board', url: '/dispatch', icon: 'git-network', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'VIEWER'] },
      ],
    },
    {
      value: 'drivers-management',
      titleKey: 'drivers_management',
      items: [
        { titleKey: 'view_all_drivers', url: '/drivers/list', icon: 'people', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'VIEWER'] },
        { titleKey: 'add_new_driver', url: '/drivers/create', icon: 'person-add', roles: ['OWNER', 'MANAGER', 'DISPATCHER'] },
      ],
    },
    {
      value: 'vehicles-management',
      titleKey: 'vehicles_management',
      items: [
        { titleKey: 'view_all_vehicles', url: '/vehicles/list', icon: 'bus', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'VIEWER'] },
        { titleKey: 'add_new_vehicle', url: '/vehicles/create', icon: 'car-sport', roles: ['OWNER', 'MANAGER', 'DISPATCHER'] },
        { titleKey: 'assign_driver', url: '/vehicles/assign', icon: 'git-compare', roles: ['OWNER', 'MANAGER', 'DISPATCHER'] },
      ],
    },
    {
      value: 'finance-management',
      titleKey: 'finance_management',
      items: [
        { titleKey: 'view_finance_records', url: '/finance/list', icon: 'receipt', roles: ['OWNER', 'MANAGER', 'FINANCE', 'VIEWER'] },
        { titleKey: 'add_finance_record', url: '/finance/create', icon: 'cash', roles: ['OWNER', 'MANAGER', 'FINANCE'] },
        { titleKey: 'financial_reports', url: '/finance/reports', icon: 'stats-chart', roles: ['OWNER', 'MANAGER', 'FINANCE', 'VIEWER'] },
      ],
    },
    {
      value: 'trips-management',
      titleKey: 'trips_management',
      items: [
        { titleKey: 'view_trips', url: '/trips/list', icon: 'map', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'VIEWER'] },
        { titleKey: 'create_trip', url: '/trips/create', icon: 'navigate', roles: ['OWNER', 'MANAGER', 'DISPATCHER'] },
      ],
    },
    {
      value: 'maintenance',
      titleKey: 'maintenance',
      items: [
        { titleKey: 'view_maintenance', url: '/maintenance/list', icon: 'construct', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'VIEWER'] },
        { titleKey: 'schedule_service', url: '/maintenance/create', icon: 'hammer', roles: ['OWNER', 'MANAGER', 'DISPATCHER'] },
      ],
    },
    {
      value: 'workspace',
      titleKey: 'workspace',
      items: [
        { titleKey: 'team_roles', url: '/users', icon: 'people-circle', roles: ['OWNER', 'MANAGER'] },
        { titleKey: 'manage_users', url: '/manage-users', icon: 'settings', roles: ['OWNER', 'MANAGER'], adminOnly: true },
        { titleKey: 'document_library', url: '/documents', icon: 'document-text', roles: ['OWNER', 'MANAGER', 'DISPATCHER', 'FINANCE', 'VIEWER'] },
        { titleKey: 'audit_log', url: '/audit', icon: 'shield-checkmark', roles: ['OWNER', 'MANAGER'] },
      ],
    },
  ];

  constructor(
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
    private readonly router: Router,
    private readonly menuController: MenuController,
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(this.themeStorageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.applyTheme(savedTheme === 'dark');
      return;
    }

    this.applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  closeMenu(): void {
    void this.menuController.close();
  }

  goToSearch(): void {
    void this.router.navigate(['/search'], {
      queryParams: { q: this.searchQuery.trim() || null },
    });
    this.closeMenu();
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode);
    localStorage.setItem(this.themeStorageKey, this.isDarkMode ? 'dark' : 'light');
  }

  setLanguage(language: 'en' | 'fr'): void {
    this.i18n.setLanguage(language);
  }

  get filteredNavSections(): NavSection[] {
    return this.navSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => this.canAccessItem(item.roles, item.adminOnly)),
      }))
      .filter(section => section.items.length > 0);
  }

  private canAccessItem(roles?: string[], adminOnly?: boolean): boolean {
    if (adminOnly && !this.authService.isPlatformAdmin()) {
      return false;
    }
    if (!roles || roles.length === 0) {
      return true;
    }
    return this.authService.hasRole(...roles);
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    document.body.classList.toggle('dark', isDark);
  }
}
