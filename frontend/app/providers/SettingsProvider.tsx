"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNetwork } from "./NetworkProvider";
import { NETWORKS, type NetworkType } from "../../types/network";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LS_RPC_KEY_PREFIX = "soropad_rpc_url";
const LS_HORIZON_KEY_PREFIX = "soropad_horizon_url";

function getRpcStorageKey(network: NetworkType): string {
  return `${LS_RPC_KEY_PREFIX}:${network}`;
}

function getHorizonStorageKey(network: NetworkType): string {
  return `${LS_HORIZON_KEY_PREFIX}:${network}`;
}

function getDefaultRpcUrl(network: NetworkType): string {
  if (network === "mainnet") {
    return (
      process.env.NEXT_PUBLIC_MAINNET_SOROBAN_RPC_URL ??
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL ??
      NETWORKS.mainnet.rpcUrl
    );
  }

  return (
    process.env.NEXT_PUBLIC_TESTNET_SOROBAN_RPC_URL ??
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
    NETWORKS.testnet.rpcUrl
  );
}

function getDefaultHorizonUrl(network: NetworkType): string {
  if (network === "mainnet") {
    return (
      process.env.NEXT_PUBLIC_MAINNET_HORIZON_URL ?? NETWORKS.mainnet.horizonUrl
    );
  }

  return (
    process.env.NEXT_PUBLIC_TESTNET_HORIZON_URL ??
    process.env.NEXT_PUBLIC_HORIZON_URL ??
    NETWORKS.testnet.horizonUrl
  );
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
export interface SettingsContextValue {
  rpcUrl: string;
  horizonUrl: string;
  defaultRpcUrl: string;
  defaultHorizonUrl: string;
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
  const { networkConfig } = useNetwork();
  const defaultRpcUrl = useMemo(
    () => getDefaultRpcUrl(networkConfig.network),
    [networkConfig.network],
  );
  const defaultHorizonUrl = useMemo(
    () => getDefaultHorizonUrl(networkConfig.network),
    [networkConfig.network],
  );
  
  const [rpcUrl, setRpcUrlState] = useState(defaultRpcUrl);
  const [horizonUrl, setHorizonUrlState] = useState(defaultHorizonUrl);

  // Update URLs when network changes
  useEffect(() => {
    try {
      const storedRpc = localStorage.getItem(getRpcStorageKey(networkConfig.network));
      const storedHorizon = localStorage.getItem(getHorizonStorageKey(networkConfig.network));
      
      setRpcUrlState(storedRpc ?? defaultRpcUrl);
      setHorizonUrlState(storedHorizon ?? defaultHorizonUrl);
    } catch {
      setRpcUrlState(defaultRpcUrl);
      setHorizonUrlState(defaultHorizonUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConfig.network]);

  const setRpcUrl = useCallback((url: string) => {
    setRpcUrlState(url);
    try {
      localStorage.setItem(getRpcStorageKey(networkConfig.network), url);
    } catch {
      // ignore
    }
  }, [networkConfig.network]);

  const setHorizonUrl = useCallback((url: string) => {
    setHorizonUrlState(url);
    try {
      localStorage.setItem(getHorizonStorageKey(networkConfig.network), url);
    } catch {
      // ignore
    }
  }, [networkConfig.network]);

  const resetToDefaults = useCallback(() => {
    setRpcUrlState(defaultRpcUrl);
    setHorizonUrlState(defaultHorizonUrl);
    try {
      localStorage.removeItem(getRpcStorageKey(networkConfig.network));
      localStorage.removeItem(getHorizonStorageKey(networkConfig.network));
    } catch {
      // ignore
    }
  }, [defaultHorizonUrl, defaultRpcUrl, networkConfig.network]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      rpcUrl,
      horizonUrl,
      defaultRpcUrl,
      defaultHorizonUrl,
      setRpcUrl,
      setHorizonUrl,
      resetToDefaults,
    }),
    [
      defaultHorizonUrl,
      defaultRpcUrl,
      rpcUrl,
      horizonUrl,
      setRpcUrl,
      setHorizonUrl,
      resetToDefaults,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
