#!/bin/bash
# Script to run all Playwright tests once browsers are installed

echo "🎭 Agoria.sv Frontend Playwright Test Runner"
echo "============================================="
echo ""

# Check if Playwright browsers are installed
if ! npx playwright install-deps > /dev/null 2>&1; then
    echo "⚠️  Installing Playwright system dependencies..."
    npx playwright install-deps
fi

# Try to install browsers
echo "📥 Installing Playwright browsers..."
if npx playwright install; then
    echo "✅ Browsers installed successfully!"
else
    echo "❌ Browser installation failed. You may need to:"
    echo "   - Check your internet connection"
    echo "   - Try: PLAYWRIGHT_DOWNLOAD_HOST=https://github.com/microsoft/playwright npx playwright install"
    echo "   - Or use Docker: docker run --rm -it mcr.microsoft.com/playwright:v1.55.0-focal"
    exit 1
fi

echo ""
echo "🏃 Running all Playwright tests..."
echo "Tests created cover:"
echo "  📊 Dashboard page (dashboard.spec.ts)"
echo "  🏢 Companies management (companies.spec.ts, company-edit-comprehensive.spec.ts)" 
echo "  🏭 Technical Units (technical-units.spec.ts, technical-unit-detail.spec.ts)"
echo "  📄 Company Details (company-detail.spec.ts)"
echo "  🧭 Navigation (navigation.spec.ts)"
echo "  🗃️  LocalStorage environment (localstorage.spec.ts)"
echo "  ⚙️  Settings, Elections, Candidates, Reports (placeholder-pages.spec.ts)"
echo ""

# Run the tests
npm run test:e2e

echo ""
echo "📊 Test Results Summary:"
echo "========================"
npx playwright show-report