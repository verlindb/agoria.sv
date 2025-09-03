import type { IWorksCouncilService } from './WorksCouncilService';
import { LocalStorageWorksCouncilService } from './LocalStorageWorksCouncilService';
import { ApiWorksCouncilService } from './ApiWorksCouncilService';

function isApiEnabled(): boolean { return String(import.meta.env?.VITE_USE_API ?? 'false').toLowerCase() === 'true'; }

let instance: IWorksCouncilService | null = null;
export function getWorksCouncilService(): IWorksCouncilService {
  if (!instance) instance = isApiEnabled() ? new ApiWorksCouncilService() : new LocalStorageWorksCouncilService();
  return instance;
}

export type { IWorksCouncilService } from './WorksCouncilService';
