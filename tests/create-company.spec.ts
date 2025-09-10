import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import CompanyHelper, { CompanyInput } from './helpers/company-helper';

// Extend timeout for UI heavy test
test.setTimeout(60_000);

// Reuse existing JSON fixture
const fixturePath = path.join(__dirname, 'fixtures', 'companies.json');
const companies: CompanyInput[] = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

for (const data of companies) {
  test(`create company: ${data.baseName}` , async ({ page, request }) => {
    const created = await CompanyHelper.createCompany(page, request, { ...data });
    if (created.id) {
      const del = await request.delete(`${CompanyHelper.BASE}/api/companies/${created.id}`);
      expect(del.ok()).toBeTruthy();
    }
  });
}
