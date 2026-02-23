# Contributing to Soroban Token Launchpad

Thanks for your interest! This project is open to contributors via the [Stellar Wave Program on Drips](https://www.drips.network/wave).

---

## Local Setup

```bash
# Clone
git clone https://github.com/your-org/soroban-token-launchpad
cd soroban-token-launchpad

# Install frontend deps
npm install

# Install Rust + Soroban CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked soroban-cli

# Build contracts
cd contracts && cargo build

# Run frontend
cd frontend && npm run dev
```

---

## Branching

- `main` — stable, protected
- `feat/issue-{number}-short-description` — feature branches
- `fix/issue-{number}-short-description` — bug fix branches

---

## Running Tests

```bash
# Contract tests
cd contracts && cargo test

# Frontend unit tests
npm test

# E2E tests (requires testnet funded keypair in .env.test)
npm run test:e2e
```

---

## Submitting a PR

1. Pick an issue tagged `good first issue` or comment on one you'd like to tackle
2. Fork the repo and create a branch off `main` once assigned the issue
3. Write tests for your changes
4. Open a PR referencing the issue number: `Closes #7`
5. A maintainer will review and merge

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/soroban-token-launchpad/discussions) or comment on the relevant issue.

---

## Regenerating Contract Bindings

TypeScript bindings for the contracts are automatically generated after a successful deployment using `scripts/deploy.ts`. They are stored in `frontend/lib/contracts/`.

If you need to manually regenerate bindings (e.g., after changing contract code without a full re-deploy), you can use the `soroban` CLI:

```bash
# Generate token bindings
soroban contract bindings typescript \
  --id <TOKEN_CONTRACT_ID> \
  --network <NETWORK> \
  --output-dir frontend/lib/contracts/token \
  --overwrite

# Generate vesting bindings
soroban contract bindings typescript \
  --id <VESTING_CONTRACT_ID> \
  --network <NETWORK> \
  --output-dir frontend/lib/contracts/vesting \
  --overwrite
```
