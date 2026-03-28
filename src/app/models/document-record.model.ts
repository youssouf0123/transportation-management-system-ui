import { SessionUser } from './auth.models';

export interface DocumentRecord {
  id?: number;
  title: string;
  documentType: string;
  entityType: string;
  entityId?: number | null;
  status: string;
  fileUrl: string;
  fileName?: string;
  fileContentType?: string;
  fileSize?: number;
  notes: string;
  expiryDate: string;
  uploadedBy?: SessionUser | null;
  createdAt?: string;
}
