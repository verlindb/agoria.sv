import { Employee } from '@/types';
import type { IEmployeeService } from './EmployeeService';

function getApiBase(): string { return import.meta.env?.VITE_API_BASE_URL || ''; }

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  if (!res.ok) { const text = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}: ${text}`); }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// Convert backend employee data to frontend format
function mapEmployeeFromApi(data: any): Employee {
  return {
    ...data,
    startDate: new Date(data.startDate),
  };
}

// Convert frontend employee data to backend format
function mapEmployeeToApi(employee: Omit<Employee, 'id'> | Partial<Employee>): any {
  return {
    ...employee,
    startDate: employee.startDate instanceof Date ? employee.startDate.toISOString() : employee.startDate,
  };
}

export class ApiEmployeeService implements IEmployeeService {
  async list(): Promise<Employee[]> { 
    const employees = await http<any[]>('/api/employees');
    return employees.map(mapEmployeeFromApi);
  }
  
  async search(query: string, technicalBusinessUnitId?: string): Promise<Employee[]> {
    const q = query.trim();
    if (!q) return this.list();
    
    try {
      const params = new URLSearchParams({ q });
      if (technicalBusinessUnitId) {
        params.append('technicalBusinessUnitId', technicalBusinessUnitId);
      }
      
      const employees = await http<any[]>(`/api/employees/search?${params.toString()}`);
      return employees.map(mapEmployeeFromApi);
    } catch (error) {
      console.error('Employee search failed:', error);
      // Fallback: client-side filter on list
      const employees = await this.list();
      const lq = q.toLowerCase();
      return employees.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(lq) ||
        e.email.toLowerCase().includes(lq) ||
        e.role.toLowerCase().includes(lq) ||
        (e.phone && e.phone.toLowerCase().includes(lq))
      ).filter(e => 
        !technicalBusinessUnitId || e.technicalBusinessUnitId === technicalBusinessUnitId
      );
    }
  }
  
  async create(emp: Omit<Employee, 'id'>): Promise<Employee> { 
    const apiData = mapEmployeeToApi(emp);
    const result = await http<any>('/api/employees', { method: 'POST', body: JSON.stringify(apiData) });
    return mapEmployeeFromApi(result);
  }
  
  async update(id: string, updates: Partial<Employee>): Promise<Employee> { 
    // For backend compatibility, we need to send the full object with the ID
    const apiData = { ...mapEmployeeToApi(updates), id };
    const result = await http<any>(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(apiData) });
    return mapEmployeeFromApi(result);
  }
  
  async remove(id: string): Promise<void> { 
    await http<void>(`/api/employees/${id}`, { method: 'DELETE' }); 
  }

  async bulkImport(employees: Omit<Employee, 'id'>[]): Promise<Employee[]> {
    const apiData = employees.map(mapEmployeeToApi);
    const result = await http<any[]>('/api/employees/import', { method: 'POST', body: JSON.stringify(apiData) });
    return result.map(mapEmployeeFromApi);
  }
}
