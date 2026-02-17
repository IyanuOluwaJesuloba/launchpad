// lib/stellar/contractClient.ts
// TODO (issue #18): auto-generate typed bindings via `soroban contract bindings typescript`

export type Network = "testnet" | "mainnet";

export const RPC_URLS: Record<Network, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://soroban-mainnet.stellar.org",
};

export const HORIZON_URLS: Record<Network, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
};

export const NETWORK_PASSPHRASES: Record<Network, string> = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015",
};

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply: bigint | null;
  admin: string;
  contractId: string;
}

export interface DeployTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  maxSupply: bigint | null;
  adminAddress: string;
}

/**
 * TODO (issue #7, #16): Build a deploy transaction XDR for a new SEP-41 token.
 * Should upload WASM, instantiate contract, and call initialize().
 */
export async function buildDeployTransaction(
  _params: DeployTokenParams,
  _sourcePublicKey: string,
  _network: Network
): Promise<string> {
  throw new Error("Not implemented");
}

/**
 * TODO (issue #9): Fetch token metadata from a deployed contract via Soroban RPC.
 */
export async function fetchTokenInfo(
  _contractId: string,
  _network: Network
): Promise<TokenInfo> {
  throw new Error("Not implemented");
}

/**
 * Format a raw token amount using its decimal places.
 * e.g. formatAmount(10_000_0000000n, 7) => "10,000"
 */
export function formatAmount(raw: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString();
}
