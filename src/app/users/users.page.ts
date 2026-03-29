import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

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
  editingUserId: number | null = null;
  editDraft = {
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
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('create_team_member_error'),
    });
  }

  updateRole(user: TeamUser, role: string): void {
    this.authService.updateUserRole(user.id, role).subscribe(() => this.load());
  }

  updateUserStatus(user: TeamUser, status: string): void {
    this.error = '';
    this.authService.updateUserStatus(user.id, status).subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_user_status_error'),
    });
  }

  startEdit(user: TeamUser): void {
    this.error = '';
    this.editingUserId = user.id;
    this.editDraft = {
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
    };
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editDraft = {
      fullName: '',
      email: '',
      password: '',
      role: 'VIEWER',
    };
  }

  saveEdit(user: TeamUser): void {
    this.error = '';
    this.authService.updateUser(user.id, this.editDraft).subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_user_error'),
    });
  }

  deleteUser(user: TeamUser): void {
    this.error = '';
    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        if (this.editingUserId === user.id) {
          this.cancelEdit();
        }
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('delete_user_error'),
    });
  }

  get canDeleteUsers(): boolean {
    return this.authService.hasRole('OWNER');
  }

  statusActionLabel(user: TeamUser): string {
    return user.status === 'ACTIVE' ? this.i18n.t('revoke_access') : this.i18n.t('accept_request');
  }

  nextStatus(user: TeamUser): string {
    return user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
  }
}
