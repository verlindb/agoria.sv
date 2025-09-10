import { test } from '@playwright/test';
import CompanyHelper from './company-helper';

// Internal registry of created company IDs for current test run scope.
const createdCompanyIds: string[] = [];

/** Register a company id for deletion after the current test. */
export function trackCompany(id: string | null | undefined) {
  if (id) createdCompanyIds.push(id);
}

// After each test, delete any companies we created (best-effort cleanup)
test.afterEach(async ({ request }) => {
  if (!createdCompanyIds.length) return;
  for (const id of createdCompanyIds) {
    try {
      await request.delete(`${CompanyHelper.BASE}/api/companies/${id}`);
    } catch {
      // ignore
    }
  }
  createdCompanyIds.length = 0;
});
