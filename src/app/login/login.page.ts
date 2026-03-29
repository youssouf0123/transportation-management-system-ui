import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
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

  login(): void {
    this.error = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('sign_in_error'),
    });
  }
}
