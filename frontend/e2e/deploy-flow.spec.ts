import { test, expect } from '@playwright/test';
import { createMockFreighterProvider, FreighterScenarios } from './mocks/mockFreighter';

/**
 * E2E Test: Critical User Path - Deploy Token
 * 
 * This test covers the complete user journey:
 * 1. Page load
 * 2. Wallet connection (via mock Freighter)
 * 3. Form completion (4 steps)
 * 4. Pre-flight checks
 * 5. Deployment confirmation
 * 
 * Run locally: npm run test:e2e
 * Run in CI: npm run test:e2e:ci
 */
test.describe('Token Deployment Flow', () => {
  test('should complete full deployment flow from page load to confirmation', async ({ page }) => {
    // Inject mock Freighter before page loads
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    
    // Step 1: Navigate to deploy page
    await page.goto('/deploy');
    await expect(page).toHaveURL(/.*deploy/);
    
    // Verify page loaded correctly
    await expect(page.getByRole('heading', { name: /deploy your.*soroban token/i })).toBeVisible();
    
    // Step 2: Connect wallet (button is in navbar)
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await connectButton.click();
    
    // Wait for connection to establish (shows truncated address like "GAAA…AWHF")
    await expect(page.getByTitle(/GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF/)).toBeVisible({
      timeout: 5000
    });
    
    // Step 3: Fill metadata form (Step 1)
    // Input components use name attribute as id
    await page.getByLabel('Token Name').fill('Test Token');
    await page.getByLabel('Symbol').fill('TST');
    await page.getByLabel('Decimals').fill('7');
    
    // Click Continue to go to next step
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Verify we're on Step 2 (Supply)
    await expect(page.getByText('Token Supply')).toBeVisible();
    
    // Step 4: Fill supply config (Step 2)
    await page.getByLabel('Initial Supply').fill('1000000');
    await page.getByLabel('Max Supply').fill('10000000');
    
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Verify we're on Step 3 (Admin)
    await expect(page.getByText('Admin Address')).toBeVisible();
    
    // Step 5: Fill admin address (Step 3)
    const mockWalletAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
    await page.getByLabel('Admin Address').fill(mockWalletAddress);
    
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Verify we're on Step 4 (Review)
    await expect(page.getByText('Review & Deploy')).toBeVisible();
    
    // Step 6: Review the form data
    await expect(page.getByText('Test Token')).toBeVisible();
    await expect(page.getByText('TST')).toBeVisible();
    
    // Step 7: Run pre-flight checks
    const checkButton = page.getByRole('button', { name: /check/i });
    await checkButton.click();
    
    // Wait for pre-flight checks to complete
    await expect(page.getByText(/transaction is ready to sign/i)).toBeVisible({
      timeout: 10000
    });
    
    // Step 8: Deploy the token
    const deployButton = page.getByRole('button', { name: /deploy token/i });
    await expect(deployButton).toBeEnabled();
    await deployButton.click();
    
    // Wait for deployment to complete
    await expect(page.getByText(/deployment simulated/i)).toBeVisible({
      timeout: 10000
    });
    
    // Verify success state
    await expect(page.getByRole('button', { name: /deploy token/i })).toBeDisabled();
  });
  
  test('should validate form fields at each step', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Try to continue without filling required fields
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/token name is required/i)).toBeVisible();
    await expect(page.getByText(/symbol is required/i)).toBeVisible();
  });
  
  test('should handle wallet connection failure gracefully', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.userRejected));
    await page.goto('/deploy');
    
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await connectButton.click();
    
    // Should not show connected state
    await expect(page.getByTitle(/GAAA/)).not.toBeVisible({
      timeout: 3000
    });
  });
  
  test('should show progress bar and track steps correctly', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Verify progress bar exists
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();
    
    // Fill minimal data to advance through steps
    await page.getByLabel('Token Name').fill('Test');
    await page.getByLabel('Symbol').fill('TST');
    await page.getByLabel('Decimals').fill('7');
    
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Token Supply')).toBeVisible();
    
    await page.getByLabel('Initial Supply').fill('1000');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Admin Address')).toBeVisible();
    
    await page.getByLabel('Admin Address').fill('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Review & Deploy')).toBeVisible();
  });
  
  test('should navigate back and forth between steps', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Fill Step 1
    await page.getByLabel('Token Name').fill('My Token');
    await page.getByLabel('Symbol').fill('MTK');
    await page.getByLabel('Decimals').fill('7');
    
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Token Supply')).toBeVisible();
    
    // Go back
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText('Token Metadata')).toBeVisible();
    
    // Verify data persisted
    await expect(page.getByLabel('Token Name')).toHaveValue('My Token');
    await expect(page.getByLabel('Symbol')).toHaveValue('MTK');
  });
});

/**
 * Additional test scenarios for edge cases
 */
test.describe('Deployment Edge Cases', () => {
  test('should handle max supply validation', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Fill Step 1
    await page.getByLabel('Token Name').fill('Test Token');
    await page.getByLabel('Symbol').fill('TST');
    await page.getByLabel('Decimals').fill('7');
    
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Try to set initial supply greater than max supply
    await page.getByLabel('Initial Supply').fill('10000');
    await page.getByLabel('Max Supply').fill('5000');
    
    // Should show validation error
    await expect(page.getByText(/initial supply cannot exceed/i)).toBeVisible();
  });
  
  test('should validate Stellar address format', async ({ page }) => {
    await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
    await page.goto('/deploy');
    
    // Fill Steps 1-2 quickly
    await page.getByLabel('Token Name').fill('Test');
    await page.getByLabel('Symbol').fill('TST');
    await page.getByLabel('Decimals').fill('7');
    await page.getByRole('button', { name: /continue/i }).click();
    
    await page.getByLabel('Initial Supply').fill('1000');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Enter invalid address
    await page.getByLabel('Admin Address').fill('INVALID_ADDRESS');
    
    // Should show validation error
    await expect(page.getByText(/invalid stellar public key/i)).toBeVisible();
  });
});
