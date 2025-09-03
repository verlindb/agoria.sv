import type { IEmployeeService } from './EmployeeService';
import { LocalStorageEmployeeService } from './LocalStorageEmployeeService';
import { ApiEmployeeService } from './ApiEmployeeService';

function isApiEnabled(): boolean { return String(import.meta.env?.VITE_USE_API ?? 'false').toLowerCase() === 'true'; }

let instance: IEmployeeService | null = null;
export function getEmployeeService(): IEmployeeService {
  if (!instance) instance = isApiEnabled() ? new ApiEmployeeService() : new LocalStorageEmployeeService();
  return instance;
}

export type { IEmployeeService } from './EmployeeService';
