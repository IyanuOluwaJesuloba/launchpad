#!/usr/bin/env ts-node
// scripts/deploy.ts
// TODO (issue #16): implement full deploy with CLI flags

/**
 * Usage:
 *   npx ts-node scripts/deploy.ts \
 *     --network testnet \
 *     --admin GABCD... \
 *     --name "My Token" \
 *     --symbol MTK \
 *     --supply 1000000 \
 *     --max-supply 10000000
 *
 * On success: prints contract ID and writes to .env.local
 */

const args = process.argv.slice(2);
console.log("Args received:", args);

// TODO: parse args with minimist or yargs
// TODO: soroban contract build
// TODO: soroban contract upload --wasm ...
// TODO: soroban contract deploy --wasm-hash ...
// TODO: invoke initialize(admin, decimals, name, symbol, supply, max_supply)
// TODO: write CONTRACT_ID to .env.local

console.log("Deploy script not yet implemented — see issue #16");
process.exit(1);
