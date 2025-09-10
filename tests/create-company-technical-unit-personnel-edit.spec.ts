import { test, expect } from '@playwright/test';
import CompanyHelper, { CompanyInput, CreatedCompanyResult } from './helpers/company-helper';
import PersonnelHelper, { PersonnelInput } from './helpers/personnel-helper';
import { NavigationHelper } from './helpers/navigation-helper';
import { GridHelper } from './helpers/grid-helper';
import { FormHelper } from './helpers/form-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(180_000);

test.describe('Create Company, Technical Unit, Personnel and Edit Personnel E2E', () => {
  let createdCompany: CreatedCompanyResult;
  let originalPersonnelData: PersonnelInput;
  let technicalUnitName: string;

  test.beforeEach(async ({ page }) => {
    // Generate unique test data
    const uniqueSuffix = Date.now();
    technicalUnitName = 'Edit Personnel TU E2E';
    originalPersonnelData = PersonnelHelper.generateUniquePersonnelData('EditTest');

    // Find the correct port for the frontend
    const ports = [3000, 3001];
    let base = 'http://localhost:3001';
    for (const p of ports) {
      try { 
        const r = await page.request.get(`http://localhost:${p}/`); 
        if (r.ok()) { 
          base = `http://localhost:${p}`; 
          break; 
        } 
      } catch {}
    }

    await page.goto(base);
  });

  test('should create company, technical unit, personnel and successfully edit personnel details', async ({ page, request }) => {
    // Initialize helpers
    const navigation = new NavigationHelper(page);
    const grid = new GridHelper(page);
    const form = new FormHelper(page);
    const personnel = new PersonnelHelper(page);

    // ===== STEP 1: Create Company =====
    console.log('Creating company for personnel edit test...');
    createdCompany = await CompanyHelper.createCompany(page, request, {
      baseName: 'E2E-Edit-Personnel',
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
    trackCompany(createdCompany.id);

    // ===== STEP 2: Navigate to Company and Create Technical Unit =====
    await navigation.navigateToCompanyDetail(createdCompany.name);
    await expect(page.getByRole('heading', { name: createdCompany.name })).toBeVisible();

    console.log('Creating technical unit:', technicalUnitName);
    await form.clickButton('Nieuwe Eenheid');
    await form.waitForModal();

    const dialog = form.getModal();
    await expect(dialog).toBeVisible();

    const uniqueSuffix = Date.now();
    const technicalUnitData = {
      'Code': `TU-EDIT-${uniqueSuffix}`.slice(0, 12),
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

    // ===== STEP 3: Navigate to Technical Unit and Create Personnel =====
    await navigation.navigateToTechnicalUnits();
    await grid.search(technicalUnitName);
    await navigation.navigateToTechnicalUnitDetail(technicalUnitName);
    await expect(page.getByRole('heading', { name: technicalUnitName })).toBeVisible();

    await personnel.navigateToPersonnelTab();

    console.log('Creating personnel:', originalPersonnelData.firstName, originalPersonnelData.lastName);
    await personnel.addPersonnel(originalPersonnelData);
    await personnel.verifyPersonnelInGrid(originalPersonnelData);

    // ===== STEP 4: Edit Personnel =====
    console.log('Editing personnel details...');

    // Generate new data for the edit
    const updatedPersonnelData = PersonnelHelper.generateUniquePersonnelData('EditedEmployee');
    const partialUpdate = {
      firstName: updatedPersonnelData.firstName,
      role: updatedPersonnelData.role,
      phone: updatedPersonnelData.phone
    };

    console.log('Updating personnel with:', partialUpdate);
    const finalPersonnelData = await personnel.editPersonnel(originalPersonnelData, partialUpdate);

    // ===== STEP 5: Verify Personnel Edit =====
    console.log('Verifying personnel edits...');
    await personnel.verifyPersonnelInGrid(finalPersonnelData);

    // Verify specific updated fields are present in the grid
    const fullName = `${finalPersonnelData.firstName} ${finalPersonnelData.lastName || ''}`.trim();
    await expect(page.getByRole('cell', { name: fullName })).toBeVisible();
    await expect(page.getByRole('cell', { name: finalPersonnelData.role })).toBeVisible();
    await expect(page.getByRole('cell', { name: finalPersonnelData.phone })).toBeVisible();

    // Verify the old data is no longer present
    const oldFullName = `${originalPersonnelData.firstName} ${originalPersonnelData.lastName || ''}`.trim();
    await expect(page.getByRole('cell', { name: oldFullName })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: originalPersonnelData.role })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: originalPersonnelData.phone })).not.toBeVisible();

    // ===== STEP 6: Test Search Functionality with Edited Data =====
    console.log('Testing search with edited personnel data...');
    const searchTerm = finalPersonnelData.firstName.slice(0, 8);
    await personnel.testPersonnelSearch(searchTerm, fullName);

    console.log('✅ Personnel edit test completed successfully!');
    console.log('Company:', createdCompany.name);
    console.log('Technical Unit:', technicalUnitName);
    console.log('Original Personnel:', `${originalPersonnelData.firstName} ${originalPersonnelData.lastName}`);
    console.log('Updated Personnel:', `${finalPersonnelData.firstName} ${finalPersonnelData.lastName}`);
  });

  test('should edit multiple personnel fields and verify all changes', async ({ page, request }) => {
    // Initialize helpers
    const navigation = new NavigationHelper(page);
    const grid = new GridHelper(page);
    const form = new FormHelper(page);
    const personnel = new PersonnelHelper(page);

    // ===== SETUP: Create Company, Technical Unit, Personnel =====
    console.log('Setting up test data for comprehensive edit test...');
    createdCompany = await CompanyHelper.createCompany(page, request, {
      baseName: 'E2E-Full-Edit-Personnel',
      sector: 'Technology',
      employees: '30',
      street: 'Full Edit Street',
      houseNumber: '456',
      city: 'Gent',
      postalCode: '9000',
      contactFirst: 'Full',
      contactLast: 'Editor',
      contactEmailPrefix: 'full.editor',
      contactPhone: '+32 9 876 54 32',
      contactRole: 'Lead Manager'
    });
    trackCompany(createdCompany.id);

    await navigation.navigateToCompanyDetail(createdCompany.name);
    
    // Create technical unit
    await form.clickButton('Nieuwe Eenheid');
    await form.waitForModal();

    const dialog = form.getModal();
    const uniqueSuffix = Date.now();
    const technicalUnitData = {
      'Code': `TU-FULL-${uniqueSuffix}`.slice(0, 12),
      'Naam': technicalUnitName,
      'Afdeling': 'Full Edit Department',
      'Manager (Employee ID)': 'MGR002',
      'Straat': 'Full Edit TU Street',
      'Nummer': '2',
      'Postcode': '9000',
      'Stad': 'Gent',
      'Dossiernummer FOD Werk (eerste 5 cijfers)': '54321'
    };

    for (const [field, value] of Object.entries(technicalUnitData)) {
      if (field === 'Manager (Employee ID)') {
        await dialog.getByRole('textbox', { name: field }).first().fill(value);
      } else {
        await dialog.getByRole('textbox', { name: field }).first().fill(value);
      }
    }

    await dialog.getByRole('spinbutton', { name: 'Aantal Werknemers' }).first().fill('20');
    await dialog.getByRole('combobox', { name: 'PC Arbeiders' }).click();
    await page.getByRole('option', { name: '100' }).click();
    await dialog.getByRole('combobox', { name: 'PC Bedienden' }).click();
    await page.getByRole('option', { name: '200' }).click();

    await form.clickButton('Toevoegen');
    await expect(page.getByText('Technische eenheid toegevoegd')).toBeVisible();
    await form.waitForModalToClose();

    await navigation.navigateToTechnicalUnits();
    await grid.search(technicalUnitName);
    await navigation.navigateToTechnicalUnitDetail(technicalUnitName);
    await personnel.navigateToPersonnelTab();
    await personnel.addPersonnel(originalPersonnelData);
    await personnel.verifyPersonnelInGrid(originalPersonnelData);

    // ===== MAIN TEST: Edit All Personnel Fields =====
    console.log('Editing all personnel fields...');

    const completeUpdate = PersonnelHelper.generateUniquePersonnelData('FullyUpdated');
    console.log('Updating all fields with:', completeUpdate);

    const finalPersonnelData = await personnel.editPersonnel(originalPersonnelData, completeUpdate);

    // ===== VERIFICATION: Check All Fields Were Updated =====
    console.log('Verifying all field updates...');

    // Verify all new data is present
    const updatedFullName = `${finalPersonnelData.firstName} ${finalPersonnelData.lastName || ''}`.trim();
    await expect(page.getByRole('cell', { name: updatedFullName })).toBeVisible();
    await expect(page.getByRole('cell', { name: finalPersonnelData.email })).toBeVisible();
    await expect(page.getByRole('cell', { name: finalPersonnelData.phone })).toBeVisible();
    await expect(page.getByRole('cell', { name: finalPersonnelData.role })).toBeVisible();

    // Verify all old data is gone
    const originalFullName = `${originalPersonnelData.firstName} ${originalPersonnelData.lastName || ''}`.trim();
    await expect(page.getByRole('cell', { name: originalFullName })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: originalPersonnelData.email })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: originalPersonnelData.phone })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: originalPersonnelData.role })).not.toBeVisible();

    console.log('✅ Complete personnel edit test completed successfully!');
  });
});
