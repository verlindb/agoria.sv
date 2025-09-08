import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Company, ViewMode, TechnicalBusinessUnit, Employee, ORCategory } from '../types';
import { getCompanyService } from '@/services/company';
import { getTechnicalUnitService } from '@/services/technicalUnit';
import { getEmployeeService } from '@/services/employee';
import { getWorksCouncilService } from '@/services/worksCouncil';
import { getLeadershipService } from '@/services/leadership';

interface AppContextType {
  companies: Company[];
  technicalUnits: TechnicalBusinessUnit[];
  employees: Employee[];
  viewMode: ViewMode;
  searchQuery: string;
  selectedCompany: Company | null;
  isDrawerOpen: boolean;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsDrawerOpen: (open: boolean) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => void;
  importCompanies: (companies: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  searchCompanies: (query: string) => Promise<Company[]>;
  addTechnicalUnit: (unit: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTechnicalUnit: (id: string, unit: Partial<TechnicalBusinessUnit>) => void;
  deleteTechnicalUnit: (id: string) => void;
  importTechnicalUnits: (units: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  searchTechnicalUnits: (query: string) => Promise<TechnicalBusinessUnit[]>;
  getTechnicalUnitsByCompany: (companyId: string) => TechnicalBusinessUnit[];
  // Leadership
  setManagerForUnit: (technicalUnitId: string, employeeId: string) => void;
  clearManagerForUnit: (technicalUnitId: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  importEmployees: (employees: Omit<Employee, 'id'>[]) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeesByTechnicalUnit: (technicalUnitId: string) => Employee[];
  searchEmployees: (query: string, technicalBusinessUnitId?: string) => Promise<Employee[]>;
  // Ondernemingsraad helpers
  addToOndernemingsraad: (employeeId: string, category: ORCategory, technicalUnitId: string) => void;
  removeFromOndernemingsraad: (employeeId: string, category: ORCategory, technicalUnitId: string) => void;
  reorderOndernemingsraad: (technicalUnitId: string, category: ORCategory, orderedIds: string[]) => void;
  bulkAddToOndernemingsraad: (employeeIds: string[], category: ORCategory, technicalUnitId: string) => void;
  bulkRemoveFromOndernemingsraad: (employeeIds: string[], category: ORCategory, technicalUnitId: string) => void;
  // Grid display preferences
  gridDensity: 'compact'|'standard'|'comfortable';
  setGridDensity: (d: 'compact'|'standard'|'comfortable') => void;
  gridCardView: boolean;
  setGridCardView: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technicalUnits, setTechnicalUnits] = useState<TechnicalBusinessUnit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridDensity, setGridDensity] = useState<'compact'|'standard'|'comfortable'>(() => {
    try {
      const stored = localStorage.getItem('gridDensity') as 'compact'|'standard'|'comfortable'|null;
      return stored ?? 'compact';
    } catch {
      return 'compact';
    }
  });
  const [gridCardView, setGridCardView] = useState<boolean>(() => {
    try { return localStorage.getItem('gridCardView') === 'true'; } catch { return false; }
  });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Initialize services once
  const companyService = useMemo(() => getCompanyService(), []);
  const technicalUnitService = useMemo(() => getTechnicalUnitService(), []);
  const employeeService = useMemo(() => getEmployeeService(), []);
  const worksCouncilService = useMemo(() => getWorksCouncilService(), []);
  const leadershipService = useMemo(() => getLeadershipService(), []);

  // Load companies on startup
  useEffect(() => {
    let mounted = true;
    companyService
      .list()
      .then((data) => {
        if (mounted) setCompanies(data);
      })
      .catch((err) => {
        console.error('Failed to load companies:', err);
      });
    return () => {
      mounted = false;
    };
  }, [companyService]);

  // Load technical units on startup
  useEffect(() => {
    let mounted = true;
    technicalUnitService
      .list()
      .then((data) => { if (mounted) setTechnicalUnits(data); })
      .catch((err) => { console.error('Failed to load technical units:', err); });
    return () => { mounted = false; };
  }, [technicalUnitService]);

  // Load employees on startup
  useEffect(() => {
    let mounted = true;
    employeeService
      .list()
      .then((data) => { if (mounted) setEmployees(data); })
      .catch((err) => { console.error('Failed to load employees:', err); });
    return () => { mounted = false; };
  }, [employeeService]);

  // Enrich employees with OR memberships after employees and units are loaded (LocalStorage implementation derives memberships)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (employees.length === 0 || technicalUnits.length === 0) return;
        // For each TU, load all members (all categories) and merge their orMembership into employees state
        const byId = new Map(employees.map(e => [e.id, { ...e }] as const));
        for (const tu of technicalUnits) {
          const members = await worksCouncilService.listMembers(tu.id);
          for (const m of members) {
            const existing = byId.get(m.id);
            if (!existing) continue;
            byId.set(m.id, { ...existing, orMembership: m.orMembership });
          }
        }
        if (!mounted) return;
        setEmployees(Array.from(byId.values()));
      } catch (e) {
        // non-fatal; UI can still function
        console.warn('Enrich OR memberships failed:', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [employees.length, technicalUnits.length, worksCouncilService]);

  const addCompany = useCallback((company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    return companyService
      .create(company)
      .then((created) => setCompanies((prev) => [...prev, created]))
      .catch((err) => {
        console.error('Failed to create company:', err);
        throw err;
      });
  }, [companyService]);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    return companyService
      .update(id, updates)
      .then((updated) =>
        setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)))
      )
      .catch((err) => {
        console.error('Failed to update company:', err);
        // Show user-friendly error message
        const errorMessage = err.message.includes('Status must be') 
          ? 'Status moet "actief", "inactief" of "in afwachting" zijn'
          : 'Er is een fout opgetreden bij het bijwerken van het bedrijf';
        
        // You can implement a toast notification or error dialog here
        alert(errorMessage);
        throw err; // Re-throw to handle in UI if needed
      });
  }, [companyService]);

  const deleteCompany = useCallback((id: string) => {
    companyService
      .remove(id)
      .then(() => {
        setCompanies((prev) => prev.filter((company) => company.id !== id));
        // Also delete associated technical units locally
        setTechnicalUnits((prev) => prev.filter((unit) => unit.companyId !== id));
      })
      .catch((err) => console.error('Failed to delete company:', err));
  }, [companyService]);

  const importCompanies = useCallback((importedCompanies: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    companyService
      .bulkImport(importedCompanies)
      .then((created) => setCompanies((prev) => [...prev, ...created]))
      .catch((err) => console.error('Failed to import companies:', err));
  }, [companyService]);

  const searchCompanies = useCallback((query: string) => {
    return companyService.search(query);
  }, [companyService]);

  const addTechnicalUnit = useCallback((unit: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>) => {
    technicalUnitService
      .create(unit)
      .then((created) => setTechnicalUnits((prev) => [...prev, created]))
      .catch((err) => console.error('Failed to create technical unit:', err));
  }, [technicalUnitService]);

  const updateTechnicalUnit = useCallback((id: string, updates: Partial<TechnicalBusinessUnit>) => {
    // Route manager changes through the leadership service; other fields via technicalUnitService
    const { manager, ...rest } = updates;
    const ops: Array<Promise<any>> = [];
    if (typeof manager !== 'undefined') {
      if (manager) ops.push(leadershipService.setManager(id, manager));
      else ops.push(leadershipService.clearManager(id));
    }
    if (Object.keys(rest).length > 0) {
      ops.push(
        technicalUnitService
          .update(id, rest)
          .then((updated) => {
            setTechnicalUnits((prev) => prev.map((u) => (u.id === id ? { ...updated, manager: typeof manager !== 'undefined' ? (manager || '') : updated.manager } : u)));
          })
      );
    }
    if (ops.length === 0) return;
    Promise.all(ops)
      .then(() => {
        if (Object.keys(rest).length === 0) {
          // Only manager changed; update local state accordingly
          setTechnicalUnits((prev) => prev.map((u) => (u.id === id ? { ...u, manager: manager || '' } as TechnicalBusinessUnit : u)));
        }
      })
      .catch((err) => console.error('Failed to update technical unit:', err));
  }, [technicalUnitService, leadershipService]);

  const setManagerForUnit = useCallback((technicalUnitId: string, employeeId: string) => {
    leadershipService
      .setManager(technicalUnitId, employeeId)
      .then(() => setTechnicalUnits((prev) => prev.map(u => u.id === technicalUnitId ? { ...u, manager: employeeId } : u)))
      .catch((err) => console.error('Failed to set manager:', err));
  }, [leadershipService]);

  const clearManagerForUnit = useCallback((technicalUnitId: string) => {
    leadershipService
      .clearManager(technicalUnitId)
      .then(() => setTechnicalUnits((prev) => prev.map(u => u.id === technicalUnitId ? { ...u, manager: '' } : u)))
      .catch((err) => console.error('Failed to clear manager:', err));
  }, [leadershipService]);

  const deleteTechnicalUnit = useCallback((id: string) => {
    technicalUnitService
      .remove(id)
      .then(() => setTechnicalUnits((prev) => prev.filter((u) => u.id !== id)))
      .catch((err) => console.error('Failed to delete technical unit:', err));
  }, [technicalUnitService]);

  const importTechnicalUnits = useCallback((importedUnits: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    technicalUnitService
      .bulkImport(importedUnits)
      .then((created) => setTechnicalUnits((prev) => [...prev, ...created]))
      .catch((err) => console.error('Failed to import technical units:', err));
  }, [technicalUnitService]);

  const searchTechnicalUnits = useCallback((query: string) => {
    return technicalUnitService.search(query);
  }, [technicalUnitService]);

  const getTechnicalUnitsByCompany = useCallback((companyId: string) => {
    return technicalUnits.filter(unit => unit.companyId === companyId);
  }, [technicalUnits]);

  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    employeeService
      .create(emp)
      .then((created) => setEmployees((prev) => [...prev, created]))
      .catch((err) => console.error('Failed to create employee:', err));
  }, [employeeService]);

  const importEmployees = useCallback((importedEmployees: Omit<Employee, 'id'>[]) => {
    employeeService
      .bulkImport(importedEmployees)
      .then((created) => setEmployees((prev) => [...prev, ...created]))
      .catch((err) => console.error('Failed to import employees:', err));
  }, [employeeService]);

  const searchEmployees = useCallback((query: string, technicalBusinessUnitId?: string) => {
    return employeeService.search(query, technicalBusinessUnitId);
  }, [employeeService]);

  const handleSetGridDensity = useCallback((d: 'compact'|'standard'|'comfortable') => {
    setGridDensity(d);
    try { localStorage.setItem('gridDensity', d); } catch (e) {
      console.warn('Persist gridDensity failed:', e);
    }
  }, []);

  const handleSetGridCardView = useCallback((v: boolean) => {
    setGridCardView(v);
    try { localStorage.setItem('gridCardView', v ? 'true' : 'false'); } catch (e) {
      console.warn('Persist gridCardView failed:', e);
    }
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    employeeService
      .update(id, updates)
      .then((updated) => setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e))))
      .catch((err) => console.error('Failed to update employee:', err));
  }, [employeeService]);

  const deleteEmployee = useCallback((id: string) => {
    employeeService
      .remove(id)
      .then(() => setEmployees((prev) => prev.filter((e) => e.id !== id)))
      .catch((err) => console.error('Failed to delete employee:', err));
  }, [employeeService]);

  const getEmployeesByTechnicalUnit = useCallback((technicalUnitId: string) => {
    return employees.filter(e => e.technicalBusinessUnitId === technicalUnitId);
  }, [employees]);

  // Ondernemingsraad operations
  const addToOndernemingsraad = useCallback((employeeId: string, category: ORCategory, technicalUnitId: string) => {
    worksCouncilService
      .addMember(employeeId, category, technicalUnitId)
      .then((updatedEmp) => setEmployees((prev) => prev.map(e => (e.id === updatedEmp.id ? updatedEmp : e))))
      .catch((err) => console.error('Failed to add member to OR:', err));
  }, [worksCouncilService]);

  const bulkAddToOndernemingsraad = useCallback((employeeIds: string[], category: ORCategory, technicalUnitId: string) => {
    worksCouncilService
      .bulkAdd(employeeIds, category, technicalUnitId)
      .then((updated) => setEmployees((prev) => prev.map(e => updated.find(u => u.id === e.id) || e)))
      .catch((err) => console.error('Failed bulk add to OR:', err));
  }, [worksCouncilService]);

  const removeFromOndernemingsraad = useCallback((employeeId: string, category: ORCategory, technicalUnitId: string) => {
    worksCouncilService
      .removeMember(employeeId, category, technicalUnitId)
      .then((updatedEmp) => setEmployees((prev) => prev.map(e => (e.id === updatedEmp.id ? updatedEmp : e))))
      .catch((err) => console.error('Failed to remove member from OR:', err));
  }, [worksCouncilService]);

  const bulkRemoveFromOndernemingsraad = useCallback((employeeIds: string[], category: ORCategory, technicalUnitId: string) => {
    worksCouncilService
      .bulkRemove(employeeIds, category, technicalUnitId)
      .then((updated) => setEmployees((prev) => prev.map(e => updated.find(u => u.id === e.id) || e)))
      .catch((err) => console.error('Failed bulk remove from OR:', err));
  }, [worksCouncilService]);

  const reorderOndernemingsraad = useCallback((technicalUnitId: string, category: ORCategory, orderedIds: string[]) => {
    worksCouncilService
      .reorder(technicalUnitId, category, orderedIds)
      .then((updated) => setEmployees((prev) => prev.map(e => updated.find(u => u.id === e.id) || e)))
      .catch((err) => console.error('Failed to reorder OR:', err));
  }, [worksCouncilService]);

  return (
    <AppContext.Provider
      value={{
        companies,
        technicalUnits,
  employees,
        viewMode,
        searchQuery,
        selectedCompany,
        isDrawerOpen,
        setViewMode,
        setSearchQuery,
        setSelectedCompany,
        setIsDrawerOpen,
        addCompany,
        updateCompany,
        deleteCompany,
        importCompanies,
  searchCompanies,
        addTechnicalUnit,
        updateTechnicalUnit,
        deleteTechnicalUnit,
        importTechnicalUnits,
        searchTechnicalUnits,
        getTechnicalUnitsByCompany,
  setManagerForUnit,
  clearManagerForUnit,
  addEmployee,
  importEmployees,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  addToOndernemingsraad,
  removeFromOndernemingsraad,
  reorderOndernemingsraad,
  bulkAddToOndernemingsraad,
  bulkRemoveFromOndernemingsraad,
  getEmployeesByTechnicalUnit,
  gridDensity,
  setGridDensity: handleSetGridDensity,
  gridCardView,
  setGridCardView: handleSetGridCardView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
