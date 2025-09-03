import { Employee } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import type { IEmployeeService } from './EmployeeService';

const STORAGE_KEY = 'employees';

export class LocalStorageEmployeeService implements IEmployeeService {
  private read(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Employee[];
    } catch (e) {
      console.warn('Read employees failed:', e);
      return [];
    }
  }
  private write(items: Employee[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { console.warn('Persist employees failed:', e); }
  }
  async list(): Promise<Employee[]> { return this.read(); }
  
  async search(query: string, technicalBusinessUnitId?: string): Promise<Employee[]> {
    const employees = this.read();
    const q = query.trim().toLowerCase();
    
    if (!q) {
      return technicalBusinessUnitId 
        ? employees.filter(e => e.technicalBusinessUnitId === technicalBusinessUnitId)
        : employees;
    }
    
    return employees.filter(e => {
      const matchesSearch = 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        (e.phone && e.phone.toLowerCase().includes(q));
      
      const matchesUnit = !technicalBusinessUnitId || e.technicalBusinessUnitId === technicalBusinessUnitId;
      
      return matchesSearch && matchesUnit;
    });
  }
  
  async create(emp: Omit<Employee, 'id'>): Promise<Employee> {
    const all = this.read();
    const created: Employee = { ...emp, id: uuidv4() };
    all.push(created);
    this.write(all);
    return created;
  }
  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const all = this.read();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    const updated: Employee = { ...all[idx], ...updates };
    all[idx] = updated;
    this.write(all);
    return updated;
  }
  async remove(id: string): Promise<void> {
    const all = this.read();
    this.write(all.filter(e => e.id !== id));
  }
  
  async bulkImport(employees: Omit<Employee, 'id'>[]): Promise<Employee[]> {
    const all = this.read();
    const created = employees.map(emp => ({ ...emp, id: uuidv4() }));
    all.push(...created);
    this.write(all);
    return created;
  }
}
