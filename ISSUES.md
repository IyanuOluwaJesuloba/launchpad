# 📋 GitHub Issues — Soroban Token Launchpad

Complexity levels match the Stellar Wave Program on Drips:

- 🟢 **Trivial** (100 pts) — Small, well-defined, great for first-timers
- 🟡 **Medium** (150 pts) — Standard features or involved bug fixes
- 🔴 **High** (200 pts) — Complex features, integrations, or refactors

---

## Contracts

### #1 — Implement `freeze_account` in token contract

🟡 **Medium** · `contracts` `good first issue`

Add admin-only `freeze_account(address)` and `unfreeze_account(address)` functions to the token contract. Frozen addresses should be blocked from calling `transfer`. Add `is_frozen(address) → bool` getter and unit tests covering freeze, blocked transfer, and unfreeze.

---

### #2 — Add two-step admin ownership transfer

🟡 **Medium** · `contracts` `security`

Replace the current instant `set_admin` with a two-step pattern: `propose_admin(new_admin)` stores a pending admin, and `accept_admin()` must be called by the new admin to confirm. Prevents accidental admin lockout. Include tests for both the happy path and rejection cases.

---

### #3 — Implement `revoke()` in vesting contract

🔴 **High** · `contracts` `vesting`

Implement admin-only `revoke(recipient)`. On revoke: calculate the vested amount so far and transfer it to the recipient; return the unvested remainder to the admin/treasury. Emit a `REVOKE` event. Cover edge cases: full vest, no vest, mid-cliff revoke.

---

### #4 — Enforce `max_supply` cap in `mint`

🟢 **Trivial** · `contracts` `good first issue`

Add an optional `max_supply: Option<i128>` to token initialization. The `mint` function should fail with a descriptive error if minting would exceed `max_supply`. Add a `max_supply() → Option<i128>` getter and tests for the boundary.

---

### #5 — Emit structured events for all state-changing operations

🟡 **Medium** · `contracts` `events`

Audit both token and vesting contracts. Every state-changing function should emit a typed Soroban event with consistent topic + data structure. Document the full event schema in `docs/events.md`.

---

### #6 — Write fuzz/property tests for token arithmetic

🟡 **Medium** · `contracts` `testing`

Write property-based tests for `mint`, `burn`, and `transfer` that cover `i128` overflow/underflow, zero-amount edge cases, and sequential operations. Document the invariants that must always hold (e.g. `sum of all balances == total_supply`).

---

## Frontend

### #7 — Build multi-step token deployment form

🟡 **Medium** · `frontend` `good first issue`

Create the `/deploy` page with a 4-step form: (1) token metadata, (2) supply config, (3) admin address, (4) review + deploy. Use `react-hook-form` + `zod` for validation. Show a progress bar between steps. Disable the Deploy button until all steps are valid.

---

### #8 — Implement Freighter wallet connect/disconnect

🟢 **Trivial** · `frontend` `wallet` `good first issue`

Integrate `@stellar/freighter-api`. Build a `useWallet` hook exposing: `connected`, `publicKey`, `connect()`, `disconnect()`, `signTransaction()`. Add a wallet button in the navbar showing a truncated address when connected and a "Connect Wallet" CTA when not.

---

### #9 — Build token dashboard page

🔴 **High** · `frontend` `dashboard`

Build `/dashboard/[contractId]`. Fetch and display: token name/symbol/decimals, total supply, circulating supply, admin address, and contract ID (with copy button). Query Horizon for top holders and render a sortable table with address, balance, and % share.

---

### #10 — Add vesting schedule creation form

🟡 **Medium** · `frontend` `vesting`

Add a form in the admin panel to create a new vesting schedule. Inputs: recipient address, total amount, cliff (days), vesting duration (days). Convert days → ledger numbers using ~5s estimated close time. Submit via the vesting contract client.

---

### #11 — Visualize vesting progress per schedule

🟡 **Medium** · `frontend` `vesting` `charts`

For each vesting schedule in the dashboard, render: a progress bar (`released / total`), and a timeline showing cliff date, end date, and current position. Calculate unlock % from the current ledger number fetched from Soroban RPC.

---

### #12 — Add Testnet / Mainnet network switcher

🟢 **Trivial** · `frontend` `good first issue`

Add a network toggle to the navbar. On switch, update the Soroban RPC and Horizon URLs used across the app. Persist the selection to `localStorage`. Show a warning banner when Mainnet is active.

---

### #13 — Build admin panel (mint, burn, transfer admin)

🟡 **Medium** · `frontend` `admin`

Add a panel only visible when the connected wallet matches the token admin address. Include three forms: mint to an address, burn from an address, and transfer admin (with a confirmation dialog). Submit each via signed Soroban transactions.

---

### #14 — Add transaction history feed

🟡 **Medium** · `frontend` `dashboard`

Query Horizon `/accounts/{id}/operations` to display a paginated feed of token activity (mint, transfer, burn). Show: type, amount, from/to addresses, timestamp, and a link to Stellar Expert. Auto-refresh every 30 seconds.

---

### #15 — Create shareable public token page

🟢 **Trivial** · `frontend` `good first issue`

Add a `/token/[contractId]` public route showing token info without requiring wallet connection. Generate Open Graph meta tags so sharing the URL on social shows the token name and supply in the link preview.

---

### #21 — Implement "Revoke" button in Admin UI

🟡 **Medium** · `frontend` `admin`

Add a "Revoke" button to the admin panel for each vesting schedule. When clicked, it should call the `revoke` function on the vesting contract. This button should only be enabled if the schedule is not already revoked. Show a confirmation dialog before executing.

---

### #22 — Add "Total Burned" & "Circulating Supply" charts

🔴 **High** · `frontend` `dashboard` `charts`

Implement a visual breakdown of token supply on the dashboard. Use a charting library (like `recharts`) to display a pie or donut chart showing: Circulating Supply, Locked (Vesting) Supply, and Total Burned. Fetch data from both the token and vesting contracts.

---

### #23 — Add CSV Export for Top Holders list

🟢 **Trivial** · `frontend` `dashboard`

Add an "Export CSV" button above the Top Holders table. When clicked, it should generate and download a CSV file containing the list of addresses, balances, and percentage shares currently displayed in the table.

---

### #24 — Custom RPC & Horizon URL Settings

🟡 **Medium** · `frontend` `settings`

Create a settings modal or page where users can input custom Soroban RPC and Horizon URLs. This allows power users to connect to their own nodes. Validate the URLs before saving and persist them to `localStorage`.

---

### #25 — Add "Copy to Clipboard" for all IDs/Hashes

🟢 **Trivial** · `frontend` `good first issue` `ux`

Audit the dashboard and admin panel for all contract IDs, wallet addresses, and transaction hashes. Add a small "Copy" icon/button next to each that copies the value to the clipboard and shows a brief "Copied!" toast or tooltip notification.

---

### #26 — Implement Token Transfer Form for Regular Users

🟡 **Medium** · `frontend` `core`

Add a "Transfer Tokens" panel to the dashboard side-nav for regular users (not just admins). This allows any connected wallet with a balance to transfer tokens to another address. Include a standard form with destination address and amount, validating against their current balance.

---

### #27 — Personal Dashboard ("My Account" View)

🟡 **Medium** · `frontend` `dashboard`

Create a dedicated view where users can see their personal interaction with the token: their current balance, unreleased vested tokens, and their personal transaction history isolated from the global feed.

---

### #28 — UI for Token Allowances (Approve / Transfer-From)

🔴 **High** · `frontend` `core`

Implement the allowance management part of SEP-41. Build a UI where users can grant an allowance to a spender address, view their active allowances, and revoke them. Also allow users to execute a `transfer_from` if they have been granted an allowance by someone else.

---

### #29 — "Claim Vesting" Page for Recipients

🟡 **Medium** · `frontend` `vesting`

Add a route (`/claim`) or a modal where beneficiaries of a vesting schedule can view their unlocked amount and click a "Release" button. This calls the `release()` function on the vesting contract to transfer the vested tokens to their wallet.

---

### #30 — Simulate Transactions Before Signing (Pre-flight Checks)

🔴 **High** · `frontend` `ux` `rpc`

Integrate Soroban RPC's `simulateTransaction` endpoint to perform pre-flight checks on all forms (Mint, Transfer, Deploy) before prompting Freighter to sign. Catch and display human-readable error messages for common failures (e.g., "Max supply exceeded" or "Insufficient balance") instead of generic contract panics.

---

### #31 — "Batch Mint" Feature in Admin Panel

🟡 **Medium** · `frontend` `admin`

Enhance the Admin Mint panel with a "Batch Mint" option. Allow admins to paste a comma-separated list of (Address, Amount) pairs or upload a basic CSV file, then execute a batch of mint operations in a customized Soroban transaction or sequentially.

---

### #32 — Pagination and Search for Top Holders Table

🟡 **Medium** · `frontend` `dashboard`

The current Top Holders table on the dashboard will grow too large for a single view. Add simple pagination (e.g., 10 rows per page) and a search bar to instantly filter the list for a specific wallet address.

---

### #33 — User-initiated Token Burn Form

🟢 **Trivial** · `frontend` `core`

SEP-41 allows any user to burn their own tokens. Add a simple "Burn Tokens" option in the personal dashboard area. Include a prominent warning that this action is irreversible and permanently removes the tokens from total supply.

---

### #34 — Add Stellar Expert Block Explorer Links

🟢 **Trivial** · `frontend` `ux`

Provide one-click outbound links to [Stellar Expert](https://stellar.expert) anywhere a Contract ID, Public Key, or Transaction Hash appears in the dashboard, so users can easily verify on-chain data.

---

## DevEx & Tooling

### #16 — Write CLI deployment script with flags

🟡 **Medium** · `devex` `scripts`

Write `scripts/deploy.ts` wrapping `soroban-cli`. Accepts `--network`, `--admin`, `--name`, `--symbol`, `--supply`, `--max-supply`. On success, outputs the contract ID and writes it to `.env.local`. Add usage documentation to `docs/deploy.md`.

---

### #17 — Set up GitHub Actions CI pipeline

🟡 **Medium** · `devex` `ci`

Configure a GitHub Actions workflow that on every PR: (1) builds both Rust contracts, (2) runs Soroban unit tests, (3) runs frontend lint + type check, (4) runs Jest tests. Use caching for Rust artifacts and `node_modules` to keep CI fast.

---

### #18 — Auto-generate TypeScript contract bindings post-deploy

🔴 **High** · `devex` `contracts`

Use `soroban contract bindings typescript` to generate typed clients for the token and vesting contracts after deployment. Integrate this into the deploy script so `frontend/lib/contracts/` is always in sync. Document the regeneration workflow in `CONTRIBUTING.md`.

---

### #19 — Write Playwright e2e test for deploy + vesting flow

🔴 **High** · `testing` `e2e`

Write a Playwright test that: (1) mocks the Freighter extension, (2) fills and submits the deploy form, (3) asserts the dashboard shows correct token data, (4) creates a vesting schedule, (5) asserts it appears in the vesting panel. Run against testnet using a funded test keypair stored in CI secrets.

---

### #20 — Add `CONTRIBUTING.md` and GitHub issue/PR templates

🟢 **Trivial** · `docs` `good first issue`

Write `CONTRIBUTING.md` covering: local setup, branching conventions, how to run tests, and PR process. Add `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, and `.github/pull_request_template.md`. Keep it concise and welcoming for new contributors.

---

### #35 — Local Soroban Standalone Network Script

🟡 **Medium** · `devex` `scripts`

Write a shell script or `docker-compose.yml` to spin up a local Soroban standalone network instantly. This allows contributors to rapidly test the frontend offline without waiting on testnet transaction times or dealing with testnet rate limits. Add instructions on how to use it to `CONTRIBUTING.md`.
