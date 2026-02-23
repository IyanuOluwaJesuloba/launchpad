# Deploy Script

CLI script to build, upload, deploy, and initialize a Soroban token contract.

## Prerequisites

- [Rust](https://rustup.rs/) toolchain with `wasm32-unknown-unknown` target
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)
- A funded Stellar account (secret key or configured identity)
- [ts-node](https://www.npmjs.com/package/ts-node) (or use via `npx`)

## Usage

```bash
npx ts-node scripts/deploy.ts \
  --network testnet \
  --admin <SECRET_KEY_OR_IDENTITY> \
  --name "My Token" \
  --symbol MTK \
  --supply 1000000 \
  --max-supply 10000000
```

## Flags

| Flag | Required | Default | Description |
|---|---|---|---|
| `--network` | Yes | — | Soroban network (`testnet`, `mainnet`, `futurenet`) |
| `--admin` | Yes | — | Stellar secret key or identity name |
| `--name` | Yes | — | Token name (e.g. `"My Token"`) |
| `--symbol` | Yes | — | Token symbol (e.g. `MTK`) |
| `--supply` | Yes | — | Initial token supply |
| `--max-supply` | No | — | Maximum supply cap (omit for unlimited) |
| `--decimals` | No | `7` | Token decimal precision |
| `--help` | No | — | Show usage information |

## What It Does

1. **Build** — Compiles the token contract to WASM (`soroban contract build`)
2. **Upload** — Uploads the WASM binary to the network
3. **Deploy** — Deploys a new contract instance from the uploaded WASM
4. **Initialize** — Calls `initialize()` with the provided token parameters
5. **Save** — Writes the new `CONTRACT_ID` to `.env.local`

## Output

On success the script prints each step and a final summary:

```
=== Deployment complete ===
Network:     testnet
Contract ID: CABC...XYZ
Token:       My Token (MTK)
Decimals:    7
Supply:      1000000
```

The contract ID is also persisted in `.env.local`:

```
CONTRACT_ID=CABC...XYZ
```

## Configuring an Identity

Before deploying, add a funded identity to the Soroban CLI:

```bash
soroban keys add deployer --secret-key
# paste your secret key when prompted

# Then deploy using the identity name:
npx ts-node scripts/deploy.ts \
  --network testnet \
  --admin deployer \
  --name "My Token" \
  --symbol MTK \
  --supply 1000000
```

To fund a testnet account use the [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY).
