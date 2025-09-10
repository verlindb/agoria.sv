import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import TechnicalUnitHelper from './helpers/technical-unit-helper';
import PersonnelHelper, { PersonnelInput } from './helpers/personnel-helper';
import { NavigationHelper } from './helpers/navigation-helper';
import { GridHelper } from './helpers/grid-helper';
import { FormHelper } from './helpers/form-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(180_000);

test.describe('Company, Technical Unit and Personnel Management E2E', () => {
  test('should create company, add technical unit, and add personnel end-to-end', async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const companyBaseName = 'E2E-Full-Flow';
    const technicalUnitName = 'Test Technical Unit E2E';
    
    // Initialize helpers
    const navigation = new NavigationHelper(page);
    const grid = new GridHelper(page);
    const form = new FormHelper(page);
    const personnel = new PersonnelHelper(page);

    // Generate unique employee data
    const employeeData = PersonnelHelper.generateUniquePersonnelData('Decimus');

    // Create company using helper
    const created = await CompanyHelper.createCompany(page, request, { 
      baseName: companyBaseName,
      sector: 'Technology',
      employees: '25',
      street: 'Test Street',
      houseNumber: '123',
      city: 'Antwerpen',
      postalCode: '2000',
      contactFirst: 'Test',
      contactLast: 'Contact',
      contactEmailPrefix: 'test.contact',
      contactPhone: '+32 3 123 45 67',
      contactRole: 'Manager'
    });
    trackCompany(created.id);

    // Navigate to company detail page using helper
    await navigation.navigateToCompanyDetail(created.name);

    // Verify we're on the company detail page
    await expect(page.getByRole('heading', { name: created.name })).toBeVisible();

    // Add technical unit using form helper
    await form.clickButton('Nieuwe Eenheid');
    await form.waitForModal();

    const dialog = form.getModal();
    await expect(dialog).toBeVisible();
    
    // Fill technical unit form using form helper
    const technicalUnitData = {
      'Code': `TU-E2E-${uniqueSuffix}`.slice(0, 12),
      'Naam': technicalUnitName,
      'Afdeling': 'IT Department',
      'Manager (Employee ID)': 'MGR001',
      'Straat': 'TU Street',
      'Nummer': '1',
      'Postcode': '3000',
      'Stad': 'Antwerpen',
      'Dossiernummer FOD Werk (eerste 5 cijfers)': '12345'
    };

    for (const [field, value] of Object.entries(technicalUnitData)) {
      if (field === 'Manager (Employee ID)') {
        await dialog.getByRole('textbox', { name: field }).first().fill(value);
      } else if (field === 'Code' || field === 'Naam' || field === 'Afdeling' || field === 'Straat' || field === 'Nummer' || field === 'Postcode' || field === 'Stad' || field === 'Dossiernummer FOD Werk (eerste 5 cijfers)') {
        await dialog.getByRole('textbox', { name: field }).first().fill(value);
      }
    }

    // Fill number of employees
    await dialog.getByRole('spinbutton', { name: 'Aantal Werknemers' }).first().fill('15');

    // Select dropdowns
    await dialog.getByRole('combobox', { name: 'PC Arbeiders' }).click();
    await page.getByRole('option', { name: '100' }).click();

    await dialog.getByRole('combobox', { name: 'PC Bedienden' }).click();
    await page.getByRole('option', { name: '200' }).click();

    // Save technical unit
    await form.clickButton('Toevoegen');

    // Wait for success message and modal to close
    await expect(page.getByText('Technische eenheid toegevoegd')).toBeVisible();
    await form.waitForModalToClose();

    // Navigate to technical units overview using navigation helper
    await navigation.navigateToTechnicalUnits();

    // Search for our technical unit using grid helper
    await grid.search(technicalUnitName);

    // Navigate to technical unit detail page using navigation helper
    await navigation.navigateToTechnicalUnitDetail(technicalUnitName);

    // Verify we're on the technical unit detail page
    await expect(page.getByRole('heading', { name: technicalUnitName })).toBeVisible();

    // Navigate to personnel tab using personnel helper
    await personnel.navigateToPersonnelTab();

    // Add personnel using helper
    await personnel.addPersonnel(employeeData);

    // Verify personnel appears in grid
    await personnel.verifyPersonnelInGrid(employeeData);

    // Test personnel search functionality
    const searchTerm = employeeData.firstName.slice(0, 8);
    await personnel.testPersonnelSearch(searchTerm, employeeData.firstName);

    // Log success
    console.log('✅ E2E test completed successfully: Company → Technical Unit → Personnel workflow verified');
    console.log('✅ Company created:', companyBaseName);
    console.log('✅ Technical unit created:', technicalUnitName);
    console.log('✅ Unique Personnel added:');
    console.log('   - Name:', `${employeeData.firstName} ${employeeData.lastName}`);
    console.log('   - Email:', employeeData.email);
    console.log('   - Phone:', employeeData.phone);
    console.log('   - Role:', employeeData.role);
  });
});
