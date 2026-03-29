import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { TeamUser, WorkspaceSummary } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.page.html',
  styleUrls: ['./manage-users.page.scss'],
  standalone: false,
})
export class ManageUsersPage implements OnInit {
  organizations: WorkspaceSummary[] = [];
  requests: WorkspaceSummary[] = [];
  error = '';
  editingWorkspaceId: number | null = null;
  editingUserId: number | null = null;
  workspaceDraft = {
    name: '',
    status: 'PENDING',
  };
  userDraft = {
    fullName: '',
    email: '',
    role: 'VIEWER',
  };

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
    this.authService.getWorkspaceAdminOverview().subscribe({
      next: overview => {
        this.organizations = overview.organizations;
        this.requests = overview.requests;
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('load_manage_users_error'),
    });
  }

  startWorkspaceEdit(workspace: WorkspaceSummary): void {
    this.error = '';
    this.editingWorkspaceId = workspace.id;
    this.workspaceDraft = {
      name: workspace.name,
      status: workspace.status,
    };
  }

  cancelWorkspaceEdit(): void {
    this.editingWorkspaceId = null;
    this.workspaceDraft = {
      name: '',
      status: 'PENDING',
    };
  }

  saveWorkspace(workspace: WorkspaceSummary): void {
    this.error = '';
    this.authService.updateWorkspace(workspace.id, this.workspaceDraft).subscribe({
      next: () => {
        this.cancelWorkspaceEdit();
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_workspace_error'),
    });
  }

  updateWorkspaceStatus(workspace: WorkspaceSummary, status: string): void {
    this.error = '';
    this.authService.updateWorkspaceStatus(workspace.id, status).subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_workspace_status_error'),
    });
  }

  deleteWorkspace(workspace: WorkspaceSummary): void {
    this.error = '';
    this.authService.deleteWorkspace(workspace.id).subscribe({
      next: () => {
        if (this.editingWorkspaceId === workspace.id) {
          this.cancelWorkspaceEdit();
        }
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('delete_workspace_error'),
    });
  }

  startUserEdit(user: TeamUser): void {
    this.error = '';
    this.editingUserId = user.id;
    this.userDraft = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  cancelUserEdit(): void {
    this.editingUserId = null;
    this.userDraft = {
      fullName: '',
      email: '',
      role: 'VIEWER',
    };
  }

  saveUser(user: TeamUser): void {
    this.error = '';
    this.authService.updateAdminUser(user.id, this.userDraft).subscribe({
      next: () => {
        this.cancelUserEdit();
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_user_error'),
    });
  }

  deleteUser(user: TeamUser): void {
    this.error = '';
    this.authService.deleteAdminUser(user.id).subscribe({
      next: () => {
        if (this.editingUserId === user.id) {
          this.cancelUserEdit();
        }
        this.load();
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('delete_user_error'),
    });
  }

  ownerUser(workspace: WorkspaceSummary): TeamUser | undefined {
    return workspace.users.find(user => user.role === 'OWNER');
  }

  updateUserStatus(user: TeamUser, status: string): void {
    this.error = '';
    this.authService.updateAdminUserStatus(user.id, status).subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => this.error = error.error?.message || this.i18n.t('update_user_status_error'),
    });
  }

  userStatusLabel(user: TeamUser): string {
    return user.status === 'ACTIVE' ? this.i18n.t('approved') : this.i18n.t('revoked');
  }

  userStatusAction(user: TeamUser): string {
    return user.status === 'ACTIVE' ? this.i18n.t('revoke_access') : this.i18n.t('accept_request');
  }

  nextUserStatus(user: TeamUser): string {
    return user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
  }
}
