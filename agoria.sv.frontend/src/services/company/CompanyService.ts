import { Company } from '@/types';

export interface ICompanyService {
  list(): Promise<Company[]>;
  search(query: string): Promise<Company[]>;
  create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
  update(id: string, updates: Partial<Company>): Promise<Company>;
  remove(id: string): Promise<void>;
  bulkImport(companies: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Company[]>;
}
