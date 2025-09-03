import { TechnicalBusinessUnit } from '@/types';

export interface ITechnicalUnitService {
  list(): Promise<TechnicalBusinessUnit[]>;
  create(unit: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<TechnicalBusinessUnit>;
  update(id: string, updates: Partial<TechnicalBusinessUnit>): Promise<TechnicalBusinessUnit>;
  remove(id: string): Promise<void>;
  bulkImport(units: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TechnicalBusinessUnit[]>;
  search(query: string): Promise<TechnicalBusinessUnit[]>;
}
