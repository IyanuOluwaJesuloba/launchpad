/**
 * Global type declarations for mocked Freighter API
 */

interface FreighterApi {
  isConnected: () => Promise<{ isConnected: boolean; error: string | null }>;
  isAllowed: () => Promise<{ isAllowed: boolean; error: string | null }>;
  setAllowed: () => Promise<{ error: string | null }>;
  getAddress: () => Promise<{ address: string | null; error: string | null }>;
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string | null; error: string | null }>;
  signAuthEntry: (
    entry: string,
    opts?: { address?: string }
  ) => Promise<{ signedAuthEntry: string | null; error: string | null }>;
  getUserInfo: () => Promise<{
    publicKey: string | null;
    memoRequired: boolean;
    error: string | null;
  }>;
  getNetwork: () => Promise<{
    network: string;
    networkPassphrase: string;
    error: string | null;
  }>;
}

declare global {
  interface Window {
    freighterApi: FreighterApi;
    freighter: FreighterApi;
  }
}

export {};
