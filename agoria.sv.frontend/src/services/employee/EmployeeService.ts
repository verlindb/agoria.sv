import { Employee } from '@/types';

export interface IEmployeeService {
  list(): Promise<Employee[]>;
  search(query: string, technicalBusinessUnitId?: string): Promise<Employee[]>;
  create(emp: Omit<Employee, 'id'>): Promise<Employee>;
  update(id: string, updates: Partial<Employee>): Promise<Employee>;
  remove(id: string): Promise<void>;
  bulkImport(employees: Omit<Employee, 'id'>[]): Promise<Employee[]>;
}
