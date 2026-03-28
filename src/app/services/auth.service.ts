import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { AuthResponse, SessionUser, TeamUser } from '../models/auth.models';
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
      tap(response => this.storeSession(response))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap(response => this.storeSession(response))
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

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private readStoredUser(): SessionUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as SessionUser : null;
  }
}
