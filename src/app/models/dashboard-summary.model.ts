import { MaintenanceRecord } from './maintenance-record.model';
import { Trip } from './trip.model';

export interface DashboardSummary {
  drivers: number;
  availableDrivers: number;
  vehicles: number;
  assignedVehicles: number;
  activeTrips: number;
  maintenanceDue: number;
  earnings: number;
  expenses: number;
  net: number;
  recentTrips: Trip[];
  recentMaintenance: MaintenanceRecord[];
}
