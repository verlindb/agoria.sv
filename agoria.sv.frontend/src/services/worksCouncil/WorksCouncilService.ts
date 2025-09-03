import { Employee, ORCategory } from '@/types';

export interface IWorksCouncilService {
  listMembers(technicalUnitId: string, category?: ORCategory): Promise<Employee[]>;
  addMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee>;
  removeMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee>;
  bulkAdd(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]>;
  bulkRemove(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]>;
  reorder(technicalUnitId: string, category: ORCategory, orderedIds: string[]): Promise<Employee[]>;
}
