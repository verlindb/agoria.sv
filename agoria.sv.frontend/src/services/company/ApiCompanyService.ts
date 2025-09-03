import { Company } from '@/types';
import type { ICompanyService } from './CompanyService';

function getApiBase(): string {
  // Vite exposes env vars via import.meta.env; fallback to empty string for relative paths
  return import.meta.env?.VITE_API_BASE_URL || '';
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiCompanyService implements ICompanyService {
  async list(): Promise<Company[]> {
    const items = await http<Company[]>('/api/companies');
    // Ensure Date objects
    return items.map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }));
  }
  async search(query: string): Promise<Company[]> {
    const q = query.trim();
    if (!q) return this.list();
    try {
      const items = await http<Company[]>(`/api/companies/search?q=${encodeURIComponent(q)}`);
      return items.map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }));
    } catch {
      // Fallback: client-side filter on list
      const items = await this.list();
      const lq = q.toLowerCase();
      return items.filter(c =>
        c.name.toLowerCase().includes(lq) ||
        c.legalName.toLowerCase().includes(lq) ||
        c.ondernemingsnummer.toLowerCase().includes(lq) ||
        c.type.toLowerCase().includes(lq) ||
        c.sector.toLowerCase().includes(lq) ||
        c.address.city.toLowerCase().includes(lq) ||
        c.address.country.toLowerCase().includes(lq) ||
        c.contactPerson.firstName.toLowerCase().includes(lq) ||
        c.contactPerson.lastName.toLowerCase().includes(lq) ||
        c.contactPerson.email.toLowerCase().includes(lq)
      );
    }
  }
  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    // Transform Company object to CreateCompanyCommand format with Pascal case
    const command = {
      Name: company.name,
      LegalName: company.legalName,
      Ondernemingsnummer: company.ondernemingsnummer,
      Type: company.type,
      Sector: company.sector,
      NumberOfEmployees: company.numberOfEmployees,
      Address: {
        Street: company.address.street,
        Number: company.address.number,
        PostalCode: company.address.postalCode,
        City: company.address.city,
        Country: company.address.country
      },
      ContactPerson: {
        FirstName: company.contactPerson.firstName,
        LastName: company.contactPerson.lastName,
        Email: company.contactPerson.email,
        Phone: company.contactPerson.phone,
        Function: company.contactPerson.role || null
      }
    };
    
    const created = await http<Company>('/api/companies', { method: 'POST', body: JSON.stringify(command) });
    return { ...created, createdAt: new Date(created.createdAt), updatedAt: new Date(created.updatedAt) };
  }
  async update(id: string, updates: Partial<Company>): Promise<Company> {
    // Transform updates to UpdateCompanyCommand format with Pascal case
    const command: any = { Id: id };
    
    if (updates.name !== undefined) command.Name = updates.name;
    if (updates.legalName !== undefined) command.LegalName = updates.legalName;
    if (updates.ondernemingsnummer !== undefined) command.Ondernemingsnummer = updates.ondernemingsnummer;
    if (updates.type !== undefined) command.Type = updates.type;
    if (updates.sector !== undefined) command.Sector = updates.sector;
    if (updates.numberOfEmployees !== undefined) command.NumberOfEmployees = updates.numberOfEmployees;
    
    if (updates.address !== undefined) {
      command.Address = {
        Street: updates.address.street,
        Number: updates.address.number,
        PostalCode: updates.address.postalCode,
        City: updates.address.city,
        Country: updates.address.country
      };
    }
    
    if (updates.contactPerson !== undefined) {
      command.ContactPerson = {
        FirstName: updates.contactPerson.firstName,
        LastName: updates.contactPerson.lastName,
        Email: updates.contactPerson.email,
        Phone: updates.contactPerson.phone,
        Function: updates.contactPerson.role || null
      };
    }
    
    const updated = await http<Company>(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(command) });
    return { ...updated, createdAt: new Date(updated.createdAt), updatedAt: new Date(updated.updatedAt) };
  }
  async remove(id: string): Promise<void> {
    await http<void>(`/api/companies/${id}`, { method: 'DELETE' });
  }
  async bulkImport(companies: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Company[]> {
    // Transform Company objects to CreateCompanyCommand format with Pascal case
    const commands = companies.map(company => ({
      Name: company.name,
      LegalName: company.legalName,
      Ondernemingsnummer: company.ondernemingsnummer,
      Type: company.type,
      Sector: company.sector,
      NumberOfEmployees: company.numberOfEmployees,
      Address: {
        Street: company.address.street,
        Number: company.address.number,
        PostalCode: company.address.postalCode,
        City: company.address.city,
        Country: company.address.country
      },
      ContactPerson: {
        FirstName: company.contactPerson.firstName,
        LastName: company.contactPerson.lastName,
        Email: company.contactPerson.email,
        Phone: company.contactPerson.phone,
        Function: company.contactPerson.role || null
      }
    }));
    
    // Debug: Log the JSON being sent
    console.log('Bulk import JSON:', JSON.stringify(commands, null, 2));
    console.log('Is array:', Array.isArray(commands));
    console.log('Array length:', commands.length);
    
    const created = await http<Company[]>('/api/companies/import', { method: 'POST', body: JSON.stringify(commands) });
    return created.map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }));
  }
}
