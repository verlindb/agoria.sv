import { TechnicalBusinessUnit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import type { ITechnicalUnitService } from './TechnicalUnitService';

const STORAGE_KEY = 'technicalUnits';

type WithDateLike = Omit<TechnicalBusinessUnit, 'createdAt' | 'updatedAt'> & {
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
};

function reviveDates(unit: WithDateLike): TechnicalBusinessUnit {
  return {
    ...(unit as Omit<TechnicalBusinessUnit, 'createdAt' | 'updatedAt'>),
    createdAt: new Date(unit.createdAt),
    updatedAt: new Date(unit.updatedAt),
  };
}

export class LocalStorageTechnicalUnitService implements ITechnicalUnitService {
  private read(): TechnicalBusinessUnit[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw) as WithDateLike[];
      return data.map(reviveDates);
    } catch (e) {
      console.warn('Read technicalUnits failed:', e);
      return [];
    }
  }

  private write(units: TechnicalBusinessUnit[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
    } catch (e) {
      console.warn('Persist technicalUnits failed:', e);
    }
  }

  async list(): Promise<TechnicalBusinessUnit[]> { return this.read(); }

  async create(unit: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<TechnicalBusinessUnit> {
    const all = this.read();
    const newUnit: TechnicalBusinessUnit = { ...unit, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
    all.push(newUnit);
    this.write(all);
    return newUnit;
  }

  async update(id: string, updates: Partial<TechnicalBusinessUnit>): Promise<TechnicalBusinessUnit> {
    const all = this.read();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Technical unit not found');
    const updated: TechnicalBusinessUnit = { ...all[idx], ...updates, updatedAt: new Date() };
    all[idx] = updated;
    this.write(all);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const all = this.read();
    this.write(all.filter(u => u.id !== id));
  }

  async bulkImport(units: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TechnicalBusinessUnit[]> {
    const all = this.read();
    const toAdd = units.map(u => ({ ...u, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() }));
    const next = [...all, ...toAdd];
    this.write(next);
    return toAdd;
  }

  async search(query: string): Promise<TechnicalBusinessUnit[]> {
    const all = this.read();
    if (!query || query.trim() === '') return all;
    
    const searchTerm = query.toLowerCase();
    return all.filter(unit => 
      unit.name.toLowerCase().includes(searchTerm) ||
      unit.code.toLowerCase().includes(searchTerm) ||
      unit.description.toLowerCase().includes(searchTerm) ||
      unit.manager.toLowerCase().includes(searchTerm) ||
      unit.department.toLowerCase().includes(searchTerm) ||
      unit.status.toLowerCase().includes(searchTerm) ||
      unit.location.city.toLowerCase().includes(searchTerm) ||
      unit.location.street.toLowerCase().includes(searchTerm)
    );
  }
}
