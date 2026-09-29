# Privacy Policy

_Last updated: 2025-01-01._

SoroPad is an open-source interface for deploying SEP-41 tokens on Stellar Soroban. This policy describes what data the interface handles and what it does not.

## 1. Data SoroPad Does Not Collect

SoroPad does not operate a backend that stores personal data. Specifically:

- **No accounts.** There is no signup, login, email collection, or password storage.
- **No custody.** SoroPad never receives or stores your private keys or seed phrase. Signing happens in your wallet (e.g. Freighter).
- **No tracking pixels.** The interface does not embed third-party advertising or analytics pixels.
- **No server-side profiling.** SoroPad does not build user profiles.

## 2. Data Stored in Your Browser

SoroPad may store non-sensitive preferences in your browser's local storage, such as the selected network (testnet or mainnet) and UI preferences. This data never leaves your device unless you clear it.

## 3. On-Chain Data

Actions you take through SoroPad are submitted to the Stellar network and are public by design. This includes:

- The addresses involved in a transaction.
- Token deployment parameters (name, symbol, decimals, supply, max cap, admin address).
- Vesting schedules and claims.
- Mint, burn, and ownership-transfer events.

This information is permanently recorded on the Stellar ledger and cannot be deleted by SoroPad or by anyone else.

## 4. Third-Party Services

To function, the interface contacts third-party services:

- **Stellar Horizon and Soroban RPC** to submit transactions and read ledger state.
- **Freighter** to request transaction signing in your browser.

These services have their own privacy policies. SoroPad does not control them and is not responsible for their data handling.

## 5. Your Rights

Because SoroPad does not collect or store personal data, there is nothing for SoroPad to export, correct, or delete on your behalf. On-chain data cannot be deleted.

## 6. Contact

For privacy questions, open an issue in the repository. For security reports, see [SECURITY.md](SECURITY.md).
