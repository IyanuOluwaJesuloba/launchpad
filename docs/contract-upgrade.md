# Contract Upgrade Safety Pattern

This repository uses an **in-place upgrade** pattern for the token contract via Soroban's `update_current_contract_wasm` host function.

## Why this pattern

- Keeps the same contract address, so integrations do not need to remap to a new address.
- Preserves on-chain storage at that address.
- Provides a direct emergency path when a critical bug is found.

## Implementation

`contracts/token/src/lib.rs` includes:

- `upgrade(new_wasm_hash: BytesN<32>)` (admin-only)
- `require_auth()` enforced through `_require_admin`
- zero-hash guard to avoid obvious invalid upgrades

At runtime, the function calls:

- `env.deployer().update_current_contract_wasm(new_wasm_hash)`

## Security implications

- **Admin key risk**: whoever controls admin can replace logic. Production deployments should use multisig or governed admin accounts.
- **Storage compatibility**: upgrades keep existing storage. New WASM must preserve storage key layout and semantics.
- **No rollback guarantee**: rollback requires a previously uploaded safe WASM hash and another authorized upgrade transaction.
- **Operational safety**: stage and test upgrade WASM on testnet with migrated state patterns before mainnet execution.

## Proxy vs in-place trade-offs

Soroban allows proxy-style indirection patterns, but this project currently favors direct in-place upgrades:

- **In-place (current approach)**:
  - Simpler architecture and lower runtime complexity
  - No additional proxy call indirection
  - Strong requirement to maintain storage compatibility
- **Proxy approach**:
  - Can separate immutable storage shell from replaceable logic
  - Higher implementation complexity and larger attack surface
  - Requires careful delegate/invocation design and audit overhead

For launchpad token contracts, the simpler in-place model is chosen to minimize moving parts while still providing a controlled emergency upgrade path.
