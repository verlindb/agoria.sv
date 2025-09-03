import type { ICompanyService } from './CompanyService';
import { LocalStorageCompanyService } from './LocalStorageCompanyService';
import { ApiCompanyService } from './ApiCompanyService';

function isApiEnabled(): boolean {
  const flag = import.meta.env?.VITE_USE_API ?? 'false';
  return String(flag).toLowerCase() === 'true';
}

let instance: ICompanyService | null = null;

export function getCompanyService(): ICompanyService {
  if (!instance) {
    instance = isApiEnabled() ? new ApiCompanyService() : new LocalStorageCompanyService();
  }
  return instance;
}

export type { ICompanyService } from './CompanyService';
