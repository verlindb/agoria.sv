import { TechnicalBusinessUnit } from '@/types';
import type { ITechnicalUnitService } from './TechnicalUnitService';

function getApiBase(): string { return import.meta.env?.VITE_API_BASE_URL || ''; }

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiTechnicalUnitService implements ITechnicalUnitService {
  async list(): Promise<TechnicalBusinessUnit[]> {
    const items = await http<TechnicalBusinessUnit[]>('/api/technical-units');
    return items.map(u => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }));
  }
  async create(unit: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<TechnicalBusinessUnit> {
    const created = await http<TechnicalBusinessUnit>('/api/technical-units', { method: 'POST', body: JSON.stringify(unit) });
    return { ...created, createdAt: new Date(created.createdAt), updatedAt: new Date(created.updatedAt) };
  }
  async update(id: string, updates: Partial<TechnicalBusinessUnit>): Promise<TechnicalBusinessUnit> {
    const updated = await http<TechnicalBusinessUnit>(`/api/technical-units/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return { ...updated, createdAt: new Date(updated.createdAt), updatedAt: new Date(updated.updatedAt) };
  }
  async remove(id: string): Promise<void> {
    await http<void>(`/api/technical-units/${id}`, { method: 'DELETE' });
  }
  async bulkImport(units: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TechnicalBusinessUnit[]> {
    const created = await http<TechnicalBusinessUnit[]>('/api/technical-units/import', { method: 'POST', body: JSON.stringify(units) });
    return created.map(u => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }));
  }
  async search(query: string): Promise<TechnicalBusinessUnit[]> {
    const params = new URLSearchParams({ q: query });
    const items = await http<TechnicalBusinessUnit[]>(`/api/technical-units/search?${params}`);
    return items.map(u => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }));
  }
}
