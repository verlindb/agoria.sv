import type { ILeadershipService } from './LeadershipService';

function getApiBase(): string { return import.meta.env?.VITE_API_BASE_URL || ''; }
async function http(path: string, init?: RequestInit): Promise<void> {
  const res = await fetch(`${getApiBase()}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  if (!res.ok) { const text = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}: ${text}`); }
}

export class ApiLeadershipService implements ILeadershipService {
  async setManager(technicalUnitId: string, employeeId: string): Promise<void> {
    await http(`/api/technical-units/${technicalUnitId}/manager`, { method: 'PUT', body: JSON.stringify({ employeeId }) });
  }
  async clearManager(technicalUnitId: string): Promise<void> {
    await http(`/api/technical-units/${technicalUnitId}/manager`, { method: 'DELETE' });
  }
}
