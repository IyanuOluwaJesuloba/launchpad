# 📋 Soropad Issue Tracker — Wave 4 (Novel Features & Architecture)

_Generated after comparing against all 88 existing GitHub issues. These 15 issues are strictly novel, covering areas such as multi-wallet support, contract architecture expansions, and frontend mobile responsiveness. None of these exist on the current tracker._

---

## Part 1: Smart Contracts (Rust / Soroban)

### 1. Introduce `permit` (Off-chain sign approvals) in Token Contract
🔴 **High** · `contracts` `feature`
**Issue:** Soroban network congestion might raise fees. Currently, spending on behalf of someone requires a costly on-chain `approve` transaction. 
**Fix:** Introduce a `permit` function allowing users to sign an off-chain authorization (similar to EIP-2612). A relayer or spender can submit this signature with the transaction to instantly gain allowance logic without an upfront on-chain approval.

### 2. Emergency `pause` functionality for Vesting Contract
🟡 **Medium** · `contracts` `security`
**Issue:** The token contract implements `pause/unpause` for emergencies. However, the Vesting contract lacks any circuit-breaker. If an exploit is found in the release calculation or the token, anyone can continue draining `release()`.
**Fix:** Implement an admin-only `pause()` and `unpause()` in the vesting contract, halting `release()`, `revoke()`, and `create_schedule()` when active.

### 3. Reject / Cancel Vesting Schedule by Recipient 
🟡 **Medium** · `contracts` `feature`
**Issue:** Occasionally, staff or partners may acquire tax liabilities from vesting schedules they wish they didn't receive, or a protocol might need to let users opt-out of an airdrop contract. Currently, the recipient has no way to reject a schedule.
**Fix:** Add a `reject_schedule(env, recipient)` function callable *only* by the recipient, which returns unvested/unreleased tokens securely back to the admin and burns the schedule.

### 4. Maximum Balance Per Account (`Whale Protection`)
🟡 **Medium** · `contracts` `feature`
**Issue:** Launchpad tokens often suffer from sniper bots scooping 50% of the supply on deploy. 
**Fix:** Add an optional `max_balance_per_account` state variable to the Token Contract. Enforce during `transfer` and `mint` that no recipient can exceed this numeric percentage of the supply, barring the admin address.

### 5. Add `modify_cliff` capability for Unvested Schedules
🟢 **Trivial** · `contracts` `feature`
**Issue:** If a project gets delayed by 6 months, an admin has no way to bump the `cliff_ledger` of existing vesting schedules securely without fully revoking and recreating them.
**Fix:** Add `extend_cliff(env, recipient, new_cliff)` restricted to Admin, allowing extension (but never reduction) of the cliff if the current ledger is still prior to the cliff.

---

## Part 2: Frontend Extensibility & Web3 UX

### 6. Wallet Standard & Multi-Wallet Support (Albedo / xBull)
🔴 **High** · `frontend` `integration`
**Issue:** The app strictly hardcodes dependencies against `@stellar/freighter-api`. If a user is on mobile or prefers Albedo/xBull/LOBSTR, they cannot interface with the launchpad.
**Fix:** Refactor wallet hook to rely on `@stellar/wallet-standard` abstracting the connection provider so users can pick from a multi-wallet modal menu.

### 7. Explicit "Disconnect Wallet" & Session Persistence
🟢 **Trivial** · `frontend` `ux`
**Issue:** Users have no button to cleanly disconnect their wallet, and sessions often require reconnecting on every hard refresh due to lacking persistent storage logic.
**Fix:** Wire up a "Disconnect" toggle in the Navbar dropdown, clear local storages, and conversely, auto-reconnect silently if a trusted session token exists from a prior visit on load.

### 8. Revoke Allowance UI Actions
🟡 **Medium** · `frontend` `ux`
**Issue:** Users can approve allowances for dApps but the Soropad Dashboard UI has no interface to view outgoing allowances and securely invoke an allowance update to `0`, leaving user wallets exposed.
**Fix:** In the Personal Dashboard, add a tab mapping current allowances and render a one-click "Revoke Access" button invoking the `approve` contract with amount `0`.

### 9. Token Standard Detection (SEP-41 Validation on Import)
🟡 **Medium** · `frontend` `security`
**Issue:** If a user navigates to a token dashboard by manually modifying the URL or importing a random contract ID, the app assumes it's a SEP-41 token and crashes when reading `name()` or `symbol()`.
**Fix:** Build a validation gate: When loading a contract ID, fetch the interface or attempt a simulated light read. If it lacks standard SEP-41 getter functions, display a graceful "Invalid Token Contract" fallback screen instead of component failure.

### 10. Accurate Gas / Fee Estimation UI
🔴 **High** · `frontend` `ux`
**Issue:** Before hitting 'Deploy', the user has no idea if the transaction will cost 0.01 XLM or 5 XLM. 
**Fix:** Invoke the `simulateTransaction` RPC endpoint before allowing the user to click Deploy, calculate the CPU/mem instructions, and display an accurate estimated network fee on Step 4 of the wizard.

---

## Part 3: Architecture, Polish, & Notifications

### 11. Custom Notification Center & Toast History
🟡 **Medium** · `frontend` `ux`
**Issue:** If a toast notification for a failed Soroban transaction vanishes after 3 seconds, the user cannot retrieve the error log or the transaction hash without digging through browser DevTools.
**Fix:** Introduce a bell icon in the Navbar representing a Notification Center. Store the last 15 transaction attempts and errors in local state for review.

### 12. Dark Mode / Light Mode Theming Toggle
🟢 **Trivial** · `frontend` `ux`
**Issue:** The app mandates a particular dark/glassmorphic theme without providing an accessibility fallback to Light Mode.
**Fix:** Add `next-themes`, define CSS variable fallbacks in `globals.css` or Tailwind config, and place a sun/moon icon toggle on the Navbar.

### 13. Mobile-Responsive NavBar & Drawer menu
🟡 **Medium** · `frontend` `ux`
**Issue:** On mobile viewpoints, the top navigation links crush together and overlapping UI blocks the main content.
**Fix:** Implement a "Hamburger" menu icon for mobile screens using Tailwind `md:hidden` classes, opening a clean vertical drawer containing the navigation links.

### 14. Advanced Setup: DAO Treasury / Multisig Ownership
🔴 **High** · `frontend` `integration`
**Issue:** The final proxy/admin address inside Token deployment assumes a single user's public key. For mature projects, the admin should be a Smart Wallet or Multisig.
**Fix:** Add an input option in Step 3 letting the user optionally assign the Admin rights exclusively to an existing Stellar Multisig/DAO contract instead of their connected wallet.

### 15. Cross-Contract SEP-0008 Compliance Node Link
🔴 **High** · `contracts` `frontend` 
**Issue:** To build fully compliant security tokens, simple boolean flags aren't enough. We need real-time checks validating if an address is KYC-approved. 
**Fix:** Add a field to the Token Contract initialization storing a `ComplianceNodeAddress`. Override `transfer` to perform a cross-contract lookup asking the Compliance Node if `from` and `to` are allowed to trade. Expose this setting in the Advanced frontend deploy flow.
