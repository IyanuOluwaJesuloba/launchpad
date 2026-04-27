# mint_batch — Bulk Token Minting

## Overview

`mint_batch` allows an admin to mint tokens to **multiple recipients in a single transaction**. This dramatically reduces gas/fees and transaction count when onboarding many early supporters or distributing airdrops.

## Function signature

```rust
pub fn mint_batch(
    env: Env,
    to: soroban_sdk::Vec<Address>,
    amounts: soroban_sdk::Vec<i128>,
)
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `env` | `Env` | Soroban environment (provided by the runtime) |
| `to` | `Vec<Address>` | Vector of recipient addresses |
| `amounts` | `Vec<i128>` | Vector of amounts to mint to each recipient |

## Access control

- **Admin only** (`_require_admin`)
- The admin must be authenticated (via `admin.require_auth()`)

## Validation rules

1. **Lengths must match**: `to.len() == amounts.len()`
2. **All amounts positive**: each `amount > 0`
3. **Pause check**: contract must not be paused
4. **Max supply cap**: the cumulative new total supply must not exceed `max_supply` (if set)
5. **Overflow protection**: arithmetic uses `checked_add` and panics on overflow

## Events

For each recipient, a standard `mint` event is emitted:

```
(symbol_short!("mint"), recipient_address) => amount
```

This mirrors the single `mint` function’s event schema.

## Usage example (Rust client)

```rust
use soroban_sdk::{Address, Env, Vec};

let env = Env::default();
let client = TokenContractClient::new(&env, &contract_id);

let recipients: Vec<Address> = vec![
    Address::generate(&env),
    Address::generate(&env),
    Address::generate(&env),
];

let amounts: Vec<i128> = vec![100_0000000i128, 250_0000000i128, 500_0000000i128];

client.mint_batch(&recipients, &amounts);
```

## Error cases (panics)

| Condition | Panic message |
|-----------|---------------|
| Length mismatch | `"mismatching lengths"` |
| Zero or negative amount | `"amount must be positive"` |
| Contract paused | `"contract is paused"` |
| Exceeds max_supply | `"mint would exceed max_supply"` |
| Overflow on total supply | `"total_supply overflow"` |
| Overflow on balance | `"balance overflow"` |

## Relationship to `mint`

- `mint_batch` internally calls `_mint` for each recipient.
- It respects the same invariants as `mint`: max supply, overflow, pause, and admin auth.
- It emits the same per-recipient `mint` events as individual `mint` calls.

## Why use `mint_batch`?

- **Cost efficiency**: One transaction instead of N separate `mint` calls.
- **Atomicity**: Either all recipients receive their tokens or none do.
- **Simpler orchestration**: No need to loop off-chain or manage partial failures.

## Testing

The contract includes unit tests:

- `test_mint_batch`: happy-path batch minting
- `test_mint_batch_len_mismatch`: validates length-mismatch rejection

Run them with:

```sh
cargo test --lib mint_batch
```
