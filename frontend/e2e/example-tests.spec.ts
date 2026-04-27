/**
 * Example: How to write additional E2E tests
 * 
 * This file demonstrates patterns for testing other features
 * beyond the deployment flow.
 */

import { test, expect } from '@playwright/test';
import { createMockFreighterProvider, FreighterScenarios } from './mocks/mockFreighter';

test.describe('Example: Dashboard Tests', () => {
  test('should load token dashboard with mock data', async ({ page }) => {
    // Inject mock Freighter
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    
    // Navigate to dashboard
    await page.goto('/dashboard/CABC123');
    
    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: /token dashboard/i })).toBeVisible();
  });
});

test.describe('Example: Allowance Manager Tests', () => {
  test('should create new allowance', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/allowances');
    
    // Connect wallet
    await page.getByRole('button', { name: /connect wallet/i }).click();
    
    // Create allowance
    await page.getByRole('button', { name: /new allowance/i }).click();
    await page.getByLabel('Spender Address').fill('GSPENDER123');
    await page.getByLabel('Amount').fill('1000');
    await page.getByRole('button', { name: /approve/i }).click();
    
    // Verify success
    await expect(page.getByText(/allowance created/i)).toBeVisible();
  });
});

test.describe('Example: Multi-Step Form Pattern', () => {
  test('complete complex workflow', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    
    // 1. Navigate
    await page.goto('/some-feature');
    
    // 2. Connect wallet
    await page.getByRole('button', { name: /connect/i }).click();
    await expect(page.getByText(/connected/i)).toBeVisible();
    
    // 3. Fill form
    await page.getByLabel('Field 1').fill('value1');
    await page.getByLabel('Field 2').fill('value2');
    
    // 4. Submit
    await page.getByRole('button', { name: /submit/i }).click();
    
    // 5. Verify
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});

test.describe('Example: Error Handling Tests', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Use custom mock that simulates failures
    await page.addInitScript(createMockFreighterProvider({
      isInstalled: true,
      isAllowed: true,
      shouldFail: true,
      delay: 100
    }));
    
    await page.goto('/deploy');
    
    // Try to connect - should fail gracefully
    await page.getByRole('button', { name: /connect/i }).click();
    
    // Should show error message, not crash
    await expect(page.getByText(/error|failed|rejected/i)).toBeVisible({
      timeout: 5000
    });
  });
});

test.describe('Example: Responsive Design Tests', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Verify layout adapts
    await expect(page.getByRole('heading', { name: /deploy/i })).toBeVisible();
    
    // Form should still be usable
    await page.getByLabel(/token name/i).fill('Test');
    await expect(page.getByLabel(/token name/i)).toHaveValue('Test');
  });
});

test.describe('Example: State Persistence Tests', () => {
  test('should preserve form data across navigation', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Fill form
    await page.getByLabel(/token name/i).fill('My Token');
    await page.getByLabel(/symbol/i).fill('MTK');
    
    // Navigate away
    await page.goto('/');
    
    // Navigate back
    await page.goto('/deploy');
    
    // Data should persist (if implemented)
    // await expect(page.getByLabel(/token name/i)).toHaveValue('My Token');
  });
});

/**
 * Tips for Writing E2E Tests:
 * 
 * 1. Always inject mock BEFORE page.goto()
 * 2. Use semantic selectors (getByRole, getByLabel)
 * 3. Add explicit waits for async operations
 * 4. Test both happy path and error cases
 * 5. Keep tests independent and isolated
 * 6. Use descriptive test names
 * 7. Don't test implementation details
 */
