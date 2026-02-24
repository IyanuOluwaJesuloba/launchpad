# 🚀 New GitHub Issues — Soroban Token Launchpad (Batch 2)

This document contains 10 brand new issues to further enhance the Soropad ecosystem, covering advanced contract logic, security, and premium UI features.

---

## 🔐 Contracts

### #36 — Implement `total_burned()` tracking

🟡 **Medium** · `contracts` `analytics`

**Issue:** Currently, `burn` operations decrease the `total_supply`, but the contract does not track the aggregate amount of tokens ever burned. This makes it impossible to display "Total Burned" stats accurately in the UI.
**Fix:**

1. Add a `TotalBurned` variant to the `DataKey` enum.
2. Update the internal `_burn` function to increment this value.
3. Add a public `total_burned(env: Env) → i128` getter.
4. Add unit tests verifying that `total_burned` increases while `total_supply` decreases.

---

### #37 — Add `burn` authorization for token owners

🟡 **Medium** · `contracts` `sep-41`

**Issue:** The current `burn` function is admin-only. According to SEP-41, token owners should be able to burn their own holdings without requiring admin permission.
**Fix:**

1. Modify `burn(env, from, amount)` or add a new `burn_self` function.
2. If using the existing `burn`, update it to: `if (caller != admin) { from.require_auth(); assert!(caller == from); }`.
3. Ensure that non-admins can only burn from their own address.
4. Update tests to cover both admin burning (forced) and user burning (voluntary).

---

### #38 — Implement `mint_batch` in Token Contract

🔴 **High** · `contracts` `optimization`

**Issue:** Launching a project often involves distributing tokens to many early supporters. Sending 100 individual `mint` transactions is expensive and slow.
**Fix:**

1. Add `mint_batch(env: Env, to_list: Vec<Address>, amounts: Vec<i128>)`.
2. Ensure `to_list` and `amounts` have the same length.
3. Perform a single `max_supply` check for the total sum.
4. Loop through and update balances, emitting a single `BatchMint` event or individual `mint` events.
5. Add gas-benchmarking tests to compare batch vs. individual mints.

---

### #39 — Global Contract Pause (Circuit Breaker)

🔴 **High** · `contracts` `security`

**Issue:** In the event of an external exploit or contract vulnerability, the admin needs a "panic button" to halt all movement.
**Fix:**

1. Add `IsPaused` to `DataKey`.
2. Create `pause()` and `unpause()` admin-only functions.
3. Add a `_check_paused(&env)` helper.
4. Inject this check into `transfer`, `transfer_from`, `mint`, and `burn`.
5. Add tests ensuring no state-changing operations work while paused.

---

### #40 — Add `contract_uri` for off-chain metadata

🟢 **Trivial** · `contracts` `metadata`

**Issue:** Users want to see token icons and detailed descriptions. Storing this on-chain is expensive.
**Fix:**

1. Add `ContractURI` to `DataKey`.
2. Add an `update_contract_uri(String)` admin function.
3. Add a `contract_uri() → String` getter.
4. This URI should point to a JSON file (standardized format like OpenSea or SEP-TBD) containing the token icon and long-form description.

---

## 🎨 Frontend

### #41 — Homepage "Live Feed" of Recently Deployed Tokens

🟡 **Medium** · `frontend` `discovery`

**Issue:** The app currently feels like a silo. A public feed of new launches helps surface projects to potential holders.
**Fix:**

1. Create a `RecentLaunches` component on the landing page.
2. Use Soroban RPC / Horizon to query recently created contracts from the "Factory" (or a curated list).
3. Display cards with Token Name, Symbol, and a "View Dashboard" link.
4. Add basic "Trending" logic based on recent transaction volume.

---

### #42 — Interactive Vesting Curve Designer

🔴 **High** · `frontend` `vesting` `ux`

**Issue:** Setting cliff and duration ledgers is counter-intuitive for users who don't think in "ledger numbers".
**Fix:**

1. In the Vesting Form, add a real-time `recharts` area chart.
2. As the user inputs "Cliff Days" and "Duration Days", update the chart to show the "Unlocking Schedule".
3. Show markers for today, the cliff date, and the final unlock date.
4. Improve the validation to warn if the cliff is set too far in the future.

---

### #43 — Discord/Telegram Webhook Alerts

🟡 **Medium** · `frontend` `admin`

**Issue:** Project owners want to be notified instantly when someone claims vested tokens or when a large transfer occurs.
**Fix:**

1. Add a "Notifications" tab in the Admin Panel.
2. Allow admins to save a Discord or Telegram Webhook URL to `localStorage` (or Issue #40's metadata).
3. Implement a client-side watcher (or suggest a server-side component) that pings the webhook when specific contract events are detected.

---

### #44 — "Connect Ledger" Support

🔴 **High** · `frontend` `security` `wallet`

**Issue:** Admins of successful tokens often prefer hardware wallets for high-value operations like `mint` or `set_admin`.
**Fix:**

1. Integrate `@stellar/stellar-sdk`'s hardware wallet support.
2. Add a "Ledger" option to the Wallet Connection modal.
3. Update the `useWallet` hook to handle signing via Ledger HID.
4. Add UX prompts for "Check your Ledger device" during transaction signing.

---

### #45 — Export Mint/Transfer History to PDF/XLS

🟢 **Trivial** · `frontend` `accounting`

**Issue:** Founders need to provide reports for tax compliance or investor updates regarding how tokens were distributed.
**Fix:**

1. Add an "Export Report" button to the Transaction History feed.
2. Generate a formatted PDF or Excel file containing all historical mints and burns.
3. Include summary stats at the top: Total Minted to date, Current Supply, and Total Recipients.
