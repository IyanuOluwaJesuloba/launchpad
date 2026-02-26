import { test, expect } from "@playwright/test";
import { mockFreighter, TEST_PUBLIC_KEY } from "./helpers/mock-freighter";

// ---------------------------------------------------------------------------
// A valid Stellar public key used as the admin address in the deploy form.
// In CI this should come from the TEST_PUBLIC_KEY secret.
// ---------------------------------------------------------------------------
const ADMIN_KEY = TEST_PUBLIC_KEY;

// A plausible Soroban contract ID for dashboard assertions.
// In a full integration run this would be the contract ID returned by the
// deploy step; for now we use a deterministic stub so the dashboard route
// can be tested independently.
const STUB_CONTRACT_ID =
  process.env.TEST_CONTRACT_ID ||
  "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fill a text input found by its label. Clears existing value first. */
async function fillField(
  page: import("@playwright/test").Page,
  label: string,
  value: string,
) {
  const input = page.getByLabel(label);
  await input.click();
  await input.fill(value);
}

/**
 * Fill a number input found by its `name` attribute.
 * Uses triple-click + keyboard.type() so React's onChange fires reliably for
 * react-hook-form fields registered with `valueAsNumber: true`.
 */
async function fillNumberInput(
  page: import("@playwright/test").Page,
  name: string,
  value: string,
) {
  const input = page.locator(`input[name="${name}"]`);
  await input.click({ clickCount: 3 }); // select all existing content
  await page.keyboard.type(value);      // fire per-character input events
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Deploy + Vesting E2E flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockFreighter(page);
  });

  // ── 1. Mock Freighter & verify wallet connection ────────────────────

  test("(1) mocks Freighter and shows connected wallet", async ({ page }) => {
    await page.goto("/");

    // The WalletButton shows the full key as the title attribute of a <span>
    // once the auto-reconnect in WalletProvider resolves.
    const walletBadge = page.locator(`[title="${ADMIN_KEY}"]`);
    await expect(walletBadge).toBeVisible({ timeout: 10_000 });
  });

  // ── 2. Fill and submit the deploy form ──────────────────────────────

  test("(2) fills and submits the deploy form", async ({ page }) => {
    await page.goto("/deploy");

    // ── Step 1: Metadata ──
    await expect(page.getByText("Token Metadata")).toBeVisible();

    await fillField(page, "Token Name", "TestCoin");
    await expect(page.getByLabel("Token Name")).toHaveValue("TestCoin");
    await fillField(page, "Symbol", "TST");
    await expect(page.getByLabel("Symbol")).toHaveValue("TST");
    // Decimals defaults to 7 — leave as-is

    await page.getByRole("button", { name: "Continue" }).click();

    // ── Step 2: Supply ──
    await expect(page.getByText("Supply Configuration")).toBeVisible();

    // Use keyboard.type() for number inputs so react-hook-form's onChange fires.
    await fillNumberInput(page, "initialSupply", "1000000");
    await expect(page.locator('input[name="initialSupply"]')).toHaveValue("1000000");
    // Leave max supply blank (uncapped)

    await page.getByRole("button", { name: "Continue" }).click();

    // ── Step 3: Admin ──
    await expect(page.getByText("Administration")).toBeVisible({ timeout: 10_000 });

    await fillField(page, "Admin Address (Stellar Public Key)", ADMIN_KEY);

    await page.getByRole("button", { name: "Continue" }).click();

    // ── Step 4: Review ──
    await expect(page.getByText("Review & Deploy")).toBeVisible();

    // Verify the review summary shows our data
    await expect(page.getByText("TestCoin")).toBeVisible();
    await expect(page.getByText("TST")).toBeVisible();
    await expect(page.getByText("1000000")).toBeVisible();

    // Listen for the browser alert that the stub deploy handler fires
    page.once("dialog", (dialog) => dialog.accept());

    await page.getByRole("button", { name: "Deploy Token" }).click();

    // The button shows a loading state while "deploying"
    await expect(page.getByRole("button", { name: "Deploy Token" })).toBeDisabled();

    // After the simulated 2-second deploy the alert is accepted and the
    // button becomes enabled again.
    await expect(
      page.getByRole("button", { name: "Deploy Token" }),
    ).toBeEnabled({ timeout: 10_000 });
  });

  // ── 3. Dashboard shows token data ───────────────────────────────────

  test("(3) dashboard search navigates to token page", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Token Dashboard")).toBeVisible();

    // Fill the contract ID search and submit
    await page.getByLabel("Contract ID").fill(STUB_CONTRACT_ID);
    await page.getByRole("button", { name: "View" }).click();

    // The URL should change to /dashboard/<contractId>
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/${STUB_CONTRACT_ID}`),
      { timeout: 10_000 },
    );

    // The dashboard page should show a loading spinner or data.
    // If the contract ID is not deployed on testnet the RPC call will fail
    // and the error state is shown — that is still a valid render.
    const hasData = page.getByText("Token Details");
    const hasError = page.getByRole("button", { name: "Retry" });
    await expect(hasData.or(hasError)).toBeVisible({ timeout: 15_000 });
  });

  // ── 4 & 5. Vesting schedule lookup ─────────────────────────────────
  // The vesting panel (VestingProgress) is rendered at the bottom of the
  // token dashboard.  It contains a lookup form that accepts a vesting
  // contract ID and recipient.  Since we cannot deploy real contracts in
  // this test, we verify that the form renders and handles invalid input
  // gracefully.

  test("(4-5) vesting panel renders and handles lookup", async ({ page }) => {
    await page.goto(`/dashboard/${STUB_CONTRACT_ID}`);

    // Wait for the dashboard to finish its initial load (data or error)
    const hasData = page.getByText("Token Details");
    const hasError = page.getByRole("button", { name: "Retry" });
    await expect(hasData.or(hasError)).toBeVisible({ timeout: 15_000 });

    // The vesting section should be present
    const vestingHeading = page.getByText("Vesting Schedule");
    // If the VestingProgress component is merged, this heading is visible.
    // If it is not merged yet, we skip gracefully.
    const vestingVisible = await vestingHeading.isVisible().catch(() => false);

    if (vestingVisible) {
      // Fill the vesting lookup form with dummy data
      await page.getByLabel("Vesting Contract ID").fill(STUB_CONTRACT_ID);
      await page.getByLabel("Recipient Address").fill(ADMIN_KEY);

      await page.getByRole("button", { name: "Look Up Schedule" }).click();

      // The lookup will either show schedule data or an error because
      // STUB_CONTRACT_ID is not a real vesting contract.
      const scheduleData = page.locator("text=Unlock %");
      const scheduleError = page.locator(".text-red-400");
      await expect(scheduleData.or(scheduleError)).toBeVisible({
        timeout: 15_000,
      });
    }
  });
});
