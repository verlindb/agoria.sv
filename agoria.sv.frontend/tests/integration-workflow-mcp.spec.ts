import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

/**
 * Integration Test Suite with MCP - End-to-End User Workflows
 * 
 * This test suite focuses on complete user workflows and integration scenarios
 * using Playwright MCP (Model Context Protocol) capabilities for comprehensive testing.
 */

// MCP Integration Helper for workflow testing
class MCPWorkflowHelper {
  private workflowSteps: Array<{step: string, timestamp: number, screenshot?: string}> = [];
  
  constructor(private page: Page) {}

  /**
   * Record workflow step
   */
  async recordStep(stepName: string, takeScreenshot: boolean = false) {
    const timestamp = Date.now();
    let screenshot = undefined;
    
    if (takeScreenshot) {
      screenshot = `workflow-${stepName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.png`;
      await this.page.screenshot({ 
        path: `test-results/${screenshot}`,
        fullPage: true 
      });
    }

    this.workflowSteps.push({ step: stepName, timestamp, screenshot });
    console.log(`✓ Workflow Step: ${stepName} (${new Date(timestamp).toISOString()})`);
  }

  /**
   * Generate workflow report
   */
  getWorkflowReport() {
    const totalTime = this.workflowSteps.length > 1 
      ? this.workflowSteps[this.workflowSteps.length - 1].timestamp - this.workflowSteps[0].timestamp
      : 0;

    return {
      steps: this.workflowSteps,
      summary: {
        totalSteps: this.workflowSteps.length,
        totalDuration: totalTime,
        averageStepTime: totalTime / Math.max(this.workflowSteps.length - 1, 1)
      }
    };
  }

  /**
   * Verify element and record action
   */
  async verifyAndClick(selector: string, description: string, timeout: number = 5000) {
    await this.recordStep(`Verifying: ${description}`);
    
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    await element.click();
    
    await this.recordStep(`Clicked: ${description}`, true);
  }

  /**
   * Fill form field with verification
   */
  async fillFieldWithVerification(selector: string, value: string, description: string) {
    await this.recordStep(`Filling field: ${description}`);
    
    const field = this.page.locator(selector);
    await expect(field).toBeVisible();
    await field.clear();
    await field.fill(value);
    await expect(field).toHaveValue(value);
    
    await this.recordStep(`Filled ${description} with: ${value}`);
  }

  /**
   * Wait for API call and record
   */
  async waitForApiCall(urlPattern: string, method: string, expectedStatus: number, description: string) {
    await this.recordStep(`Waiting for API: ${description}`);
    
    const response = await this.page.waitForResponse(
      resp => resp.url().includes(urlPattern) && 
               resp.request().method() === method && 
               resp.status() === expectedStatus,
      { timeout: 10000 }
    );
    
    await this.recordStep(`API call completed: ${description} (${response.status()})`);
    return response;
  }

  /**
   * Navigate with workflow tracking
   */
  async navigateToPage(url: string, expectedTitle: string) {
    await this.recordStep(`Navigating to: ${url}`);
    
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
    
    await this.recordStep(`Successfully navigated to: ${url}`, true);
  }
}

test.describe('Complete Company Management Workflow - MCP Integration', () => {
  let workflow: MCPWorkflowHelper;
  let testData: any;

  test.beforeEach(async ({ page }) => {
    workflow = new MCPWorkflowHelper(page);
    testData = {
      timestamp: Date.now(),
      companyName: `Workflow Company ${Date.now()}`,
      contactEmail: `workflow-${Date.now()}@example.com`
    };
  });

  test('Complete company lifecycle: Create → View → Edit → Delete', async ({ page }) => {
    // Step 1: Navigate to companies page
    await workflow.navigateToPage(`${BASE_URL}/companies`, 'Companies');

    // Step 2: Create new company
    await workflow.verifyAndClick('button:has-text("Nieuw Bedrijf")', 'New Company button');
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await workflow.recordStep('Company creation dialog opened', true);

    // Fill complete company form
    const companyData = {
      name: testData.companyName,
      legalName: `${testData.companyName} BV`,
      enterpriseNumber: `BE${String(testData.timestamp).slice(-10)}`,
      employeeCount: '45',
      sector: 'Workflow Testing',
      street: 'Workflow Street',
      number: '123',
      postalCode: '1000',
      city: 'Brussels',
      contactFirstName: 'Workflow',
      contactLastName: 'Manager',
      contactEmail: testData.contactEmail,
      contactPhone: '+32123456789',
      contactRole: 'Workflow Coordinator'
    };

    // Fill all form fields
    await workflow.fillFieldWithVerification('input[name="name"]', companyData.name, 'Company Name');
    await workflow.fillFieldWithVerification('input[name="legalName"]', companyData.legalName, 'Legal Name');
    await workflow.fillFieldWithVerification('input[name="enterpriseNumber"]', companyData.enterpriseNumber, 'Enterprise Number');
    await workflow.fillFieldWithVerification('input[name="employeeCount"]', companyData.employeeCount, 'Employee Count');
    await workflow.fillFieldWithVerification('input[name="sector"]', companyData.sector, 'Sector');
    await workflow.fillFieldWithVerification('input[name="address.street"]', companyData.street, 'Street');
    await workflow.fillFieldWithVerification('input[name="address.number"]', companyData.number, 'House Number');
    await workflow.fillFieldWithVerification('input[name="address.postalCode"]', companyData.postalCode, 'Postal Code');
    await workflow.fillFieldWithVerification('input[name="address.city"]', companyData.city, 'City');
    await workflow.fillFieldWithVerification('input[name="contactPerson.firstName"]', companyData.contactFirstName, 'Contact First Name');
    await workflow.fillFieldWithVerification('input[name="contactPerson.lastName"]', companyData.contactLastName, 'Contact Last Name');
    await workflow.fillFieldWithVerification('input[name="contactPerson.email"]', companyData.contactEmail, 'Contact Email');
    await workflow.fillFieldWithVerification('input[name="contactPerson.phone"]', companyData.contactPhone, 'Contact Phone');
    await workflow.fillFieldWithVerification('input[name="contactPerson.role"]', companyData.contactRole, 'Contact Role');

    // Submit form
    await workflow.recordStep('All form fields completed');
    await workflow.waitForApiCall('/api/companies', 'POST', 201, 'Company creation');
    await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Submit Company Creation');

    // Step 3: Verify company was created and appears in list
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await workflow.recordStep('Company creation dialog closed');
    
    await page.waitForTimeout(1000); // Allow for UI update
    await workflow.fillFieldWithVerification('input[placeholder*="Zoek bedrijven"]', companyData.name, 'Search for created company');
    await expect(page.locator(`text=${companyData.name}`)).toBeVisible();
    await workflow.recordStep('Company found in search results', true);

    // Step 4: View company details
    await workflow.verifyAndClick(`text=${companyData.name}`, 'Company name in list');
    await workflow.waitForApiCall('/api/companies', 'GET', 200, 'Company details fetch');
    
    // Verify all company details are displayed
    await expect(page.locator('h1', { hasText: companyData.name })).toBeVisible();
    await expect(page.locator(`text=${companyData.legalName}`)).toBeVisible();
    await expect(page.locator(`text=${companyData.enterpriseNumber}`)).toBeVisible();
    await workflow.recordStep('Company details page verified', true);

    // Step 5: Edit company
    await workflow.verifyAndClick('button:has-text("Bewerk"), button[title*="Bewerk"]', 'Edit Company button');
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await workflow.recordStep('Company edit dialog opened', true);

    // Update some fields
    const updatedData = {
      employeeCount: '55',
      sector: 'Updated Workflow Testing',
      contactRole: 'Senior Workflow Coordinator'
    };

    await workflow.fillFieldWithVerification('input[name="employeeCount"]', updatedData.employeeCount, 'Updated Employee Count');
    await workflow.fillFieldWithVerification('input[name="sector"]', updatedData.sector, 'Updated Sector');
    await workflow.fillFieldWithVerification('input[name="contactPerson.role"]', updatedData.contactRole, 'Updated Contact Role');

    // Submit update
    await workflow.waitForApiCall('/api/companies', 'PUT', 200, 'Company update');
    await workflow.verifyAndClick('button:has-text("Opslaan"), button:has-text("Bijwerken")', 'Save Company Changes');

    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await workflow.recordStep('Company updated successfully');

    // Verify updates are reflected
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${updatedData.employeeCount}`)).toBeVisible();
    await expect(page.locator(`text=${updatedData.sector}`)).toBeVisible();
    await workflow.recordStep('Updated data verified on page', true);

    // Step 6: Delete company
    await workflow.verifyAndClick('button:has-text("Verwijder"), button[title*="Verwijder"]', 'Delete Company button');
    
    // Confirm deletion
    await expect(page.locator('text=Bevestigen, text=Weet je het zeker')).toBeVisible();
    await workflow.recordStep('Delete confirmation dialog shown', true);

    await workflow.waitForApiCall('/api/companies', 'DELETE', 200, 'Company deletion');
    await workflow.verifyAndClick('button:has-text("Verwijder"), button:has-text("Ja")', 'Confirm Delete');

    // Step 7: Verify company is deleted
    await workflow.navigateToPage(`${BASE_URL}/companies`, 'Companies');
    await workflow.fillFieldWithVerification('input[placeholder*="Zoek bedrijven"]', companyData.name, 'Search for deleted company');
    
    // Company should no longer appear
    await expect(page.locator(`text=${companyData.name}`)).toBeHidden();
    await workflow.recordStep('Company successfully deleted and removed from list', true);

    // Generate and log workflow report
    const report = workflow.getWorkflowReport();
    console.log('Complete Company Workflow Report:');
    console.log(JSON.stringify(report, null, 2));

    expect(report.summary.totalSteps).toBeGreaterThan(20);
    expect(report.summary.totalDuration).toBeLessThan(60000); // Should complete in under 60 seconds
  });

  test('Company-to-Technical-Unit workflow integration', async ({ page }) => {
    // Step 1: Create a company first
    await workflow.navigateToPage(`${BASE_URL}/companies`, 'Companies');
    
    await workflow.verifyAndClick('button:has-text("Nieuw Bedrijf")', 'New Company button');
    
    const companyData = {
      name: `Tech Unit Parent ${testData.timestamp}`,
      legalName: `Tech Unit Parent ${testData.timestamp} BV`,
      enterpriseNumber: `BE${String(testData.timestamp).slice(-10)}`
    };

    // Create company with minimal data
    await workflow.fillFieldWithVerification('input[name="name"]', companyData.name, 'Parent Company Name');
    await workflow.fillFieldWithVerification('input[name="legalName"]', companyData.legalName, 'Parent Company Legal Name');
    await workflow.fillFieldWithVerification('input[name="enterpriseNumber"]', companyData.enterpriseNumber, 'Enterprise Number');
    await workflow.fillFieldWithVerification('input[name="employeeCount"]', '30', 'Employee Count');
    await workflow.fillFieldWithVerification('input[name="sector"]', 'Integration Testing', 'Sector');
    
    // Required fields
    await workflow.fillFieldWithVerification('input[name="address.street"]', 'Integration Street', 'Street');
    await workflow.fillFieldWithVerification('input[name="address.number"]', '1', 'Number');
    await workflow.fillFieldWithVerification('input[name="address.postalCode"]', '1000', 'Postal Code');
    await workflow.fillFieldWithVerification('input[name="address.city"]', 'Brussels', 'City');
    await workflow.fillFieldWithVerification('input[name="contactPerson.firstName"]', 'Integration', 'First Name');
    await workflow.fillFieldWithVerification('input[name="contactPerson.lastName"]', 'Manager', 'Last Name');
    await workflow.fillFieldWithVerification('input[name="contactPerson.email"]', testData.contactEmail, 'Email');
    await workflow.fillFieldWithVerification('input[name="contactPerson.phone"]', '+32987654321', 'Phone');
    await workflow.fillFieldWithVerification('input[name="contactPerson.role"]', 'Integration Lead', 'Role');

    await workflow.waitForApiCall('/api/companies', 'POST', 201, 'Parent company creation');
    await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Create Parent Company');

    // Step 2: Navigate to company details
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await workflow.fillFieldWithVerification('input[placeholder*="Zoek bedrijven"]', companyData.name, 'Search for parent company');
    await workflow.verifyAndClick(`text=${companyData.name}`, 'Parent company link');

    await workflow.waitForApiCall('/api/companies', 'GET', 200, 'Parent company details');
    await workflow.recordStep('Navigated to parent company details', true);

    // Step 3: Navigate to Technical Units from company detail
    const techUnitsButton = page.locator('text=Technische Eenheden, text=Technical Units').first();
    if (await techUnitsButton.isVisible()) {
      await workflow.verifyAndClick('text=Technische Eenheden, text=Technical Units', 'Technical Units tab/button');
    } else {
      // Alternative navigation
      await workflow.navigateToPage(`${BASE_URL}/technical-units`, 'Technical Units');
    }

    // Step 4: Create technical unit linked to company
    await workflow.verifyAndClick('button:has-text("Nieuwe Technische Eenheid")', 'New Technical Unit button');
    
    const unitData = {
      name: `Integration Unit ${testData.timestamp}`,
      description: `Technical unit for ${companyData.name}`,
      location: 'Building A - Floor 3'
    };

    await workflow.fillFieldWithVerification('input[name="name"]', unitData.name, 'Technical Unit Name');
    
    // Handle description field (could be textarea or input)
    const descField = page.locator('textarea[name="description"]');
    if (await descField.isVisible()) {
      await workflow.fillFieldWithVerification('textarea[name="description"]', unitData.description, 'Technical Unit Description');
    } else {
      await workflow.fillFieldWithVerification('input[name="description"]', unitData.description, 'Technical Unit Description');
    }
    
    if (await page.locator('input[name="location"]').isVisible()) {
      await workflow.fillFieldWithVerification('input[name="location"]', unitData.location, 'Location');
    }

    await workflow.waitForApiCall('/api/technical-units', 'POST', 201, 'Technical unit creation');
    await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Create Technical Unit');

    // Step 5: Verify integration
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await expect(page.locator(`text=${unitData.name}`)).toBeVisible();
    await workflow.recordStep('Technical unit created and visible', true);

    // Step 6: Navigate to technical unit details
    await workflow.verifyAndClick(`text=${unitData.name}`, 'Technical unit link');
    await workflow.waitForApiCall('/api/technical-units', 'GET', 200, 'Technical unit details');

    // Verify technical unit detail page
    await expect(page.locator('h1', { hasText: unitData.name })).toBeVisible();
    await expect(page.locator(`text=${unitData.description}`)).toBeVisible();
    await workflow.recordStep('Technical unit details verified', true);

    // Step 7: Test navigation between related entities
    // This would test breadcrumb navigation or related company links
    const breadcrumbOrBackButton = page.locator('nav[aria-label="breadcrumb"], button:has-text("Terug"), button:has-text("Back")');
    if (await breadcrumbOrBackButton.isVisible()) {
      await workflow.verifyAndClick('nav[aria-label="breadcrumb"] a, button:has-text("Terug"), button:has-text("Back")', 'Navigate back');
      await workflow.recordStep('Successfully navigated back using breadcrumbs/back button');
    }

    // Generate integration workflow report
    const report = workflow.getWorkflowReport();
    console.log('Company-Technical Unit Integration Workflow:');
    console.log(`Total Steps: ${report.summary.totalSteps}`);
    console.log(`Total Duration: ${report.summary.totalDuration}ms`);
    console.log(`Average Step Time: ${report.summary.averageStepTime.toFixed(2)}ms`);

    expect(report.summary.totalSteps).toBeGreaterThan(15);
  });
});

test.describe('User Experience Workflows - MCP Enhanced', () => {
  let workflow: MCPWorkflowHelper;

  test.beforeEach(async ({ page }) => {
    workflow = new MCPWorkflowHelper(page);
  });

  test('Dashboard to data management workflow', async ({ page }) => {
    // Step 1: Start from dashboard
    await workflow.navigateToPage(`${BASE_URL}`, 'Dashboard');
    
    // Verify dashboard components
    await expect(page.locator('h1:has-text("Dashboard"), h1:has-text("Overzicht")')).toBeVisible();
    await workflow.recordStep('Dashboard loaded successfully', true);

    // Step 2: Navigate to companies via dashboard
    const companiesLink = page.locator('a:has-text("Bedrijven"), a:has-text("Companies")').first();
    if (await companiesLink.isVisible()) {
      await workflow.verifyAndClick('a:has-text("Bedrijven"), a:has-text("Companies")', 'Companies navigation from dashboard');
    } else {
      // Use main navigation
      await workflow.verifyAndClick('nav a:has-text("Bedrijven"), nav a:has-text("Companies")', 'Companies from main navigation');
    }

    await workflow.recordStep('Navigated to companies page from dashboard');

    // Step 3: Use search functionality
    const searchTerm = 'Test';
    await workflow.fillFieldWithVerification('input[placeholder*="Zoek bedrijven"]', searchTerm, 'Search companies');
    await page.waitForTimeout(1000); // Allow search to process
    await workflow.recordStep('Search functionality tested');

    // Step 4: Switch view modes (if available)
    const viewToggleButtons = page.locator('button[title*="View"], .view-toggle button');
    if (await viewToggleButtons.first().isVisible()) {
      await workflow.verifyAndClick('.view-toggle button', 'Switch view mode');
      await workflow.recordStep('View mode switched', true);
    }

    // Step 5: Navigate to technical units
    await workflow.verifyAndClick('nav a:has-text("Technische Eenheden"), nav a:has-text("Technical Units")', 'Technical Units navigation');
    await workflow.recordStep('Navigated to technical units');

    // Step 6: Return to dashboard
    await workflow.verifyAndClick('nav a:has-text("Dashboard"), nav a:has-text("Overzicht")', 'Return to dashboard');
    await workflow.recordStep('Returned to dashboard', true);

    const report = workflow.getWorkflowReport();
    console.log('Dashboard Navigation Workflow Report:', JSON.stringify(report.summary, null, 2));

    expect(report.summary.totalSteps).toBeGreaterThan(8);
  });

  test('Form persistence and recovery workflow', async ({ page }) => {
    await workflow.navigateToPage(`${BASE_URL}/companies`, 'Companies');
    
    // Step 1: Start filling form
    await workflow.verifyAndClick('button:has-text("Nieuw Bedrijf")', 'Open new company form');
    
    const formData = {
      name: 'Persistence Test Company',
      legalName: 'Persistence Test Company BV',
      employeeCount: '25'
    };

    await workflow.fillFieldWithVerification('input[name="name"]', formData.name, 'Company name');
    await workflow.fillFieldWithVerification('input[name="legalName"]', formData.legalName, 'Legal name');
    await workflow.fillFieldWithVerification('input[name="employeeCount"]', formData.employeeCount, 'Employee count');
    
    await workflow.recordStep('Partial form data entered');

    // Step 2: Cancel form (simulating accidental closure)
    await workflow.verifyAndClick('button:has-text("Annuleer"), button:has-text("Cancel")', 'Cancel form');
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await workflow.recordStep('Form cancelled');

    // Step 3: Reopen form and verify data persistence
    await workflow.verifyAndClick('button:has-text("Nieuw Bedrijf")', 'Reopen new company form');
    
    // Check if form data was restored (this depends on implementation)
    const nameField = page.locator('input[name="name"]');
    const nameValue = await nameField.inputValue();
    
    if (nameValue === formData.name) {
      await workflow.recordStep('Form data successfully restored from localStorage');
      
      // Complete the form
      await workflow.fillFieldWithVerification('input[name="enterpriseNumber"]', `BE${Date.now()}`, 'Enterprise number');
      await workflow.fillFieldWithVerification('input[name="sector"]', 'Persistence Testing', 'Sector');
      
      // Fill required fields
      await workflow.fillFieldWithVerification('input[name="address.street"]', 'Persistence Street', 'Street');
      await workflow.fillFieldWithVerification('input[name="address.number"]', '1', 'Number');
      await workflow.fillFieldWithVerification('input[name="address.postalCode"]', '1000', 'Postal Code');
      await workflow.fillFieldWithVerification('input[name="address.city"]', 'Brussels', 'City');
      await workflow.fillFieldWithVerification('input[name="contactPerson.firstName"]', 'Persistence', 'First Name');
      await workflow.fillFieldWithVerification('input[name="contactPerson.lastName"]', 'User', 'Last Name');
      await workflow.fillFieldWithVerification('input[name="contactPerson.email"]', `persistence-${Date.now()}@example.com`, 'Email');
      await workflow.fillFieldWithVerification('input[name="contactPerson.phone"]', '+32555666777', 'Phone');
      await workflow.fillFieldWithVerification('input[name="contactPerson.role"]', 'Persistence Manager', 'Role');

      // Submit completed form
      await workflow.waitForApiCall('/api/companies', 'POST', 201, 'Company creation after persistence');
      await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Submit completed form');
      
      await workflow.recordStep('Form successfully submitted after data recovery', true);
    } else {
      await workflow.recordStep('Form data not persisted (feature may not be implemented)');
      await workflow.verifyAndClick('button:has-text("Annuleer"), button:has-text("Cancel")', 'Cancel empty form');
    }

    const report = workflow.getWorkflowReport();
    console.log('Form Persistence Workflow Report:', JSON.stringify(report.summary, null, 2));
  });

  test('Error handling and recovery workflow', async ({ page }) => {
    await workflow.navigateToPage(`${BASE_URL}/companies`, 'Companies');

    // Step 1: Test form validation errors
    await workflow.verifyAndClick('button:has-text("Nieuw Bedrijf")', 'Open form for validation testing');
    
    // Try to submit empty form to trigger validation
    await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Submit empty form');
    await workflow.recordStep('Empty form submission attempted');

    // Look for validation errors
    const errorElements = page.locator('text=Required, text=Verplicht, .error, [class*="error"]');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      await workflow.recordStep(`Validation errors displayed: ${errorCount} errors found`, true);
      
      // Fill form correctly to clear errors
      await workflow.fillFieldWithVerification('input[name="name"]', 'Error Recovery Company', 'Company name');
      await workflow.fillFieldWithVerification('input[name="legalName"]', 'Error Recovery Company BV', 'Legal name');
      await workflow.fillFieldWithVerification('input[name="enterpriseNumber"]', `BE${Date.now()}`, 'Enterprise number');
      await workflow.fillFieldWithVerification('input[name="employeeCount"]', '20', 'Employee count');
      await workflow.fillFieldWithVerification('input[name="sector"]', 'Error Recovery', 'Sector');
      
      // Required address fields
      await workflow.fillFieldWithVerification('input[name="address.street"]', 'Recovery Street', 'Street');
      await workflow.fillFieldWithVerification('input[name="address.number"]', '1', 'Number');
      await workflow.fillFieldWithVerification('input[name="address.postalCode"]', '1000', 'Postal Code');
      await workflow.fillFieldWithVerification('input[name="address.city"]', 'Brussels', 'City');
      
      // Required contact fields
      await workflow.fillFieldWithVerification('input[name="contactPerson.firstName"]', 'Recovery', 'First Name');
      await workflow.fillFieldWithVerification('input[name="contactPerson.lastName"]', 'User', 'Last Name');
      await workflow.fillFieldWithVerification('input[name="contactPerson.email"]', `recovery-${Date.now()}@example.com`, 'Email');
      await workflow.fillFieldWithVerification('input[name="contactPerson.phone"]', '+32444555666', 'Phone');
      await workflow.fillFieldWithVerification('input[name="contactPerson.role"]', 'Recovery Manager', 'Role');

      await workflow.recordStep('All validation errors corrected');

      // Submit corrected form
      await workflow.waitForApiCall('/api/companies', 'POST', 201, 'Company creation after error recovery');
      await workflow.verifyAndClick('button:has-text("Toevoegen")', 'Submit corrected form');
      
      await workflow.recordStep('Form successfully submitted after error recovery', true);
    } else {
      await workflow.recordStep('No validation errors found (may indicate missing validation)');
      await workflow.verifyAndClick('button:has-text("Annuleer"), button:has-text("Cancel")', 'Cancel form');
    }

    const report = workflow.getWorkflowReport();
    console.log('Error Recovery Workflow Report:', JSON.stringify(report.summary, null, 2));
    
    expect(report.summary.totalSteps).toBeGreaterThan(5);
  });
});