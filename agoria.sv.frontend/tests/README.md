# Playwright Test Suite for Agoria.sv Frontend

This directory contains comprehensive Playwright tests for all screens and functionality of the Agoria.sv frontend application, including **advanced MCP (Model Context Protocol) enhanced test suites**.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Run all tests:**
   ```bash
   npm run test:e2e
   ```
   
   Or use the convenience script:
   ```bash
   ./run-tests.sh
   ```

4. **Run MCP Enhanced Tests:**
   ```bash
   ./run-mcp-tests.sh
   npm run test:mcp-suite
   ```

## 📁 Test Files Overview

The test suite includes comprehensive coverage of all application screens:

### Core Functionality Tests
- **`companies.spec.ts`** - Company CRUD operations, search, filtering
- **`company-edit-comprehensive.spec.ts`** - Detailed company editing workflows
- **`company-detail.spec.ts`** - Company detail page interactions
- **`dashboard.spec.ts`** - Dashboard page functionality and UI elements
- **`navigation.spec.ts`** - Main application navigation

### Technical Units Management
- **`technical-units.spec.ts`** - Technical units listing, search, and management
- **`technical-unit-detail.spec.ts`** - Personnel, management, and works council tabs

### Application Features
- **`placeholder-pages.spec.ts`** - Settings, Elections, Candidates, Reports pages
- **`localstorage.spec.ts`** - LocalStorage environment configuration and data persistence

### 🎭 MCP Enhanced Test Suites (NEW)
- **`crud-operations-mcp.spec.ts`** - **150+ enhanced CRUD tests** with MCP features
- **`advanced-mcp-scenarios.spec.ts`** - **Advanced performance and accessibility testing**
- **`integration-workflow-mcp.spec.ts`** - **End-to-end workflow testing with MCP**

See **`MCP-TEST-DOCUMENTATION.md`** for detailed MCP test documentation.

## 🔧 Configuration

### Environment Variables
The tests are configured to use:
- `VITE_API_BASE_URL=https://localhost:3000`
- `VITE_USE_API=false` (for test isolation)

### Playwright Configuration
- **Base URL:** `http://localhost:3000`
- **Browsers:** Chromium, Firefox, WebKit
- **Dev Server:** Automatically starts via `npm run dev`
- **Reports:** HTML report with screenshots and traces

## 🧪 Test Coverage

### Dashboard Page
- Welcome message display
- Statistics cards (Companies, Elections, Candidates, Progress)
- Recent activities section
- Upcoming elections
- Quick actions navigation
- Responsive design

### Companies Management
- Company creation with full form validation
- Company editing and status updates
- Search and filtering functionality
- Company deletion with confirmation
- Navigation to company details
- Data grid interactions

### Technical Units
- Technical unit listing and management
- Personnel management (add, search, import)
- Management/supervisors tab functionality
- Works council member management
- Sub-route navigation (personnel, management, works council)

### LocalStorage Environment
- API configuration override
- User preferences persistence
- Form data draft saving
- Data migration between app versions
- Security considerations (no sensitive data storage)
- Cross-browser context isolation

### Navigation & UI
- Main navigation between pages
- Breadcrumbs navigation
- Mobile responsive design
- Dialog and modal interactions
- Form validation and error handling

## 🎭 Playwright MCP Integration

The tests are designed to work with Playwright MCP (Model Context Protocol) functionality:

- **Environment Configuration:** Uses localStorage for API mocking
- **Test Isolation:** Each test runs in a clean browser context
- **Data Management:** Tests handle both API and localStorage data scenarios
- **Cross-browser Testing:** Runs on Chromium, Firefox, and WebKit

## 📊 Running Specific Tests

Run individual test suites:
```bash
# Dashboard tests only
npx playwright test dashboard.spec.ts

# Companies functionality
npx playwright test companies.spec.ts company-edit-comprehensive.spec.ts

# Technical units management
npx playwright test technical-units.spec.ts technical-unit-detail.spec.ts

# LocalStorage environment tests
npx playwright test localstorage.spec.ts

# MCP Enhanced CRUD tests (NEW)
npm run test:crud-mcp

# Advanced MCP scenarios (NEW)
npm run test:advanced-mcp

# Integration workflow MCP tests (NEW)
npm run test:workflow-mcp

# All MCP tests together (NEW)
npm run test:mcp-suite

# With specific browser
npx playwright test --project=chromium

# In headed mode (visible browser)
npx playwright test --headed

# Generate and view report
npm run test:e2e:report
```

## 🔍 Test Results & Debugging

- **HTML Report:** Generated automatically with test results
- **Screenshots:** Captured on test failures
- **Video Recordings:** Available for failed tests
- **Traces:** Full interaction traces for debugging

View the report:
```bash
npx playwright show-report
```

## 🛠 Troubleshooting

### Browser Installation Issues
If browser installation fails:
```bash
# Try alternative download host
PLAYWRIGHT_DOWNLOAD_HOST=https://github.com/microsoft/playwright npx playwright install

# Or use Docker
docker run --rm -it mcr.microsoft.com/playwright:v1.55.0-focal
```

### Development Server Issues
Ensure the dev server is running on port 3000:
```bash
npm run dev
```

### Environment Variables
Check that `.env` file contains:
```
VITE_API_BASE_URL=https://localhost:3000
VITE_USE_API=false
```

## 📈 Test Statistics

Total Tests: **228 tests** across **9 test files**
- Chromium: 76 tests
- Firefox: 76 tests  
- WebKit: 76 tests

Coverage includes:
- ✅ All major application screens
- ✅ CRUD operations for companies and technical units
- ✅ Form validation and error handling
- ✅ Navigation and routing
- ✅ LocalStorage data management
- ✅ Responsive design testing
- ✅ Cross-browser compatibility