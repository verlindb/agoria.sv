import * as XLSX from 'xlsx';
import { Company, TechnicalBusinessUnit, Employee, ORCategory } from '../types';

export const parseCompaniesFromExcel = (file: File): Promise<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const companies = jsonData.map((row: any) => ({
          name: row['Naam'] || row['Name'] || '',
          legalName: row['Juridische Naam'] || row['Legal Name'] || '',
          ondernemingsnummer: row['Ondernemingsnummer'] || row['VAT'] || '',
          type: row['Type'] || 'BV',
          numberOfEmployees: parseInt(row['Werknemers'] || row['Employees'] || '0'),
          sector: row['Sector'] || '',
          status: row['Status'] || 'pending',
          address: {
            street: row['Straat'] || row['Street'] || '',
            number: row['Nummer'] || row['Number'] || '',
            postalCode: row['Postcode'] || row['Postal Code'] || '',
            city: row['Stad'] || row['City'] || '',
            country: row['Land'] || row['Country'] || 'België',
          },
          contactPerson: {
            firstName: row['Contact Voornaam'] || row['Contact First Name'] || '',
            lastName: row['Contact Achternaam'] || row['Contact Last Name'] || '',
            email: row['Contact Email'] || '',
            phone: row['Contact Telefoon'] || row['Contact Phone'] || '',
            role: row['Contact Functie'] || row['Contact Role'] || '',
          },
        }));
        
        resolve(companies);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const parseTechnicalUnitsFromExcel = (file: File, companyId: string): Promise<Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const units: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>[] = (jsonData as any[]).map((row: any) => ({
          companyId,
          name: row['Naam'] || row['Name'] || '',
          code: row['Code'] || '',
          description: row['Beschrijving'] || row['Description'] || '',
          numberOfEmployees: parseInt(row['Werknemers'] || row['Employees'] || '0'),
          manager: row['Manager'] || '',
          department: row['Afdeling'] || row['Department'] || '',
          status: ((row['Status'] === 'Inactief' || row['Status'] === 'Inactive') ? 'inactive' : 'active') as TechnicalBusinessUnit['status'],
          // New compliance fields
          language: ((): TechnicalBusinessUnit['language'] => {
            const raw = (row['Taal TBE'] || row['Language'] || '').toString().trim().toUpperCase();
            if (raw === 'N+F' || raw === 'N & F' || raw === 'NF' || raw === 'N EN F') return 'N+F';
            if (raw === 'D' || raw.includes('DUIT')) return 'D';
            if (raw === 'F' || raw.includes('WALL')) return 'F';
            return 'N';
          })(),
          pcWorkers: row['PC Arbeiders'] || row['PC Workers'] || '',
          pcClerks: row['PC Bedienden'] || row['PC Clerks'] || '',
          fodDossierBase: (row['FOD Dossier (5 cijfers)'] || row['FOD Dossier Base'] || '').toString().replace(/\D/g, '').slice(0,5),
          fodDossierSuffix: ((row['FOD Suffix'] || '1').toString().includes('2') ? '2' : '1'),
          electionBodies: {
            cpbw: Boolean(row['CPBW'] || row['Comité'] || row['COMITÉ']),
            or: Boolean(row['OR'] || row['Ondernemingsraad']),
            sdWorkers: Boolean(row['SD Arbeiders'] || row['Syndicale Delegatie Arbeiders']),
            sdClerks: Boolean(row['SD Bedienden'] || row['Syndicale Delegatie Bedienden']),
          },
          location: {
            street: row['Straat'] || row['Street'] || '',
            number: row['Nummer'] || row['Number'] || '',
            postalCode: row['Postcode'] || row['Postal Code'] || '',
            city: row['Stad'] || row['City'] || '',
            country: row['Land'] || row['Country'] || 'België',
          },
        }));
        
        resolve(units);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const downloadExcelTemplate = (type: 'companies' | 'technicalUnits') => {
  let data: any[] = [];
  let filename = '';
  
  if (type === 'companies') {
    data = [{
      'Naam': 'Voorbeeld Bedrijf',
      'Juridische Naam': 'Voorbeeld BV',
      'Ondernemingsnummer': 'BE0123456789',
      'Type': 'BV',
      'Werknemers': 100,
      'Sector': 'IT',
      'Status': 'active',
      'Straat': 'Hoofdstraat',
      'Nummer': '1',
      'Postcode': '1000',
      'Stad': 'Brussel',
      'Land': 'België',
      'Contact Voornaam': 'Jan',
      'Contact Achternaam': 'Janssen',
      'Contact Email': 'jan@voorbeeld.be',
      'Contact Telefoon': '+32 2 123 45 67',
      'Contact Functie': 'HR Manager',
    }];
    filename = 'bedrijven_template.xlsx';
  } else {
    data = [{
      'Naam': 'IT Afdeling',
      'Code': 'TBE001',
      'Beschrijving': 'Technische bedrijfseenheid voor IT',
      'Werknemers': 25,
      'Manager': 'Piet Pietersen',
      'Afdeling': 'Technologie',
      'Status': 'active',
      'Taal TBE': 'N',
      'PC Arbeiders': '100',
      'PC Bedienden': '200',
      'FOD Dossier (5 cijfers)': '12345',
      'FOD Suffix': '1',
      'CPBW': true,
      'OR': true,
      'SD Arbeiders': false,
      'SD Bedienden': false,
      'Straat': 'Techstraat',
      'Nummer': '10',
      'Postcode': '2000',
      'Stad': 'Antwerpen',
      'Land': 'België',
    }];
    filename = 'technische_eenheden_template.xlsx';
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, filename);
};

export const parseEmployeesFromExcel = (file: File, technicalUnitId: string): Promise<Omit<Employee, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const employees = (jsonData as any[]).map((row) => {
          const startRaw = row['Startdatum'] || row['Start Date'] || row['Startdate'] || '';
          const parsedDate = startRaw ? new Date(startRaw) : new Date();
          const statusRaw = (row['Status'] || '').toString().toLowerCase();
          const status: Employee['status'] = statusRaw === 'inactive' || statusRaw === 'inactief' ? 'inactive' : 'active';
          return {
            technicalBusinessUnitId: technicalUnitId,
            firstName: row['Voornaam'] || row['First Name'] || '',
            lastName: row['Achternaam'] || row['Last Name'] || '',
            email: row['Email'] || '',
            phone: row['Telefoon'] || row['Phone'] || '',
            role: row['Functie'] || row['Role'] || '',
            startDate: parsedDate,
            status,
          } as Omit<Employee, 'id'>;
        });

        resolve(employees);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const downloadEmployeeTemplate = () => {
  const data = [{
    'Voornaam': 'Sofie',
    'Achternaam': 'Peeters',
    'Email': 'sofie.peeters@example.com',
    'Telefoon': '+32 470 00 00 00',
    'Functie': 'Operator',
    'Startdatum': '2024-01-01',
    'Status': 'active',
  }];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'medewerkers_template.xlsx');
};

export const downloadManagerTemplate = () => {
  const data = [{
    'Voornaam': 'An',
    'Achternaam': 'Janssens',
    'Email': 'an.janssens@example.com',
    'Telefoon': '+32 470 11 22 33',
    'Functie': 'Manager',
    'Startdatum': '2024-01-01',
    'Status': 'active',
  }];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'leidinggevenden_template.xlsx');
};

// Export current technical units to Excel (including compliance fields)
export const exportTechnicalUnitsToExcel = (
  units: TechnicalBusinessUnit[],
  companies?: Company[]
) => {
  const rows = units.map(u => ({
    'Bedrijf': companies?.find(c => c.id === u.companyId)?.name || '',
    'Naam': u.name,
    'Code': u.code,
    'Beschrijving': u.description,
    'Werknemers': u.numberOfEmployees,
    'Manager': u.manager,
    'Afdeling': u.department,
    'Status': u.status,
    'Taal TBE': u.language,
    'PC Arbeiders': u.pcWorkers,
    'PC Bedienden': u.pcClerks,
    'FOD Dossier (5 cijfers)': u.fodDossierBase,
    'FOD Suffix': u.fodDossierSuffix,
    'CPBW': u.electionBodies?.cpbw ?? false,
    'OR': u.electionBodies?.or ?? false,
    'SD Arbeiders': u.electionBodies?.sdWorkers ?? false,
    'SD Bedienden': u.electionBodies?.sdClerks ?? false,
    'Straat': u.location?.street || '',
    'Nummer': u.location?.number || '',
    'Postcode': u.location?.postalCode || '',
    'Stad': u.location?.city || '',
    'Land': u.location?.country || '',
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Technische Eenheden');
  XLSX.writeFile(workbook, 'technische_eenheden_export.xlsx');
};

// Export current companies to Excel
export const exportCompaniesToExcel = (companies: Company[]) => {
  const rows = companies.map((c) => ({
    'Naam': c.name,
    'Juridische Naam': c.legalName,
    'Ondernemingsnummer': c.ondernemingsnummer,
    'Type': c.type,
    'Werknemers': c.numberOfEmployees,
    'Sector': c.sector,
    'Status': c.status,
    'Aangemaakt': c.createdAt,
    'Straat': c.address?.street || '',
    'Nummer': c.address?.number || '',
    'Postcode': c.address?.postalCode || '',
    'Stad': c.address?.city || '',
    'Land': c.address?.country || '',
    'Contact Voornaam': c.contactPerson?.firstName || '',
    'Contact Achternaam': c.contactPerson?.lastName || '',
    'Contact Email': c.contactPerson?.email || '',
    'Contact Telefoon': c.contactPerson?.phone || '',
    'Contact Functie': c.contactPerson?.role || '',
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bedrijven');
  XLSX.writeFile(workbook, 'bedrijven_export.xlsx');
};

// OR Members: Template download
export const downloadORTemplate = () => {
  const data = [
    { 'Email': 'jan.janssens@bedrijf.be', 'Categorie': 'arbeiders' },
    { 'Email': 'els.claes@bedrijf.be', 'Categorie': 'bedienden' },
  ];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OR Leden');
  XLSX.writeFile(workbook, 'or_leden_template.xlsx');
};

// OR Members: Parse import file -> array of { email, category }
export const parseORFromExcel = (file: File): Promise<Array<{ email: string; category: ORCategory }>> => {
  const mapCategory = (raw: any): ORCategory | null => {
    if (!raw) return null;
    const v = String(raw).toLowerCase().trim();
    if (/(^|\b)arbeider/.test(v)) return 'arbeiders';
    if (/(^|\b)bediend/.test(v)) return 'bedienden';
    if (/(^|\b)kader/.test(v)) return 'kaderleden';
    if (/jeugd/.test(v)) return 'jeugdige';
    if (v === 'arbeiders' || v === 'bedienden' || v === 'kaderleden' || v === 'jeugdige') return v as ORCategory;
    return null;
  };
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        const rows: Array<{ email: string; category: ORCategory }> = [];
        for (const row of jsonData) {
          const email = (row['Email'] || row['E-mail'] || row['email'] || '').toString().trim();
          const catRaw = row['Categorie'] ?? row['Category'] ?? row['OR Category'] ?? row['Categorie OR'];
          const category = mapCategory(catRaw);
          if (!email || !category) continue;
          rows.push({ email, category });
        }
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
