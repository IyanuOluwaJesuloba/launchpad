# Risk Disclosure

_Last updated: 2025-01-01. This notice applies to every page of SoroPad and to every token deployed through it._

> **Transactions are submitted through your wallet and may be irreversible. Tokens can be volatile or lose all value. SoroPad does not provide custody, warranties, or financial advice.**

---

## 1. What SoroPad Is 

SoroPad is an open-source interface for deploying and managing SEP-41 tokens on the Stellar Soroban smart contract platform. It deploys contracts and submits transactions that you sign in your own wallet.

## 2. What SoroPad Is Not

- SoroPad is **not** a custodian. It never holds, transfers, or controls your assets. Your keys remain in your wallet.
- SoroPad is **not** a broker, exchange, or market maker. There is no liquidity pool, swap, or price quote in this project.
- SoroPad is **not** a financial advisor. Nothing here is investment, legal, tax, or accounting advice.
- SoroPad is **not** a guarantor of any token's value, liquidity, or legal compliance.

## 3. Irreversibility

Blockchain transactions are final. Once a transaction is signed and confirmed on Stellar, it cannot be reversed by SoroPad, by the network, or by any third party. Deploying a token, minting, burning, transferring ownership, and claiming vested tokens are all irreversible once confirmed.

## 4. Token Volatility and Loss of Value

Tokens deployed through SoroPad are not priced by SoroPad. Their value, if any, is determined entirely by third parties. Tokens can become illiquid, can be worth nothing, and can lose all value. You may lose the entire amount you paid to acquire a deployed token.

## 5. What the Admin Can Do After Launch

The admin of a deployed token holds significant powers. These are described in [docs/contract-upgrade.md](docs/contract-upgrade.md) and [docs/compliance-node-interface.md](docs/compliance-node-interface.md):

- **Mint.** The admin can issue new tokens up to the configured max cap, diluting existing holders.
- **Burn.** The admin can burn tokens from admin-controlled addresses.
- **Transfer ownership.** The admin can handover the admin role to another address.
- **Upgrade.** Where the contract is deployed with an upgradable WASM hash, the admin can replace the contract logic. See [docs/contract-upgrade.md](docs/contract-upgrade.md) for the exact mechanism and who holds the key.
- **Compliance hook.** Where a compliance node is configured, it can gate transfers. See [docs/compliance-node-interface.md](docs/compliance-node-interface.md).

Before you buy or hold a token deployed through SoroPad, read the token's admin policy and verify whether the contract is upgradable.

## 6. Vesting and Solvency

Vesting schedules are enforced on-chain. Whether a vesting grant is actually funded is visible through the solvency checks described in [docs/vesting-solvency.md](docs/vesting-solvency.md). A vesting schedule is not a guarantee that the token will have value when claimed.

## 7. No Warranties

SoroPad is provided "as is", without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. See [TERMS.md](TERMS.md) for the full terms.

## 8. No Financial Advice

Nothing in SoroPad, its documentation, or its interface constitutes investment advice, financial advice, trading advice, or any other form of advice. Consult a qualified professional before making any decision.

## 9. Regulatory Notice

SoroPad is software. It does not issue, market, or distribute tokens, and it does not provide crypto-asset services within the meaning of Regulation (EU) 2023/1114 (MiCA). Users launching tokens are solely responsible for determining whether their activity falls within MiCA's scope and for complying with any applicable law in their jurisdiction. SoroPad does not provide a MiCA-whitepaper for tokens launched through it.

## 10. Reporting and Contact

If you believe a deployed token is fraudulent or violates the law, report it to the relevant authority in your jurisdiction. Security reports about SoroPad itself should follow [SECURITY.md](SECURITY.md).
