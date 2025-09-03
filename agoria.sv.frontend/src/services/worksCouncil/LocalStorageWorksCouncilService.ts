import { Employee, ORCategory, OrMembership, WorksCouncil } from '@/types';
import type { IWorksCouncilService } from './WorksCouncilService';

const EMP_STORAGE = 'employees';
const ORM_STORAGE = 'orMemberships';
const WC_STORAGE = 'worksCouncils';

function readEmployees(): Employee[] {
  try { const raw = localStorage.getItem(EMP_STORAGE); return raw ? (JSON.parse(raw) as Employee[]) : []; } catch { return []; }
}

function readOrMemberships(): OrMembership[] {
  try { const raw = localStorage.getItem(ORM_STORAGE); return raw ? (JSON.parse(raw) as OrMembership[]) : []; } catch { return []; }
}
function writeOrMemberships(items: OrMembership[]) {
  try { localStorage.setItem(ORM_STORAGE, JSON.stringify(items)); } catch (e) { console.warn('Persist orMemberships failed:', e); }
}
function readWorksCouncils(): WorksCouncil[] {
  try { const raw = localStorage.getItem(WC_STORAGE); return raw ? (JSON.parse(raw) as WorksCouncil[]) : []; } catch { return []; }
}
function writeWorksCouncils(items: WorksCouncil[]) {
  try { localStorage.setItem(WC_STORAGE, JSON.stringify(items)); } catch (e) { console.warn('Persist worksCouncils failed:', e); }
}

function compactOrders(memberships: OrMembership[], technicalUnitId: string, category: ORCategory) {
  const ms = memberships
    .filter(m => m.technicalUnitId === technicalUnitId && m.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  ms.forEach((m, idx) => { m.order = idx + 1; });
}

function ensureWorksCouncilForTU(technicalUnitId: string): WorksCouncil {
  const wcs = readWorksCouncils();
  let wc = wcs.find(x => x.technicalUnitId === technicalUnitId);
  if (!wc) {
    wc = { id: crypto.randomUUID(), technicalUnitId, createdAt: new Date(), updatedAt: new Date() } as WorksCouncil;
    wcs.push(wc); writeWorksCouncils(wcs);
  }
  return wc;
}

function enrichEmployeesWithOr(allEmployees: Employee[], memberships: OrMembership[]): Employee[] {
  const byEmp = new Map<string, OrMembership[]>(memberships.map(m => [m.employeeId, []] as any));
  memberships.forEach(m => { const arr = byEmp.get(m.employeeId) || []; arr.push(m); byEmp.set(m.employeeId, arr); });
  return allEmployees.map(e => {
    const ms = byEmp.get(e.id) || [];
    if (ms.length === 0) return e;
    const or: NonNullable<Employee['orMembership']> = {};
    ms.forEach(m => { or[m.category] = { member: true, order: m.order }; });
    return { ...e, orMembership: or };
  });
}

export class LocalStorageWorksCouncilService implements IWorksCouncilService {
  async listMembers(technicalUnitId: string, category?: ORCategory): Promise<Employee[]> {
    const all = readEmployees();
    const memberships = readOrMemberships();
    const filteredEmployees = all.filter(e => e.technicalBusinessUnitId === technicalUnitId);
    const filteredMemberships = memberships.filter(m => m.technicalUnitId === technicalUnitId && (!category || m.category === category));
    const enriched = enrichEmployeesWithOr(filteredEmployees, filteredMemberships);
    return enriched.filter(e => {
      if (!category) return Object.values(e.orMembership || {}).some(x => x?.member);
      return Boolean(e.orMembership?.[category]?.member);
    });
  }

  async addMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee> {
    const all = readEmployees();
    const idx = all.findIndex(e => e.id === employeeId);
    if (idx === -1) throw new Error('Employee not found');
    const emp = all[idx];
    // Use the provided technicalUnitId for consistency, but validate it matches the employee
    if (emp.technicalBusinessUnitId !== technicalUnitId) {
      throw new Error('Employee technicalUnitId does not match provided technicalUnitId');
    }
    const memberships = readOrMemberships();
    const wc = ensureWorksCouncilForTU(technicalUnitId);
    const peers = memberships.filter(m => m.technicalUnitId === technicalUnitId && m.category === category);
    const maxOrder = peers.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const existing = memberships.find(m => m.employeeId === employeeId && m.category === category);
    if (existing) {
      existing.order = existing.order || maxOrder || 1;
    } else {
      memberships.push({ id: crypto.randomUUID(), worksCouncilId: wc.id, technicalUnitId, employeeId, category, order: maxOrder + 1, createdAt: new Date(), updatedAt: new Date() });
    }
    writeOrMemberships(memberships);
    const enriched = enrichEmployeesWithOr([emp], memberships.filter(m => m.technicalUnitId === technicalUnitId));
    return enriched[0];
  }

  async removeMember(employeeId: string, category: ORCategory, technicalUnitId: string): Promise<Employee> {
    const all = readEmployees();
    const idx = all.findIndex(e => e.id === employeeId);
    if (idx === -1) throw new Error('Employee not found');
    const emp = all[idx];
    // Use the provided technicalUnitId for consistency, but validate it matches the employee
    if (emp.technicalBusinessUnitId !== technicalUnitId) {
      throw new Error('Employee technicalUnitId does not match provided technicalUnitId');
    }
    let memberships = readOrMemberships();
    memberships = memberships.filter(m => !(m.employeeId === employeeId && m.category === category));
    compactOrders(memberships, technicalUnitId, category);
    writeOrMemberships(memberships);
    const enriched = enrichEmployeesWithOr([emp], memberships.filter(m => m.technicalUnitId === technicalUnitId));
    return enriched[0];
  }

  async bulkAdd(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]> {
    const all = readEmployees();
    const idSet = new Set(employeeIds);
    const first = all.find(e => idSet.has(e.id));
    if (!first) return [];
    // Use the provided technicalUnitId for consistency
    const wc = ensureWorksCouncilForTU(technicalUnitId);
    const memberships = readOrMemberships();
    let orderBase = memberships
      .filter(m => m.technicalUnitId === technicalUnitId && m.category === category)
      .reduce((max, m) => Math.max(max, m.order || 0), 0);
    for (const emp of all) {
      if (!idSet.has(emp.id)) continue;
      const existing = memberships.find(m => m.employeeId === emp.id && m.category === category);
      if (existing) continue;
      orderBase += 1;
      memberships.push({ id: crypto.randomUUID(), worksCouncilId: wc.id, technicalUnitId, employeeId: emp.id, category, order: orderBase, createdAt: new Date(), updatedAt: new Date() });
    }
    writeOrMemberships(memberships);
    const affected = all.filter(e => idSet.has(e.id));
    const tuMemberships = memberships.filter(m => m.technicalUnitId === technicalUnitId);
    return enrichEmployeesWithOr(affected, tuMemberships);
  }

  async bulkRemove(employeeIds: string[], category: ORCategory, technicalUnitId: string): Promise<Employee[]> {
    const all = readEmployees();
    const idSet = new Set(employeeIds);
    let memberships = readOrMemberships();
    // Filter to only remove memberships for the specified technical unit and category
    memberships = memberships.filter(m => !(idSet.has(m.employeeId) && m.category === category && m.technicalUnitId === technicalUnitId));
    compactOrders(memberships, technicalUnitId, category);
    writeOrMemberships(memberships);
    const affected = all.filter(e => idSet.has(e.id));
    const enriched = affected.map(e => enrichEmployeesWithOr([e], memberships.filter(m => m.technicalUnitId === e.technicalBusinessUnitId))[0]);
    return enriched;
  }

  async reorder(technicalUnitId: string, category: ORCategory, orderedIds: string[]): Promise<Employee[]> {
    const all = readEmployees();
    const idToOrder = new Map<string, number>(); orderedIds.forEach((id, idx) => idToOrder.set(id, idx + 1));
    const memberships = readOrMemberships();
    for (let i = 0; i < memberships.length; i++) {
      const m = memberships[i];
      if (m.technicalUnitId !== technicalUnitId || m.category !== category) continue;
      if (!idToOrder.has(m.employeeId)) continue;
      m.order = idToOrder.get(m.employeeId)!;
    }
    writeOrMemberships(memberships);
    const tuMemberships = memberships.filter(m => m.technicalUnitId === technicalUnitId);
    const affected = all.filter(e => e.technicalBusinessUnitId === technicalUnitId && idToOrder.has(e.id));
    return enrichEmployeesWithOr(affected, tuMemberships);
  }
}
