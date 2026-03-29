import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { AuthResponse, SessionUser, TeamUser, WorkspaceAdminOverview, WorkspaceSummary } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = (window as { __env?: { apiBaseUrl?: string } }).__env?.apiBaseUrl || environment.apiBaseUrl;
  private readonly tokenKey = 'tms_auth_token';
  private readonly userKey = 'tms_auth_user';
  private readonly userSubject = new BehaviorSubject<SessionUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  register(payload: {
    organizationName: string;
    fullName: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.storeSession(response);
        }
      })
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.storeSession(response);
        }
      })
    );
  }

  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/auth/me`);
  }

  getUsers(): Observable<TeamUser[]> {
    return this.http.get<TeamUser[]>(`${this.baseUrl}/users`);
  }

  createUser(payload: { fullName: string; email: string; password: string; role: string }): Observable<TeamUser> {
    return this.http.post<TeamUser>(`${this.baseUrl}/users`, payload);
  }

  updateUserRole(id: number, role: string): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.baseUrl}/users/${id}/role`, { role });
  }

  updateUser(id: number, payload: { fullName: string; email: string; role: string; password?: string }): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.baseUrl}/users/${id}`, payload);
  }

  updateUserStatus(id: number, status: string): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.baseUrl}/users/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  getWorkspaceAdminOverview(): Observable<WorkspaceAdminOverview> {
    return this.http.get<WorkspaceAdminOverview>(`${this.baseUrl}/admin/workspaces`);
  }

  updateWorkspace(id: number, payload: { name?: string; status?: string }): Observable<WorkspaceSummary> {
    return this.http.put<WorkspaceSummary>(`${this.baseUrl}/admin/workspaces/${id}`, payload);
  }

  updateWorkspaceStatus(id: number, status: string): Observable<WorkspaceSummary> {
    return this.http.put<WorkspaceSummary>(`${this.baseUrl}/admin/workspaces/${id}/status`, { status });
  }

  deleteWorkspace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/workspaces/${id}`);
  }

  updateAdminUser(id: number, payload: { fullName: string; email: string; role: string }): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.baseUrl}/admin/users/${id}`, payload);
  }

  updateAdminUserStatus(id: number, status: string): Observable<TeamUser> {
    return this.http.put<TeamUser>(`${this.baseUrl}/admin/users/${id}/status`, { status });
  }

  deleteAdminUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${id}`);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) ?? '';
  }

  getCurrentUser(): SessionUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const currentRole = this.getCurrentUser()?.role;
    return !!currentRole && roles.some(role => role.toUpperCase() === currentRole.toUpperCase());
  }

  isPlatformAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user
      && user.fullName === 'Youssouf Diarra'
      && user.email === 'dyoussouf12@gmail.com';
  }

  private storeSession(response: AuthResponse): void {
    if (!response.token || !response.user) {
      return;
    }
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private readStoredUser(): SessionUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as SessionUser : null;
  }
}
