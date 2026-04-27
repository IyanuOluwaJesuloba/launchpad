# E2E Test Debugging Guide

## Common Issues & Solutions

### 1. Tests Won't Run - "next is not recognized"

**Problem:**
```
[WebServer] 'next' is not recognized as an internal or external command
```

**Solution:**
```bash
cd frontend
npm install
```

The dev server can't start because Next.js isn't installed.

---

### 2. Playwright Browsers Not Installed

**Problem:**
```
Executable doesn't exist at ...
```

**Solution:**
```bash
npm run test:e2e:install
```

This installs Chromium, Firefox, and WebKit browsers.

---

### 3. Tests Can't Find Elements

**Problem:**
```
Error: Timed out 5000ms waiting for element
```

**Debugging Steps:**

#### a. Run tests in UI mode (BEST for debugging)
```bash
npm run test:e2e:ui
```

This opens an interactive debugger where you can:
- See exactly what the page looks like
- Inspect the DOM
- Step through test execution
- View console logs

#### b. Run tests in headed mode
```bash
npm run test:e2e:headed
```

Watch the browser execute tests in real-time.

#### c. Add console logging
```typescript
test('my test', async ({ page }) => {
  // Log all console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Log page errors
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // ... rest of test
});
```

#### d. Take screenshots during test
```typescript
test('my test', async ({ page }) => {
  await page.goto('/deploy');
  await page.screenshot({ path: 'debug-1.png' });
  
  // ... do something
  await page.screenshot({ path: 'debug-2.png' });
});
```

---

### 4. Mock Freighter Not Injecting

**Problem:** Wallet connection doesn't work in tests

**Common Mistakes:**

❌ **Wrong - Mock injected AFTER page load:**
```typescript
await page.goto('/deploy');
await page.addInitScript(mock); // TOO LATE!
```

✅ **Correct - Mock injected BEFORE page load:**
```typescript
await page.addInitScript(mock);
await page.goto('/deploy');
```

**Verify Mock is Working:**
```typescript
test('check mock', async ({ page }) => {
  await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
  
  await page.goto('/deploy');
  
  // Check if mock is injected
  const hasMock = await page.evaluate(() => {
    return typeof window.freighterApi !== 'undefined';
  });
  
  console.log('Mock injected:', hasMock);
  expect(hasMock).toBe(true);
});
```

---

### 5. Tests Timeout

**Problem:**
```
Test timeout of 30000ms exceeded
```

**Solutions:**

#### a. Increase timeout for specific test
```typescript
test('slow test', async ({ page }) => {
  // ... test code
}, { timeout: 60000 });
```

#### b. Mark test as slow (3x timeout)
```typescript
test('slow test', async ({ page }) => {
  test.slow();
  // ... test code
});
```

#### c. Reduce mock delays
```typescript
createMockFreighterProvider({
  delay: 50  // Default is 100ms
});
```

---

### 6. Form Selectors Not Working

**Problem:** Can't find input fields

**Understanding the Input Component:**

The Input component uses the `name` attribute as the `id`:

```typescript
// In Input.tsx
<input id={props.id || props.name} ... />
```

So if you have:
```typescript
<Input label="Token Name" {...register("name")} />
```

The HTML will be:
```html
<label for="name">Token Name</label>
<input id="name" name="name" ... />
```

**Correct Selectors:**

✅ **By label (RECOMMENDED):**
```typescript
await page.getByLabel('Token Name').fill('Test');
```

✅ **By role:**
```typescript
await page.getByRole('textbox', { name: 'Token Name' }).fill('Test');
```

✅ **By test id (if added):**
```typescript
<Input data-testid="token-name" ... />
await page.getByTestId('token-name').fill('Test');
```

---

### 7. Wallet Connection Issues

**Problem:** Can't connect wallet in tests

**Check the WalletButton component:**

The button text is:
- "Connect Wallet" (when disconnected)
- "Connecting…" (when loading)
- Shows truncated address when connected (e.g., "GAAA…AWHF")

**Correct Test Code:**

```typescript
// Click connect button
await page.getByRole('button', { name: /connect wallet/i }).click();

// Wait for connection (check by title attribute on address badge)
await expect(page.getByTitle(/GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF/)).toBeVisible({
  timeout: 5000
});
```

---

### 8. Step Navigation Issues

**Problem:** Can't navigate between form steps

**Understanding the Form:**

The form has 4 steps:
1. Token Metadata
2. Token Supply
3. Admin Address
4. Review & Deploy

**Note:** The form does NOT show "Step 1: Metadata" - it shows section headings like "Token Metadata"

**Correct Assertions:**

✅ **Check current step:**
```typescript
await expect(page.getByText('Token Metadata')).toBeVisible();  // Step 1
await expect(page.getByText('Token Supply')).toBeVisible();    // Step 2
await expect(page.getByText('Admin Address')).toBeVisible();   // Step 3
await expect(page.getByText('Review & Deploy')).toBeVisible(); // Step 4
```

❌ **Wrong (these don't exist):**
```typescript
await expect(page.getByText('Step 1: Metadata')).toBeVisible();  // DOESN'T EXIST
await expect(page.getByText('Step 2: Supply')).toBeVisible();    // DOESN'T EXIST
```

---

### 9. Tests Pass Locally but Fail in CI

**Common Causes:**

#### a. Race conditions
```typescript
// ❌ Bad - relies on timing
await page.waitForTimeout(1000);

// ✅ Good - explicit wait
await expect(element).toBeVisible({ timeout: 5000 });
```

#### b. Different screen size
```typescript
// Set consistent viewport
test.use({
  viewport: { width: 1280, height: 720 }
});
```

#### c. Slow CI machines
```typescript
test('ci test', async ({ page }) => {
  test.slow(); // 3x timeout in CI
  // ...
});
```

---

### 10. Viewing Test Results

#### HTML Report
```bash
npm run test:e2e:report
```

Opens a beautiful HTML report with:
- Test results
- Screenshots
- Execution traces

#### Trace Viewer (for failed tests)
```bash
npx playwright show-trace test-results/*/trace.zip
```

Shows step-by-step execution with:
- DOM snapshots
- Network requests
- Console logs
- Screenshots

---

## Debugging Workflow

### Step 1: Run in UI Mode (ALWAYS START HERE)
```bash
npm run test:e2e:ui
```

This is the BEST debugging tool. You can:
- See exactly what the page looks like
- Hover over actions to see DOM state
- Step through test execution
- Inspect console logs

### Step 2: Add Logging
```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('/deploy');
  console.log('Page title:', await page.title());
});
```

### Step 3: Take Screenshots
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/deploy');
  await page.screenshot({ path: 'step1.png' });
  
  await page.getByRole('button', { name: /connect wallet/i }).click();
  await page.screenshot({ path: 'step2.png' });
});
```

### Step 4: Check if Elements Exist
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/deploy');
  
  // Check if button exists
  const buttonCount = await page.getByRole('button').count();
  console.log('Total buttons:', buttonCount);
  
  // List all buttons
  const buttons = await page.getByRole('button').all();
  for (const btn of buttons) {
    console.log('Button:', await btn.textContent());
  }
});
```

### Step 5: Verify Mock Injection
```typescript
test('debug test', async ({ page }) => {
  await page.addInitScript(createMockFreighterProvider(FreighterScenarios.connected));
  
  await page.goto('/deploy');
  
  const mockExists = await page.evaluate(() => {
    return {
      hasFreighterApi: typeof window.freighterApi !== 'undefined',
      hasFreighter: typeof window.freighter !== 'undefined',
    };
  });
  
  console.log('Mock status:', mockExists);
});
```

---

## Quick Reference: Correct Selectors

### Navbar Elements
```typescript
// Connect Wallet button
page.getByRole('button', { name: /connect wallet/i })

// Connected wallet address (truncated)
page.getByTitle(/GAAA.*AWHF/)

// Disconnect button
page.getByRole('button', { name: /disconnect/i })
```

### Form Fields (Step 1 - Metadata)
```typescript
page.getByLabel('Token Name')
page.getByLabel('Symbol')
page.getByLabel('Decimals')
page.getByLabel('Description (optional)')
```

### Form Fields (Step 2 - Supply)
```typescript
page.getByLabel('Initial Supply')
page.getByLabel('Max Supply')
```

### Form Fields (Step 3 - Admin)
```typescript
page.getByLabel('Admin Address')
```

### Navigation Buttons
```typescript
page.getByRole('button', { name: /continue/i })
page.getByRole('button', { name: /back/i })
page.getByRole('button', { name: /check/i })
page.getByRole('button', { name: /deploy token/i })
```

### Section Headings
```typescript
page.getByText('Token Metadata')      // Step 1
page.getByText('Token Supply')        // Step 2
page.getByText('Admin Address')       // Step 3
page.getByText('Review & Deploy')     // Step 4
```

---

## Common Error Messages

### "Timed out 5000ms waiting for element"
- Element doesn't exist with that selector
- Element isn't visible yet
- Mock not injected properly

**Fix:** Use UI mode to inspect the page

### "Element is not visible"
- Element is hidden/offscreen
- Wrong selector
- Need to scroll or navigate first

**Fix:** Check if you're on the right step/page

### "Target closed"
- Page was closed during test
- Navigation happened unexpectedly

**Fix:** Check for unexpected redirects

### "Execution context was destroyed"
- Page reloaded during test
- Frame was removed

**Fix:** Wait for page to stabilize before interacting

---

## Pro Tips

1. **ALWAYS start with UI mode** - `npm run test:e2e:ui`
2. **Use semantic selectors** - `getByRole`, `getByLabel` over CSS
3. **Be explicit with waits** - Don't use `waitForTimeout`
4. **Test one thing per test** - Keep tests focused
5. **Use descriptive names** - `should validate token name` not `test1`
6. **Check the actual HTML** - Look at component code to understand structure
7. **Verify mocks early** - Add console.log to check if mocks injected
8. **Use trace viewer** - Best tool for debugging failed tests

---

## Need More Help?

1. Check the Playwright docs: https://playwright.dev
2. View test report: `npm run test:e2e:report`
3. Run in UI mode: `npm run test:e2e:ui`
4. Check console logs in headed mode: `npm run test:e2e:headed`
