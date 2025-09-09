## Playwright / frontend-backend proxy investigation

This document summarises the work performed while investigating why the Vite dev proxy appeared not to be used and records the Playwright test runs and next steps.

### What I inspected
- `agoria.sv.frontend/vite.config.ts` — dev server and proxy configuration
- Frontend HTTP helpers and services that build fetch URLs (files under `src/services/*`)
- `tests/create-company.spec.ts` — Playwright test that creates a company and deletes it in cleanup
- Repository `.env` and other environment config

### Commands run
- Searched repository for `BACKEND_URL`, `VITE_API_BASE_URL`, and `/api` usage
- Ran Playwright for the single test file:
  - `npx playwright test tests/create-company.spec.ts` — result: 3 passed, 0 failed

### Key findings
- `vite.config.ts` uses `process.env.BACKEND_URL ?? 'http://localhost:52791'` as the proxy target.
- Frontend HTTP helper uses `import.meta.env?.VITE_API_BASE_URL || ''` as the API base. When `VITE_API_BASE_URL` is set (for example in `.env`), the frontend builds absolute URLs and bypasses the Vite proxy.
- `.env` in the frontend contains `VITE_API_BASE_URL=http://localhost:52791` (observed in repo), so client fetches go directly to the backend rather than through the dev server proxy.

Evidence snippet from service helper:

```ts
function getApiBase(): string { return import.meta.env?.VITE_API_BASE_URL || ''; }
// later: fetch(`${getApiBase()}${path}`)
```

And the highlighted cleanup in `tests/create-company.spec.ts`:

```ts
const del = await request.delete(`${BASE}/api/companies/${created.id}`);
expect(del.ok()).toBeTruthy();
```

Note: If `BASE` points to `http://localhost:3000` the DELETE relies on the frontend/proxy; if `BASE` points to backend port the test calls backend directly.

### Recommended fixes
Choose one of the following options:

- Option A — Use proxy (recommended for dev):
  - Unset `VITE_API_BASE_URL` during frontend dev so `getApiBase()` returns `''` and requests become relative (`/api/...`), allowing Vite proxy to forward them.
  - Start the frontend with `BACKEND_URL` set to the backend HTTP address if you keep the proxy target logic in `vite.config.ts`.

- Option B — Make env usage consistent:
  - Change `vite.config.ts` to read `VITE_API_BASE_URL` (or set both `BACKEND_URL` and `VITE_API_BASE_URL`) so the proxy and client use the same setting.

- Option C — Accept direct backend calls:
  - Keep `VITE_API_BASE_URL` set and ensure backend CORS allows requests from the frontend origin (`http://localhost:3000`). No dev proxy used.

### Quick reproduction / debug commands (PowerShell)
```powershell
# start frontend with explicit backend for proxy
$env:BACKEND_URL='http://localhost:52791'; npm run dev --prefix agoria.sv.frontend

# run the Playwright test with BASE set for the test harness
$env:BASE='http://localhost:3000'; npx playwright test tests/create-company.spec.ts --headed

# run single test file
npx playwright test tests/create-company.spec.ts
```

### Next steps I can do for you
- Apply Option A or B to the repo and verify `/api` requests are proxied through Vite.
- Add a short note to the frontend README describing expected dev env vars.
- Add a `.vscode/launch.json` and `tasks.json` to simplify running the Playwright tests from VS Code.

If you want me to apply a change directly, tell me which option to use and I'll create the commit.

### What the Playwright tests do

Below is a concise, step-by-step description of the behaviour implemented in `tests/create-company.spec.ts` (the file attached and used in this investigation).

- Test parametrisation
  - The test reads a fixture file `tests/fixtures/companies.json` and iterates over each company dataset.

- For each company dataset the test performs:
  1. Navigate to `${BASE}/companies` where `BASE` is read from the `BASE` environment variable (defaults to `http://localhost:3000`).
 2. Wait for network idle and open the "Nieuw Bedrijf" (New Company) dialog.
 3. Fill the company form fields: name, legal name, enterprise number placeholder (generated BE + 10 digits), company type, number of employees, sector, address fields, and contact person details (name, email, phone, function).
 4. Submit the form by clicking the "Toevoegen" button and wait for the dialog to close.
 5. Search for the created company in the UI using the app's search input and assert the company name is visible in the results.

- API interaction and cleanup
  - After creating the company via the UI the test uses Playwright's `request` fixture to call the backend search API (`GET ${BASE}/api/companies/search?q=...`) to resolve the created company's ID.
  - If an ID is found the test issues a DELETE to `${BASE}/api/companies/{id}` using `request.delete(...)` and asserts the delete response `ok()` is truthy — this cleans up the created test data.

- Assertions and timing
  - Dialog visibility, search visibility, and API responses are asserted with timeouts (dialog wait 15s, search result wait 20s, test timeout set to 60s) to account for UI latency.

- Important environment considerations
  - If `BASE` points at the frontend origin (default `http://localhost:3000`), the DELETE and search API calls rely on the frontend dev server and (optionally) its proxy rules; if `BASE` points directly to a backend port the tests call the API directly.
  - For consistent behaviour in development use cases, match `BASE`, `VITE_API_BASE_URL`, and the Vite proxy configuration as described in this summary.

