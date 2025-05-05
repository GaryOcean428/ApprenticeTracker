import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import * as XLSX from 'xlsx';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Maximum timeout for XLSX processing (5 seconds)
const XLSX_PROCESSING_TIMEOUT = 5000;

interface Invoice {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  timesheets?: string[];
}

interface TimesheetImport {
  employeeId: string;
  date: string;
  hours: number;
  rate: number;
}

export class InvoiceService extends BaseService {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    options: ServiceOptions = {}
  ) {
    super('InvoiceService', '1.0.0', options);
  }

  async getInvoices(params: {
    status?: Invoice['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<void> {
    return this.executeServiceMethod('getInvoices', async (): Promise<any> => {
      let query = this.supabase.from('invoices').select();

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.start_date) {
        query = query.gte('date', params.start_date);
      }

      if (params.end_date) {
        query = query.lte('date', params.end_date);
      }

      const { data, error } = await query;

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async getInvoice(id: string): Promise<void> {
    return this.executeServiceMethod('getInvoice', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('invoices')
        .select()
        .eq('id', id)
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'status'>): Promise<void> {
    return this.executeServiceMethod('createInvoice', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('invoices')
        .insert({
          ...invoice,
          status: 'draft',
        })
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    return this.executeServiceMethod('updateInvoice', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async importTimesheets(file: File): Promise<TimesheetImport[]> {
    return this.executeServiceMethod('importTimesheets', async () => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Check file type
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed');
      }

      return new Promise<TimesheetImport[]>((resolve, reject): void => {
        const reader = new FileReader();

        reader.onload = (e): void => {
          try {
            const data = e.target?.result;
            if (!data) {
              throw new Error('No data read from file');
            }

            // Add timeout protection
            const timeoutId = setTimeout(() => {
              reject(new Error('XLSX processing timeout exceeded'));
            }, XLSX_PROCESSING_TIMEOUT);

            try {
              const workbook = XLSX.read(data, { type: 'binary' });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              
              // Basic validation of worksheet structure
              if (!worksheet || !workbook.SheetNames.length) {
                throw new Error('Invalid Excel file structure');
              }

              const rawData = XLSX.utils.sheet_to_json(worksheet);

              // Clear the timeout since processing succeeded
              clearTimeout(timeoutId);

              if (!Array.isArray(rawData)) {
                throw new Error('Invalid timesheet data format');
              }

              // Limit the number of rows to prevent memory issues
              if (rawData.length > 1000) {
                throw new Error('Too many rows in the timesheet (maximum: 1000)');
              }

              const isValidTimesheetImport = (row: unknown): row is TimesheetImport => {
                if (typeof row !== 'object' || row === null) return false;
                
                const typedRow = row as Record<string, unknown>;
                
                return (
                  'employeeId' in typedRow && typeof typedRow.employeeId === 'string' &&
                  'date' in typedRow && typeof typedRow.date === 'string' &&
                  'hours' in typedRow && typeof typedRow.hours === 'number' && typedRow.hours > 0 &&
                  'rate' in typedRow && typeof typedRow.rate === 'number' && typedRow.rate >= 0
                );
              };

              const timesheets = rawData.filter(isValidTimesheetImport);
              
              // Ensure we have valid data
              if (timesheets.length === 0) {
                throw new Error('No valid timesheet entries found in the file');
              }

              resolve(timesheets);
            } catch (error) {
              clearTimeout(timeoutId);
              reject(error);
            }
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error): void => reject(error);
        
        // Add timeout for file reading
        const readTimeoutId = setTimeout(() => {
          reader.abort();
          reject(new Error('File reading timeout exceeded'));
        }, 10000); // 10 second timeout for file reading

        reader.onloadend = () => clearTimeout(readTimeoutId);
        
        reader.readAsBinaryString(file);
      });
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.executeServiceMethod('deleteInvoice', async (): Promise<any> => {
      const { error } = await this.supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return { success: true };
    });
  }

  async markAsPaid(id: string): Promise<void> {
    return this.updateInvoice(id, { status: 'paid' });
  }

  async markAsCancelled(id: string): Promise<void> {
    return this.updateInvoice(id, { status: 'cancelled' });
  }

  async getInvoicesByStatus(status: Invoice['status']): Promise<void> {
    return this.getInvoices({ status });
  }
}
