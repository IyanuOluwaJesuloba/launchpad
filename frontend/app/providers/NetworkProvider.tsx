"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { type NetworkConfig, type NetworkType, NETWORKS } from "../../types/network";

interface NetworkContextValue {
  networkConfig: NetworkConfig;
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  mounted: boolean;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkType>(() => {
    if (typeof window === "undefined") return "testnet";
    const saved = localStorage.getItem("soropad:network") as NetworkType | null;
    if (saved === "testnet" || saved === "mainnet") return saved;
    return "testnet";
  });
  const mounted = true;

  const setNetwork = useCallback((n: NetworkType) => {
    setNetworkState(n);
    localStorage.setItem("soropad:network", n);
  }, []);

  const networkConfig = useMemo(() => NETWORKS[network], [network]);

  const value = useMemo(
    () => ({
      networkConfig,
      network,
      setNetwork,
      mounted,
    }),
    [networkConfig, network, setNetwork, mounted]
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
