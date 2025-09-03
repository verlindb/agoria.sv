import { TechnicalBusinessUnit } from '@/types';
import type { ILeadershipService } from './LeadershipService';

const TU_STORAGE = 'technicalUnits';

function readTU(): TechnicalBusinessUnit[] {
  try { const raw = localStorage.getItem(TU_STORAGE); return raw ? (JSON.parse(raw) as TechnicalBusinessUnit[]) : []; } catch { return []; }
}
function writeTU(items: TechnicalBusinessUnit[]) { try { localStorage.setItem(TU_STORAGE, JSON.stringify(items)); } catch (e) { console.warn('Persist technicalUnits failed:', e); } }

export class LocalStorageLeadershipService implements ILeadershipService {
  async setManager(technicalUnitId: string, employeeId: string): Promise<void> {
    const all = readTU();
    const idx = all.findIndex(u => u.id === technicalUnitId);
    if (idx === -1) throw new Error('Technical unit not found');
    all[idx] = { ...all[idx], manager: employeeId } as TechnicalBusinessUnit;
    writeTU(all);
  }
  async clearManager(technicalUnitId: string): Promise<void> {
    const all = readTU();
    const idx = all.findIndex(u => u.id === technicalUnitId);
    if (idx === -1) return;
    all[idx] = { ...all[idx], manager: '' } as TechnicalBusinessUnit;
    writeTU(all);
  }
}
