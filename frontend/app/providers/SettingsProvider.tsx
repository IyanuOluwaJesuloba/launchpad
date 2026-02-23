"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LS_RPC_KEY = "soropad_rpc_url";
const LS_HORIZON_KEY = "soropad_horizon_url";

export const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";
export const DEFAULT_HORIZON_URL = "https://horizon-testnet.stellar.org";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
export interface SettingsContextValue {
  rpcUrl: string;
  horizonUrl: string;
  setRpcUrl: (url: string) => void;
  setHorizonUrl: (url: string) => void;
  resetToDefaults: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [rpcUrl, setRpcUrlState] = useState(DEFAULT_RPC_URL);
  const [horizonUrl, setHorizonUrlState] = useState(DEFAULT_HORIZON_URL);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedRpc = localStorage.getItem(LS_RPC_KEY);
      const storedHorizon = localStorage.getItem(LS_HORIZON_KEY);
      if (storedRpc) setRpcUrlState(storedRpc);
      if (storedHorizon) setHorizonUrlState(storedHorizon);
    } catch {
      // localStorage unavailable (SSR or privacy mode)
    }
  }, []);

  const setRpcUrl = useCallback((url: string) => {
    setRpcUrlState(url);
    try {
      localStorage.setItem(LS_RPC_KEY, url);
    } catch {
      // ignore
    }
  }, []);

  const setHorizonUrl = useCallback((url: string) => {
    setHorizonUrlState(url);
    try {
      localStorage.setItem(LS_HORIZON_KEY, url);
    } catch {
      // ignore
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setRpcUrlState(DEFAULT_RPC_URL);
    setHorizonUrlState(DEFAULT_HORIZON_URL);
    try {
      localStorage.removeItem(LS_RPC_KEY);
      localStorage.removeItem(LS_HORIZON_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ rpcUrl, horizonUrl, setRpcUrl, setHorizonUrl, resetToDefaults }),
    [rpcUrl, horizonUrl, setRpcUrl, setHorizonUrl, resetToDefaults],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
