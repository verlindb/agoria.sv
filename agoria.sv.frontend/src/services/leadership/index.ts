import type { ILeadershipService } from './LeadershipService';
import { LocalStorageLeadershipService } from './LocalStorageLeadershipService';
import { ApiLeadershipService } from './ApiLeadershipService';

function isApiEnabled(): boolean { return String(import.meta.env?.VITE_USE_API ?? 'false').toLowerCase() === 'true'; }

let instance: ILeadershipService | null = null;
export function getLeadershipService(): ILeadershipService {
  if (!instance) instance = isApiEnabled() ? new ApiLeadershipService() : new LocalStorageLeadershipService();
  return instance;
}

export type { ILeadershipService } from './LeadershipService';
