export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  organizationName: string;
  organizationId: number;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
}

export interface TeamUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  organizationName: string;
}
