# E2E Tests - Quick Reference

## Installation

```bash
npm run test:e2e:install
```

## Running Tests

```bash
# All tests (headless)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# See browser running
npm run test:e2e:headed

# CI mode
npm run test:e2e:ci
```

## View Reports

```bash
npm run test:e2e:report
```

## File Structure

- `deploy-flow.spec.ts` - Main test suite
- `mocks/mockFreighter.ts` - Mock wallet provider
- `playwright.config.ts` - Configuration

## Test Coverage

✅ Page load  
✅ Wallet connection  
✅ Form validation (4 steps)  
✅ Pre-flight checks  
✅ Deployment confirmation  
✅ Error handling  
✅ Navigation (back/forward)  

## Need Help?

See full documentation: [docs/e2e-testing-guide.md](../docs/e2e-testing-guide.md)
