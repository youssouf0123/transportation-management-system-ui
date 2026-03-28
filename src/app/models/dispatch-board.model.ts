import { Driver } from './driver.model';
import { MaintenanceRecord } from './maintenance-record.model';
import { Trip } from './trip.model';
import { Vehicle } from './vehicle.model';

export interface DispatchBoard {
  availableDrivers: Driver[];
  availableVehicles: Vehicle[];
  unassignedTrips: Trip[];
  activeTrips: Trip[];
  maintenanceAlerts: MaintenanceRecord[];
  availableDriverCount: number;
  availableVehicleCount: number;
  unassignedTripCount: number;
}
