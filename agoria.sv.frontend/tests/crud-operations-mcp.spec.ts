import { test, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

/**
 * Comprehensive CRUD Operations Test Suite using Playwright MCP
 * 
 * This test suite leverages Playwright's Model Context Protocol (MCP) to provide
 * advanced testing capabilities for Create, Read, Update, Delete operations
 * across the entire application.
 */

// Helper class for MCP-enhanced CRUD testing
class MCPTestHelper {
  constructor(private page: Page) {}

  /**
   * Enhanced navigation with state verification
   */
  async navigateWithVerification(url: string, expectedTitle?: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
    
    // Verify page is fully loaded by checking for main content
    await expect(this.page.locator('main, [role="main"], .main-content')).toBeVisible();
  }

  /**
   * Enhanced form filling with validation
   */
  async fillFormField(selector: string, value: string, validate: boolean = true) {
    const field = this.page.locator(selector);
    await expect(field).toBeVisible();
    await field.clear();
    await field.fill(value);
    
    if (validate) {
      await expect(field).toHaveValue(value);
    }
  }

  /**
   * Wait for API response with specific criteria
   */
  async waitForApiResponse(urlPattern: string, method: string = 'GET', statusCode: number = 200) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && 
                 response.request().method() === method &&
                 response.status() === statusCode,
      { timeout: 10000 }
    );
  }

  /**
   * Enhanced element interaction with retry mechanism
   */
  async clickWithRetry(selector: string, maxRetries: number = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const element = this.page.locator(selector);
        await expect(element).toBeVisible();
        await element.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Generate test data with unique identifiers
   */
  generateTestData(prefix: string) {
    const timestamp = Date.now();
    return {
      timestamp,
      uniqueId: `${prefix}-${timestamp}`,
      email: `test-${timestamp}@example.com`,
      phone: `+32${String(timestamp).slice(-8)}`,
      number: String(timestamp).slice(-10)
    };
  }

  /**
   * Verify data persistence in localStorage
   */
  async verifyLocalStorageData(key: string, expectedValue?: any) {
    const value = await this.page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, key);

    if (expectedValue) {
      expect(JSON.parse(value)).toMatchObject(expectedValue);
    } else {
      expect(value).toBeTruthy();
    }
  }

  /**
   * Take screenshot with context information
   */
  async takeContextualScreenshot(name: string, fullPage: boolean = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/${name}-${timestamp}.png`,
      fullPage 
    });
  }
}

test.describe('CRUD Operations - Companies (MCP Enhanced)', () => {
  let helper: MCPTestHelper;
  let testData: any;

  test.beforeEach(async ({ page }) => {
    helper = new MCPTestHelper(page);
    testData = helper.generateTestData('company');
    await helper.navigateWithVerification(`${BASE_URL}/companies`, 'Companies');
  });

  test('CREATE: Should create a new company with complete validation', async ({ page }) => {
    // Step 1: Open create dialog
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    // Verify dialog opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Nieuw Bedrijf Toevoegen')).toBeVisible();

    // Step 2: Fill required fields with generated data
    const companyData = {
      name: `Test Company ${testData.uniqueId}`,
      legalName: `Test Company ${testData.uniqueId} BV`,
      enterpriseNumber: `BE${testData.number}`,
      employeeCount: '25',
      sector: 'Technology',
      street: 'Teststraat',
      number: '42',
      postalCode: '2000',
      city: 'Antwerpen',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactEmail: testData.email,
      contactPhone: testData.phone,
      contactRole: 'Manager'
    };

    await helper.fillFormField('input[name="name"]', companyData.name);
    await helper.fillFormField('input[name="legalName"]', companyData.legalName);
    await helper.fillFormField('input[name="enterpriseNumber"]', companyData.enterpriseNumber);
    await helper.fillFormField('input[name="employeeCount"]', companyData.employeeCount);
    await helper.fillFormField('input[name="sector"]', companyData.sector);
    
    // Address fields
    await helper.fillFormField('input[name="address.street"]', companyData.street);
    await helper.fillFormField('input[name="address.number"]', companyData.number);
    await helper.fillFormField('input[name="address.postalCode"]', companyData.postalCode);
    await helper.fillFormField('input[name="address.city"]', companyData.city);
    
    // Contact fields
    await helper.fillFormField('input[name="contactPerson.firstName"]', companyData.contactFirstName);
    await helper.fillFormField('input[name="contactPerson.lastName"]', companyData.contactLastName);
    await helper.fillFormField('input[name="contactPerson.email"]', companyData.contactEmail);
    await helper.fillFormField('input[name="contactPerson.phone"]', companyData.contactPhone);
    await helper.fillFormField('input[name="contactPerson.role"]', companyData.contactRole);

    // Step 3: Submit and verify creation
    const submitButton = page.locator('button:has-text("Toevoegen")');
    await expect(submitButton).toBeEnabled();

    // Wait for API response
    const responsePromise = helper.waitForApiResponse('/api/companies', 'POST', 201);
    await submitButton.click();
    await responsePromise;

    // Step 4: Verify company appears in the list
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(1000); // Allow for UI update
    
    // Search for the created company
    await helper.fillFormField('input[placeholder*="Zoek bedrijven"]', companyData.name);
    await page.waitForTimeout(1000);
    
    // Verify company is visible in results
    await expect(page.locator(`text=${companyData.name}`)).toBeVisible();
    
    // Take screenshot for verification
    await helper.takeContextualScreenshot('company-created');
  });

  test('READ: Should display company details with all information', async ({ page }) => {
    // First create a company to read
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    const companyData = {
      name: `Read Test Company ${testData.uniqueId}`,
      legalName: `Read Test Company ${testData.uniqueId} BV`,
      enterpriseNumber: `BE${testData.number}`,
      employeeCount: '15',
      sector: 'Finance'
    };

    // Fill minimal required fields for quick creation
    await helper.fillFormField('input[name="name"]', companyData.name);
    await helper.fillFormField('input[name="legalName"]', companyData.legalName);
    await helper.fillFormField('input[name="enterpriseNumber"]', companyData.enterpriseNumber);
    await helper.fillFormField('input[name="employeeCount"]', companyData.employeeCount);
    await helper.fillFormField('input[name="sector"]', companyData.sector);
    
    // Minimal address
    await helper.fillFormField('input[name="address.street"]', 'Readstraat');
    await helper.fillFormField('input[name="address.number"]', '1');
    await helper.fillFormField('input[name="address.postalCode"]', '1000');
    await helper.fillFormField('input[name="address.city"]', 'Brussel');
    
    // Minimal contact
    await helper.fillFormField('input[name="contactPerson.firstName"]', 'Jane');
    await helper.fillFormField('input[name="contactPerson.lastName"]', 'Smith');
    await helper.fillFormField('input[name="contactPerson.email"]', testData.email);
    await helper.fillFormField('input[name="contactPerson.phone"]', testData.phone);
    await helper.fillFormField('input[name="contactPerson.role"]', 'Director');

    // Submit
    const responsePromise = helper.waitForApiResponse('/api/companies', 'POST', 201);
    await page.locator('button:has-text("Toevoegen")').click();
    await responsePromise;

    // Now test reading the company
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await helper.fillFormField('input[placeholder*="Zoek bedrijven"]', companyData.name);
    await page.waitForTimeout(1000);

    // Click on the company to view details
    const companyLink = page.locator(`text=${companyData.name}`).first();
    await expect(companyLink).toBeVisible();
    await companyLink.click();

    // Verify we're on the company detail page
    await helper.waitForApiResponse('/api/companies/', 'GET');
    await expect(page.locator('h1', { hasText: companyData.name })).toBeVisible();
    
    // Verify all company information is displayed
    await expect(page.locator(`text=${companyData.legalName}`)).toBeVisible();
    await expect(page.locator(`text=${companyData.enterpriseNumber}`)).toBeVisible();
    await expect(page.locator(`text=${companyData.employeeCount}`)).toBeVisible();
    await expect(page.locator(`text=${companyData.sector}`)).toBeVisible();

    await helper.takeContextualScreenshot('company-details-read');
  });

  test('UPDATE: Should edit company information successfully', async ({ page }) => {
    // First create a company to update
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    const originalData = {
      name: `Update Test Company ${testData.uniqueId}`,
      employeeCount: '20',
      sector: 'Manufacturing'
    };

    // Create company with minimal data
    await helper.fillFormField('input[name="name"]', originalData.name);
    await helper.fillFormField('input[name="legalName"]', `${originalData.name} BV`);
    await helper.fillFormField('input[name="enterpriseNumber"]', `BE${testData.number}`);
    await helper.fillFormField('input[name="employeeCount"]', originalData.employeeCount);
    await helper.fillFormField('input[name="sector"]', originalData.sector);
    
    // Minimal required fields
    await helper.fillFormField('input[name="address.street"]', 'Updatestraat');
    await helper.fillFormField('input[name="address.number"]', '5');
    await helper.fillFormField('input[name="address.postalCode"]', '3000');
    await helper.fillFormField('input[name="address.city"]', 'Leuven');
    await helper.fillFormField('input[name="contactPerson.firstName"]', 'Mike');
    await helper.fillFormField('input[name="contactPerson.lastName"]', 'Johnson');
    await helper.fillFormField('input[name="contactPerson.email"]', testData.email);
    await helper.fillFormField('input[name="contactPerson.phone"]', testData.phone);
    await helper.fillFormField('input[name="contactPerson.role"]', 'CEO');

    // Submit creation
    const createResponse = helper.waitForApiResponse('/api/companies', 'POST', 201);
    await page.locator('button:has-text("Toevoegen")').click();
    await createResponse;

    await expect(page.locator('[role="dialog"]')).toBeHidden();
    
    // Now search and edit the company
    await helper.fillFormField('input[placeholder*="Zoek bedrijven"]', originalData.name);
    await page.waitForTimeout(1000);

    // Click on edit button (assuming there's an edit action)
    const editButton = page.locator('button[title*="Bewerk"], button:has-text("Bewerk")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Alternative: click on company name to go to detail, then find edit
      await page.locator(`text=${originalData.name}`).first().click();
      await page.waitForTimeout(1000);
      await page.locator('button:has-text("Bewerk"), button[title*="Bewerk"]').first().click();
    }

    // Verify edit dialog opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Update fields
    const updatedData = {
      employeeCount: '35',
      sector: 'Technology Services'
    };

    await helper.fillFormField('input[name="employeeCount"]', updatedData.employeeCount);
    await helper.fillFormField('input[name="sector"]', updatedData.sector);

    // Submit update
    const updateResponse = helper.waitForApiResponse('/api/companies/', 'PUT');
    await page.locator('button:has-text("Opslaan"), button:has-text("Bijwerken")').click();
    await updateResponse;

    // Verify update succeeded
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    
    // Verify updated data is displayed
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${updatedData.employeeCount}`)).toBeVisible();
    await expect(page.locator(`text=${updatedData.sector}`)).toBeVisible();

    await helper.takeContextualScreenshot('company-updated');
  });

  test('DELETE: Should delete company with confirmation', async ({ page }) => {
    // First create a company to delete
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    const companyToDelete = {
      name: `Delete Test Company ${testData.uniqueId}`,
      legalName: `Delete Test Company ${testData.uniqueId} BV`,
      enterpriseNumber: `BE${testData.number}`
    };

    // Create company
    await helper.fillFormField('input[name="name"]', companyToDelete.name);
    await helper.fillFormField('input[name="legalName"]', companyToDelete.legalName);
    await helper.fillFormField('input[name="enterpriseNumber"]', companyToDelete.enterpriseNumber);
    await helper.fillFormField('input[name="employeeCount"]', '10');
    await helper.fillFormField('input[name="sector"]', 'Testing');
    
    // Minimal required fields
    await helper.fillFormField('input[name="address.street"]', 'Deletestraat');
    await helper.fillFormField('input[name="address.number"]', '99');
    await helper.fillFormField('input[name="address.postalCode"]', '9000');
    await helper.fillFormField('input[name="address.city"]', 'Gent');
    await helper.fillFormField('input[name="contactPerson.firstName"]', 'Delete');
    await helper.fillFormField('input[name="contactPerson.lastName"]', 'User');
    await helper.fillFormField('input[name="contactPerson.email"]', testData.email);
    await helper.fillFormField('input[name="contactPerson.phone"]', testData.phone);
    await helper.fillFormField('input[name="contactPerson.role"]', 'Tester');

    // Submit creation
    const createResponse = helper.waitForApiResponse('/api/companies', 'POST', 201);
    await page.locator('button:has-text("Toevoegen")').click();
    await createResponse;

    await expect(page.locator('[role="dialog"]')).toBeHidden();
    
    // Search for the company to delete
    await helper.fillFormField('input[placeholder*="Zoek bedrijven"]', companyToDelete.name);
    await page.waitForTimeout(1000);

    // Verify company exists
    await expect(page.locator(`text=${companyToDelete.name}`)).toBeVisible();

    // Find and click delete button
    const deleteButton = page.locator('button[title*="Verwijder"], button:has-text("Verwijder")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
    } else {
      // Alternative: right-click for context menu or navigate to detail page
      await page.locator(`text=${companyToDelete.name}`).first().click({ button: 'right' });
      await page.locator('text=Verwijder').click();
    }

    // Verify confirmation dialog
    await expect(page.locator('text=Bevestigen, text=Weet je het zeker')).toBeVisible();

    // Confirm deletion
    const deleteResponse = helper.waitForApiResponse('/api/companies/', 'DELETE');
    await page.locator('button:has-text("Verwijder"), button:has-text("Ja")').click();
    await deleteResponse;

    // Verify company is no longer in the list
    await page.waitForTimeout(1000);
    await helper.fillFormField('input[placeholder*="Zoek bedrijven"]', companyToDelete.name);
    await page.waitForTimeout(1000);
    
    await expect(page.locator(`text=${companyToDelete.name}`)).toBeHidden();

    await helper.takeContextualScreenshot('company-deleted');
  });
});

test.describe('CRUD Operations - Technical Units (MCP Enhanced)', () => {
  let helper: MCPTestHelper;
  let testData: any;

  test.beforeEach(async ({ page }) => {
    helper = new MCPTestHelper(page);
    testData = helper.generateTestData('unit');
    await helper.navigateWithVerification(`${BASE_URL}/technical-units`, 'Technical Units');
  });

  test('CREATE: Should create a new technical unit', async ({ page }) => {
    // Open create dialog
    await helper.clickWithRetry('button:has-text("Nieuwe Technische Eenheid")');
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    const unitData = {
      name: `Test Unit ${testData.uniqueId}`,
      description: `Description for test unit ${testData.uniqueId}`,
      location: 'Building A, Floor 2',
      capacity: '50'
    };

    // Fill form fields
    await helper.fillFormField('input[name="name"]', unitData.name);
    await helper.fillFormField('textarea[name="description"], input[name="description"]', unitData.description);
    await helper.fillFormField('input[name="location"]', unitData.location);
    await helper.fillFormField('input[name="capacity"]', unitData.capacity);

    // Submit
    const responsePromise = helper.waitForApiResponse('/api/technical-units', 'POST', 201);
    await page.locator('button:has-text("Toevoegen")').click();
    await responsePromise;

    // Verify creation
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await expect(page.locator(`text=${unitData.name}`)).toBeVisible();

    await helper.takeContextualScreenshot('technical-unit-created');
  });

  test('READ: Should display technical unit details', async ({ page }) => {
    // Create a unit first
    await helper.clickWithRetry('button:has-text("Nieuwe Technische Eenheid")');
    
    const unitData = {
      name: `Read Unit ${testData.uniqueId}`,
      description: 'Unit for reading test'
    };

    await helper.fillFormField('input[name="name"]', unitData.name);
    await helper.fillFormField('textarea[name="description"], input[name="description"]', unitData.description);

    const createResponse = helper.waitForApiResponse('/api/technical-units', 'POST', 201);
    await page.locator('button:has-text("Toevoegen")').click();
    await createResponse;

    // Read the unit details
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    const unitLink = page.locator(`text=${unitData.name}`).first();
    await expect(unitLink).toBeVisible();
    await unitLink.click();

    // Verify detail page
    await helper.waitForApiResponse('/api/technical-units/', 'GET');
    await expect(page.locator('h1', { hasText: unitData.name })).toBeVisible();
    await expect(page.locator(`text=${unitData.description}`)).toBeVisible();

    await helper.takeContextualScreenshot('technical-unit-details');
  });
});

test.describe('Data Persistence and State Management (MCP)', () => {
  let helper: MCPTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new MCPTestHelper(page);
  });

  test('Should persist form data in localStorage', async ({ page }) => {
    await helper.navigateWithVerification(`${BASE_URL}/companies`);
    
    // Open create form
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    const formData = {
      name: 'Draft Company',
      employeeCount: '25'
    };

    // Fill some fields
    await helper.fillFormField('input[name="name"]', formData.name);
    await helper.fillFormField('input[name="employeeCount"]', formData.employeeCount);

    // Verify data is saved to localStorage
    await helper.verifyLocalStorageData('company-draft-form');

    // Close form without saving
    await page.locator('button:has-text("Annuleer")').click();

    // Reopen form and verify data is restored
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    // Check if form fields are pre-filled
    await expect(page.locator('input[name="name"]')).toHaveValue(formData.name);
    await expect(page.locator('input[name="employeeCount"]')).toHaveValue(formData.employeeCount);

    await helper.takeContextualScreenshot('form-data-persistence');
  });

  test('Should handle user preferences persistence', async ({ page }) => {
    await helper.navigateWithVerification(`${BASE_URL}/companies`);
    
    // Change view mode
    const cardViewButton = page.locator('button[title*="Card"], button:has-text("Card")');
    if (await cardViewButton.isVisible()) {
      await cardViewButton.click();
      await helper.verifyLocalStorageData('view-preferences');
    }

    // Refresh page and verify preference is maintained
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify view mode is still active
    await expect(cardViewButton).toHaveAttribute('aria-pressed', 'true');

    await helper.takeContextualScreenshot('preferences-persistence');
  });
});

test.describe('Error Handling and Edge Cases (MCP)', () => {
  let helper: MCPTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new MCPTestHelper(page);
  });

  test('Should handle network failures gracefully', async ({ page }) => {
    await helper.navigateWithVerification(`${BASE_URL}/companies`);
    
    // Simulate network failure
    await page.route('**/api/companies', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });

    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    // Fill form with valid data
    await helper.fillFormField('input[name="name"]', 'Test Company');
    await helper.fillFormField('input[name="legalName"]', 'Test Company BV');
    await helper.fillFormField('input[name="enterpriseNumber"]', 'BE1234567890');
    await helper.fillFormField('input[name="employeeCount"]', '10');
    await helper.fillFormField('input[name="sector"]', 'Testing');

    // Fill required address and contact fields
    await helper.fillFormField('input[name="address.street"]', 'Teststraat');
    await helper.fillFormField('input[name="address.number"]', '1');
    await helper.fillFormField('input[name="address.postalCode"]', '1000');
    await helper.fillFormField('input[name="address.city"]', 'Brussel');
    await helper.fillFormField('input[name="contactPerson.firstName"]', 'Test');
    await helper.fillFormField('input[name="contactPerson.lastName"]', 'User');
    await helper.fillFormField('input[name="contactPerson.email"]', 'test@example.com');
    await helper.fillFormField('input[name="contactPerson.phone"]', '+32123456789');
    await helper.fillFormField('input[name="contactPerson.role"]', 'Tester');

    // Try to submit
    await page.locator('button:has-text("Toevoegen")').click();

    // Verify error message is shown
    await expect(page.locator('text=Error, text=Fout')).toBeVisible();

    await helper.takeContextualScreenshot('network-error-handling');
  });

  test('Should validate required fields', async ({ page }) => {
    await helper.navigateWithVerification(`${BASE_URL}/companies`);
    
    await helper.clickWithRetry('button:has-text("Nieuw Bedrijf")');
    
    // Try to submit without filling required fields
    await page.locator('button:has-text("Toevoegen")').click();

    // Verify validation messages
    await expect(page.locator('text=Required, text=Verplicht')).toBeVisible();

    await helper.takeContextualScreenshot('validation-errors');
  });
});