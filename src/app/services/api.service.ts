import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Driver } from '../models/driver.model';
import { Vehicle } from '../models/vehicle.model';
import { FinanceRecord } from '../models/finance-record.model';
import { Trip } from '../models/trip.model';
import { MaintenanceRecord } from '../models/maintenance-record.model';
import { DashboardSummary } from '../models/dashboard-summary.model';
import { DispatchBoard } from '../models/dispatch-board.model';
import { AuditLog } from '../models/audit-log.model';
import { DocumentRecord } from '../models/document-record.model';
import { SearchResponse } from '../models/search-result.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = (window as { __env?: { apiBaseUrl?: string } }).__env?.apiBaseUrl || environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Driver endpoints
  createDriver(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(`${this.baseUrl}/drivers`, driver);
  }

  updateDriver(id: number, driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${this.baseUrl}/drivers/${id}`, driver);
  }

  deleteDriver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/drivers/${id}`);
  }

  // Vehicle endpoints
  getDrivers(status?: string, search?: string): Observable<Driver[]> {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<Driver[]>(`${this.baseUrl}/drivers${suffix}`);
  }

  getVehicles(status?: string, search?: string, driverId?: number | null): Observable<Vehicle[]> {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    if (driverId) query.set('driverId', String(driverId));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles${suffix}`);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  updateVehicle(id: number, vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.baseUrl}/vehicles/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }

  assignDriverToVehicle(vehicleId: number, driverId: number): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles/${vehicleId}/assignDriver/${driverId}`, {});
  }

  // Finance endpoints
  addFinanceRecord(vehicleId: number, record: FinanceRecord): Observable<FinanceRecord> {
    return this.http.post<FinanceRecord>(`${this.baseUrl}/finance/${vehicleId}`, {
      ...record,
      recordScope: 'VEHICLE',
      date: this.toApiDate(record.date),
    });
  }

  addMiscFinanceRecord(record: FinanceRecord): Observable<FinanceRecord> {
    return this.http.post<FinanceRecord>(`${this.baseUrl}/finance/misc`, {
      ...record,
      recordScope: 'MISC',
      date: this.toApiDate(record.date),
    });
  }

  updateFinanceRecord(id: number, record: FinanceRecord): Observable<FinanceRecord> {
    return this.http.put<FinanceRecord>(`${this.baseUrl}/finance/${id}`, {
      ...record,
      date: this.toApiDate(record.date),
    });
  }

  deleteFinanceRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/finance/${id}`);
  }

  getFinanceRecords(filters: {
    vehicleId?: number | null;
    driverId?: number | null;
    type?: string;
    scope?: string;
    date?: string;
    start?: string;
    end?: string;
  }): Observable<FinanceRecord[]> {
    const query = new URLSearchParams();
    if (filters.vehicleId) query.set('vehicleId', String(filters.vehicleId));
    if (filters.driverId) query.set('driverId', String(filters.driverId));
    if (filters.type) query.set('type', filters.type);
    if (filters.scope) query.set('scope', filters.scope);
    if (filters.date) query.set('date', this.toApiDate(filters.date));
    if (filters.start) query.set('start', this.toApiDate(filters.start));
    if (filters.end) query.set('end', this.toApiDate(filters.end));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance${suffix}`);
  }

  getVehicleFinanceRecords(vehicleId: number): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/vehicle/${vehicleId}`);
  }

  getVehicleFinanceRecordsByDay(vehicleId: number, date: string): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/vehicle/${vehicleId}/day/${this.toApiDate(date)}`);
  }

  getVehicleFinanceRecordsByRange(vehicleId: number, start: string, end: string): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/vehicle/${vehicleId}/range?start=${this.toApiDate(start)}&end=${this.toApiDate(end)}`);
  }

  getAllFinanceRecordsByDay(date: string): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/day/${this.toApiDate(date)}`);
  }

  getAllFinanceRecordsByRange(start: string, end: string): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/range?start=${this.toApiDate(start)}&end=${this.toApiDate(end)}`);
  }

  getTrips(filters?: {
    status?: string;
    driverId?: number | null;
    vehicleId?: number | null;
    date?: string;
  }): Observable<Trip[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.driverId) query.set('driverId', String(filters.driverId));
    if (filters?.vehicleId) query.set('vehicleId', String(filters.vehicleId));
    if (filters?.date) query.set('date', this.toApiDate(filters.date));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<Trip[]>(`${this.baseUrl}/trips${suffix}`);
  }

  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(`${this.baseUrl}/trips`, {
      ...trip,
      scheduledDate: this.toApiDate(trip.scheduledDate),
    });
  }

  updateTrip(id: number, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.baseUrl}/trips/${id}`, {
      ...trip,
      scheduledDate: this.toApiDate(trip.scheduledDate),
    });
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trips/${id}`);
  }

  getMaintenanceRecords(filters?: {
    vehicleId?: number | null;
    status?: string;
    date?: string;
  }): Observable<MaintenanceRecord[]> {
    const query = new URLSearchParams();
    if (filters?.vehicleId) query.set('vehicleId', String(filters.vehicleId));
    if (filters?.status) query.set('status', filters.status);
    if (filters?.date) query.set('date', this.toApiDate(filters.date));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<MaintenanceRecord[]>(`${this.baseUrl}/maintenance${suffix}`);
  }

  createMaintenanceRecord(record: MaintenanceRecord): Observable<MaintenanceRecord> {
    return this.http.post<MaintenanceRecord>(`${this.baseUrl}/maintenance`, {
      ...record,
      serviceDate: this.toApiDate(record.serviceDate),
    });
  }

  updateMaintenanceRecord(id: number, record: MaintenanceRecord): Observable<MaintenanceRecord> {
    return this.http.put<MaintenanceRecord>(`${this.baseUrl}/maintenance/${id}`, {
      ...record,
      serviceDate: this.toApiDate(record.serviceDate),
    });
  }

  deleteMaintenanceRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/maintenance/${id}`);
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getDispatchBoard(): Observable<DispatchBoard> {
    return this.http.get<DispatchBoard>(`${this.baseUrl}/dispatch/board`);
  }

  getAuditLogs(filters?: { entityType?: string; action?: string }): Observable<AuditLog[]> {
    const query = new URLSearchParams();
    if (filters?.entityType) query.set('entityType', filters.entityType);
    if (filters?.action) query.set('action', filters.action);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit${suffix}`);
  }

  getDocuments(filters?: {
    documentType?: string;
    entityType?: string;
    status?: string;
    expiryBefore?: string;
  }): Observable<DocumentRecord[]> {
    const query = new URLSearchParams();
    if (filters?.documentType) query.set('documentType', filters.documentType);
    if (filters?.entityType) query.set('entityType', filters.entityType);
    if (filters?.status) query.set('status', filters.status);
    if (filters?.expiryBefore) query.set('expiryBefore', this.toApiDate(filters.expiryBefore));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<DocumentRecord[]>(`${this.baseUrl}/documents${suffix}`);
  }

  updateDocument(id: number, document: DocumentRecord, file?: File | null): Observable<DocumentRecord> {
    return this.http.put<DocumentRecord>(`${this.baseUrl}/documents/${id}`, this.buildDocumentFormData(document, file));
  }

  createDocument(document: DocumentRecord, file?: File | null): Observable<DocumentRecord> {
    return this.http.post<DocumentRecord>(`${this.baseUrl}/documents`, this.buildDocumentFormData(document, file));
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/documents/${id}`);
  }

  getDocumentFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${id}/file`, { responseType: 'blob' });
  }

  getGlobalSearch(query: string, lang?: string): Observable<SearchResponse> {
    const params = new URLSearchParams();
    params.set('q', query);
    if (lang) {
      params.set('lang', lang);
    }
    return this.http.get<SearchResponse>(`${this.baseUrl}/search?${params.toString()}`);
  }

  toApiDate(value?: string | null): string {
    if (!value) {
      return '';
    }

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, month, day, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return trimmed;
  }

  formatDateForInput(value?: string | null): string {
    if (!value) {
      return '';
    }

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    return this.toApiDate(trimmed);
  }

  normalizeFinanceRecord(record: FinanceRecord): FinanceRecord {
    return {
      ...record,
      date: this.toApiDate(record.date),
      recordScope: record.recordScope || 'VEHICLE',
      category: record.category || (record.vehicle ? 'OPERATIONS' : 'OTHER'),
    };
  }

  normalizeTrip(trip: Trip): Trip {
    return {
      ...trip,
      scheduledDate: this.toApiDate(trip.scheduledDate),
    };
  }

  normalizeMaintenanceRecord(record: MaintenanceRecord): MaintenanceRecord {
    return {
      ...record,
      serviceDate: this.toApiDate(record.serviceDate),
    };
  }

  normalizeDocument(record: DocumentRecord): DocumentRecord {
    return {
      ...record,
      expiryDate: this.toApiDate(record.expiryDate),
    };
  }

  private buildDocumentFormData(document: DocumentRecord, file?: File | null): FormData {
    const formData = new FormData();
    const payload = {
      ...document,
      expiryDate: this.toApiDate(document.expiryDate),
    };
    formData.append('document', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file, file.name);
    }
    return formData;
  }
}
