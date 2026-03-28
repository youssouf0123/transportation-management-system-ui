import { Vehicle } from './vehicle.model';

export interface MaintenanceRecord {
  id?: number;
  serviceType: string;
  status: string;
  serviceDate: string;
  mileage?: number | null;
  cost: number;
  notes?: string;
  vehicle?: Vehicle | null;
}
