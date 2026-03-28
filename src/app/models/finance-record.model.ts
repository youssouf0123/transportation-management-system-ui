import { Vehicle } from './vehicle.model';

export interface FinanceRecord {
  id?: number;
  type: string; // EARNING or EXPENSE
  recordScope?: string;
  category?: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  inputLanguage?: string;
  amount: number;
  date: string; // YYYY-MM-DD format
  vehicle?: Vehicle | null;
}
