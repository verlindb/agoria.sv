export interface Company {
  id: string;
  name: string;
  legalName: string;
  ondernemingsnummer: string;
  type: 'VZW' | 'NV' | 'BV' | 'CV' | 'Andere';
  address: Address;
  contactPerson: ContactPerson;
  numberOfEmployees: number;
  sector: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'pending';
}

export interface TechnicalBusinessUnit {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description: string;
  numberOfEmployees: number;
  manager: string;
  department: string;
  location: Address;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
  // New compliance fields
  language: 'N' | 'F' | 'N+F' | 'D'; // Vlaanderen=N, Wallonië=F, Brussel=N+F, Duitstalig gewest=D
  pcWorkers: string; // Paritair comité arbeiders (select value)
  pcClerks: string; // Paritair comité bedienden (select value)
  fodDossierBase: string; // First 5 digits only
  fodDossierSuffix: '1' | '2'; // Auto-added suffix "-1" or "-2"
  electionBodies: {
    cpbw: boolean; // Comité (CPBW)
    or: boolean; // Ondernemingsraad (OR)
    sdWorkers: boolean; // Syndicale delegatie arbeiders
    sdClerks: boolean; // Syndicale delegatie bedienden
  };
}

export type ORCategory = 'arbeiders' | 'bedienden' | 'kaderleden' | 'jeugdige';

export interface Employee {
  id: string;
  technicalBusinessUnitId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  startDate: Date;
  status: 'active' | 'inactive';
  // Ondernemingsraad (works council) membership by category with ordering
  orMembership?: Partial<Record<ORCategory, { member: boolean; order?: number }>>;
}

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface ContactPerson {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export type ViewMode = 'grid' | 'card';

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: any) => void;
  divider?: boolean;
  disabled?: boolean;
}

// DDD: WorksCouncil aggregate + association entity for OR membership
export interface WorksCouncil {
  id: string;
  technicalUnitId: string; // scope of this council
  createdAt: Date;
  updatedAt: Date;
}

export interface OrMembership {
  id: string;
  worksCouncilId: string;
  technicalUnitId: string; // denormalized for quick lookup
  employeeId: string;
  category: ORCategory;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
