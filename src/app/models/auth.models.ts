export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  organizationName: string;
  organizationId: number;
  organizationStatus?: string;
}

export interface AuthResponse {
  token?: string;
  user?: SessionUser;
  pendingApproval?: boolean;
  organizationStatus?: string;
  message?: string;
}

export interface TeamUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  organizationName: string;
  organizationId: number;
}

export interface WorkspaceSummary {
  id: number;
  name: string;
  status: string;
  users: TeamUser[];
}

export interface WorkspaceAdminOverview {
  organizations: WorkspaceSummary[];
  requests: WorkspaceSummary[];
}
