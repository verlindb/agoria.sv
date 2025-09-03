import { Company } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import type { ICompanyService } from './CompanyService';

const STORAGE_KEY = 'companies';

type WithDateLike = Omit<Company, 'createdAt' | 'updatedAt'> & {
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
};

function reviveDates(company: WithDateLike): Company {
  return {
    ...(company as Omit<Company, 'createdAt' | 'updatedAt'>),
    createdAt: new Date(company.createdAt),
    updatedAt: new Date(company.updatedAt),
  };
}

export class LocalStorageCompanyService implements ICompanyService {
  private read(): Company[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
  const data = JSON.parse(raw) as WithDateLike[];
  return data.map(reviveDates);
    } catch {
      return [];
    }
  }

  private write(companies: Company[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    } catch (e) {
      console.warn('Persist companies failed:', e);
    }
  }

  async list(): Promise<Company[]> {
    return this.read();
  }

  async search(query: string): Promise<Company[]> {
    const all = this.read();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.legalName.toLowerCase().includes(q) ||
      c.ondernemingsnummer.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.address.city.toLowerCase().includes(q) ||
      c.address.country.toLowerCase().includes(q) ||
      c.contactPerson.firstName.toLowerCase().includes(q) ||
      c.contactPerson.lastName.toLowerCase().includes(q) ||
      c.contactPerson.email.toLowerCase().includes(q)
    );
  }

  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const all = this.read();
    const newCompany: Company = {
      ...company,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    all.push(newCompany);
    this.write(all);
    return newCompany;
  }

  async update(id: string, updates: Partial<Company>): Promise<Company> {
    const all = this.read();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    const updated: Company = { ...all[idx], ...updates, updatedAt: new Date() };
    all[idx] = updated;
    this.write(all);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const all = this.read();
    const filtered = all.filter(c => c.id !== id);
    this.write(filtered);
  }

  async bulkImport(companies: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Company[]> {
    const all = this.read();
    const toAdd = companies.map(c => ({
      ...c,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const next = [...all, ...toAdd];
    this.write(next);
    return toAdd;
  }
}
