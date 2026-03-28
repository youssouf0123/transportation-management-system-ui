import { Driver } from './driver.model';
import { Vehicle } from './vehicle.model';

export interface Trip {
  id?: number;
  origin: string;
  destination: string;
  status: string;
  scheduledDate: string;
  cargoDescription?: string;
  notes?: string;
  driver?: Driver | null;
  vehicle?: Vehicle | null;
}
