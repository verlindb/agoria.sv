import type { ITechnicalUnitService } from './TechnicalUnitService';
import { LocalStorageTechnicalUnitService } from './LocalStorageTechnicalUnitService';
import { ApiTechnicalUnitService } from './ApiTechnicalUnitService';

function isApiEnabled(): boolean { return String(import.meta.env?.VITE_USE_API ?? 'false').toLowerCase() === 'true'; }

let instance: ITechnicalUnitService | null = null;
export function getTechnicalUnitService(): ITechnicalUnitService {
  if (!instance) {
    instance = isApiEnabled() ? new ApiTechnicalUnitService() : new LocalStorageTechnicalUnitService();
  }
  return instance;
}

export type { ITechnicalUnitService } from './TechnicalUnitService';
