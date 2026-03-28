import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  organizationName = '';
  fullName = '';
  email = '';
  password = '';
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/home');
    }
  }

  register(): void {
    this.error = '';
    this.authService.register({
      organizationName: this.organizationName,
      fullName: this.fullName,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: () => this.error = this.i18n.t('create_organization_error'),
    });
  }
}
