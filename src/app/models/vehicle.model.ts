import { Driver } from './driver.model';

export interface Vehicle {
  id?: number;
  make: string;
  model: string;
  plateNumber: string;
  status?: string;
  currentMileage?: number | null;
  driver?: Driver | null;
}
