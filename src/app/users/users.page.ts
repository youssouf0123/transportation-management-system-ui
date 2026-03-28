import { Component, OnInit } from '@angular/core';

import { TeamUser } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: false,
})
export class UsersPage implements OnInit {
  users: TeamUser[] = [];
  draft = {
    fullName: '',
    email: '',
    password: '',
    role: 'VIEWER',
  };
  error = '';

  constructor(
    public readonly authService: AuthService,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.authService.getUsers().subscribe({
      next: users => this.users = users,
      error: () => this.error = this.i18n.t('load_team_members_error'),
    });
  }

  createUser(): void {
    this.authService.createUser(this.draft).subscribe({
      next: () => {
        this.draft = { fullName: '', email: '', password: '', role: 'VIEWER' };
        this.load();
      },
      error: () => this.error = this.i18n.t('create_team_member_error'),
    });
  }

  updateRole(user: TeamUser, role: string): void {
    this.authService.updateUserRole(user.id, role).subscribe(() => this.load());
  }
}
