# E2E Testing Guide

This guide covers how to run and maintain End-to-End (E2E) tests for the Soroban Token Launchpad.

## Overview

The E2E test suite uses **Playwright** to test the critical user path:
- **Connect wallet** → **Fill form** → **Deploy token**

Tests use a **mocked Freighter provider** that simulates wallet operations without requiring the actual browser extension.

## Quick Start

### 1. Install Playwright Browsers

```bash
cd frontend
npm run test:e2e:install
```

This installs Chromium, Firefox, and WebKit browsers with their dependencies.

### 2. Run Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests for CI
npm run test:e2e:ci
```

### 3. View Test Reports

```bash
# Open HTML report after running tests
npm run test:e2e:report
```

## Test Structure

```
frontend/
├── e2e/
│   ├── mocks/
│   │   └── mockFreighter.ts    # Mock Freighter API provider
│   └── deploy-flow.spec.ts     # E2E test specs
├── playwright.config.ts         # Playwright configuration
└── package.json                 # Contains test scripts
```

## Mock Freighter Provider

The mock provider (`e2e/mocks/mockFreighter.ts`) simulates the Freighter wallet API:

### Available Scenarios

```typescript
import { FreighterScenarios } from './mocks/mockFreighter';

// Happy path - wallet connected
FreighterScenarios.connected

// Wallet not installed
FreighterScenarios.notInstalled

// User rejected connection
FreighterScenarios.userRejected

// Different test wallet
FreighterScenarios.testWallet2
```

### Custom Mock Configuration

```typescript
import { createMockFreighterProvider } from './mocks/mockFreighter';

await page.addInitScript(createMockFreighterProvider({
  publicKey: 'GCUSTOM...',
  isInstalled: true,
  isAllowed: true,
  delay: 200, // ms
  shouldFail: false,
}));
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createMockFreighterProvider, FreighterScenarios } from './mocks/mockFreighter';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // 1. Inject mock before page loads
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    
    // 2. Navigate to page
    await page.goto('/deploy');
    
    // 3. Interact with UI
    await page.getByLabel('Token name').fill('My Token');
    
    // 4. Assert expected behavior
    await expect(page.getByText('My Token')).toBeVisible();
  });
});
```

### Testing the Full Deployment Flow

```typescript
test('complete deployment flow', async ({ page }) => {
  await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
  await page.goto('/deploy');
  
  // Connect wallet
  await page.getByRole('button', { name: /connect wallet/i }).click();
  
  // Fill form (4 steps)
  await page.getByLabel(/token name/i).fill('Test Token');
  await page.getByLabel(/symbol/i).fill('TST');
  // ... continue through steps
  
  // Run pre-flight checks
  await page.getByRole('button', { name: /check/i }).click();
  
  // Deploy
  await page.getByRole('button', { name: /deploy token/i }).click();
  
  // Verify success
  await expect(page.getByText(/deployment simulated/i)).toBeVisible();
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### GitHub Actions Workflow

See `.github/workflows/e2e-tests.yml` for the full configuration.

The workflow:
1. Installs dependencies
2. Installs Playwright browsers
3. Runs tests in headless mode
4. Uploads test reports and traces

### Test Artifacts

- **HTML Report**: Available for 30 days
- **Test Traces**: Uploaded on failure (7 days)

## Debugging Tests

### 1. Use UI Mode

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- Run individual tests
- See step-by-step execution
- Inspect DOM snapshots
- View network requests

### 2. Run in Headed Mode

```bash
npm run test:e2e:headed
```

Watch the browser execute your tests in real-time.

### 3. View Traces on Failure

When tests fail, traces are automatically captured. View them:

```bash
npx playwright show-trace test-results/*/trace.zip
```

### 4. Add Console Logging

```typescript
test('my test', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  // ... rest of test
});
```

## Common Patterns

### Waiting for Elements

```typescript
// Wait for element to be visible
await expect(page.getByText('Success')).toBeVisible({ timeout: 5000 });

// Wait for element to be enabled
await expect(button).toBeEnabled();

// Wait for navigation
await page.waitForURL(/\/dashboard/);
```

### Form Interaction

```typescript
// Fill input
await page.getByLabel('Token name').fill('My Token');

// Select dropdown
await page.selectOption('#network', 'testnet');

// Click button
await page.getByRole('button', { name: 'Continue' }).click();
```

### Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();

// Text content
await expect(element).toContainText('Expected text');
await expect(element).toHaveText('Exact text');

// Form values
await expect(input).toHaveValue('test value');

// Enabled/disabled
await expect(button).toBeEnabled();
await expect(button).toBeDisabled();
```

## Troubleshooting

### Tests Fail Locally

1. **Ensure dev server is running**:
   ```bash
   npm run dev
   ```

2. **Clear browser state**:
   ```bash
   rm -rf playwright/.cache
   ```

3. **Reinstall browsers**:
   ```bash
   npm run test:e2e:install
   ```

### Tests Timeout

Increase timeout in test:

```typescript
test('slow test', async ({ page }) => {
  test.slow(); // 3x timeout
  // ...
}, { timeout: 60000 });
```

### Mock Not Injecting

Ensure `addInitScript` is called **before** `page.goto()`:

```typescript
// ✅ Correct
await page.addInitScript(mock);
await page.goto('/deploy');

// ❌ Wrong
await page.goto('/deploy');
await page.addInitScript(mock);
```

### Flaky Tests

1. Use explicit waits instead of `setTimeout`:
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(1000);
   
   // ✅ Good
   await expect(element).toBeVisible({ timeout: 5000 });
   ```

2. Reduce mock delays:
   ```typescript
   createMockFreighterProvider({ delay: 50 })
   ```

3. Use retries in CI (already configured):
   ```typescript
   retries: process.env.CI ? 2 : 0
   ```

## Best Practices

1. **Test user journeys, not implementation details**
   - Test what users do, not how the code works

2. **Use semantic selectors**
   - `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors

3. **Keep tests independent**
   - Each test should work in isolation

4. **Mock external dependencies**
   - Use mock Freighter, don't rely on real wallet

5. **Test edge cases**
   - Validation errors, network failures, user rejections

6. **Don't test everything with E2E**
   - Use unit tests for logic, E2E for critical paths

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Contributing

When adding new E2E tests:

1. Follow the existing test structure
2. Use the mock Freighter provider
3. Test critical user paths
4. Add descriptive test names
5. Update this guide if adding new patterns

Run the full test suite before submitting PR:

```bash
npm run test:e2e:ci
```
