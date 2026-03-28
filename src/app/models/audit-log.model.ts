export interface AuditLog {
  id?: number;
  action: string;
  entityType: string;
  entityId?: number | null;
  description: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  createdAt: string;
}
