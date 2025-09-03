import { Employee, ORCategory } from '@/types';
import type { IWorksCouncilService } from './WorksCouncilService';

function getApiBase(): string { return import.meta.env?.VITE_API_BASE_URL || ''; }
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  if (!res.ok) { const text = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}: ${text}`); }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiWorksCouncilService implements IWorksCouncilService {
  async listMembers(technicalUnitId: string, category?: ORCategory): Promise<Employee[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return http<Employee[]>(`/api/works-council/${technicalUnitId}/members${q}`);
  }
  async addMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee> {
    return http<Employee>(`/api/works-council/${technicalUnitId}/members`, { 
      method: 'POST', 
      body: JSON.stringify({ employeeId, category }) 
    });
  }
  async removeMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee> {
    return http<Employee>(`/api/works-council/${technicalUnitId}/members`, { 
      method: 'DELETE', 
      body: JSON.stringify({ employeeId, category }) 
    });
  }
  async bulkAdd(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]> {
    return http<Employee[]>(`/api/works-council/${technicalUnitId}/members/bulk-add`, { 
      method: 'POST', 
      body: JSON.stringify({ employeeIds, category }) 
    });
  }
  async bulkRemove(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]> {
    return http<Employee[]>(`/api/works-council/${technicalUnitId}/members/bulk-remove`, { 
      method: 'POST', 
      body: JSON.stringify({ employeeIds, category }) 
    });
  }
  async reorder(technicalUnitId: string, category: ORCategory, orderedIds: string[]): Promise<Employee[]> {
    return http<Employee[]>(`/api/works-council/${technicalUnitId}/reorder`, { method: 'POST', body: JSON.stringify({ category, orderedIds }) });
  }
}
