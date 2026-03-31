import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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
  message = '';
  fieldErrors: string[] = [];

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
    this.message = '';
    this.fieldErrors = [];

    if (!this.organizationName.trim()) {
      this.fieldErrors.push(this.i18n.t('organization_name_required'));
    }

    if (!this.fullName.trim()) {
      this.fieldErrors.push(this.i18n.t('full_name_required'));
    }

    if (!this.email.trim()) {
      this.fieldErrors.push(this.i18n.t('email_required'));
    }

    if (!this.password.trim()) {
      this.fieldErrors.push(this.i18n.t('password_required'));
    }

    if (this.fieldErrors.length > 0) {
      return;
    }

    this.authService.register({
      organizationName: this.organizationName.trim(),
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
    }).subscribe({
      next: response => {
        if (response.pendingApproval) {
          this.message = response.message || this.i18n.t('workspace_request_submitted');
          this.password = '';
          return;
        }
        this.router.navigateByUrl('/home');
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('create_organization_error'),
    });
  }
}
