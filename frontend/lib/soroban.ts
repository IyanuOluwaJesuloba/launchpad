import {
  Address,
  Contract,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

export { nativeToScVal, scValToNative };

/**
 * Build a Soroban invocation transaction.
 */
export async function buildSorobanCall(params: {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  publicKey: string;
  networkPassphrase: string;
  serverUrl: string;
}) {
  const { contractId, method, args } = params;
  const contract = new Contract(contractId);
  return contract.call(method, ...args);
}

/**
 * Format address for ScVal
 */
export function addressToScVal(addr: string) {
  return new Address(addr).toScVal();
}

/**
 * Format i128 for ScVal
 */
export function i128ToScVal(amount: bigint | number) {
  return nativeToScVal(BigInt(amount), { type: "i128" });
}
