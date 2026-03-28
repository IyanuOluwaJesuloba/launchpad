/**
 * Test suite for environment-aware network configuration
 * Verifies that all stellar.ts functions use the NetworkConfig parameter
 * instead of stale module-level environment variables
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import { type NetworkConfig } from "../types/network";

// Mock the Stellar SDK
jest.mock("@stellar/stellar-sdk", () => {
  const actual = jest.requireActual("@stellar/stellar-sdk");
  return {
    ...actual,
    rpc: {
      ...actual.rpc,
      Server: jest.fn(),
      Api: actual.rpc.Api,
      assembleTransaction: actual.rpc.assembleTransaction,
    },
    Horizon: {
      ...actual.Horizon,
      Server: jest.fn(),
    },
  };
});

const mockTestnetConfig: NetworkConfig = {
  network: "testnet",
  horizonUrl: "https://horizon-testnet.stellar.org",
  rpcUrl: "https://soroban-testnet.stellar.org",
  passphrase: StellarSdk.Networks.TESTNET,
};

const mockMainnetConfig: NetworkConfig = {
  network: "mainnet",
  horizonUrl: "https://horizon.stellar.org",
  rpcUrl: "https://mainnet.stellar.org:443",
  passphrase: StellarSdk.Networks.PUBLIC,
};

describe("Stellar Network Configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("simulateCall", () => {
    it("should use config.rpcUrl for testnet", async () => {
      const { simulateCall } = await import("../lib/stellar");
      
      const mockSimResult = {
        result: {
          retval: StellarSdk.xdr.ScVal.scvU32(7),
        },
        latestLedger: 12345,
        cost: { cpuInsns: "0", memBytes: "0" },
      };
      
      const mockRpcServer = {
        simulateTransaction: jest.fn().mockResolvedValue(mockSimResult),
      };
      
      // Mock isSimulationSuccess to return true
      jest.spyOn(StellarSdk.rpc.Api, 'isSimulationSuccess').mockReturnValue(true);
      jest.spyOn(StellarSdk.rpc.Api, 'isSimulationError').mockReturnValue(false);
      
      (StellarSdk.rpc.Server as jest.Mock).mockImplementation((url: string) => {
        expect(url).toBe(mockTestnetConfig.rpcUrl);
        return mockRpcServer;
      });

      // Use a valid contract ID (this is a properly formatted Stellar contract address)
      await simulateCall("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "decimals", mockTestnetConfig);
      
      expect(StellarSdk.rpc.Server).toHaveBeenCalledWith(mockTestnetConfig.rpcUrl);
    });

    it("should use config.rpcUrl for mainnet", async () => {
      const { simulateCall } = await import("../lib/stellar");
      
      const mockSimResult = {
        result: {
          retval: StellarSdk.xdr.ScVal.scvU32(7),
        },
        latestLedger: 12345,
        cost: { cpuInsns: "0", memBytes: "0" },
      };
      
      const mockRpcServer = {
        simulateTransaction: jest.fn().mockResolvedValue(mockSimResult),
      };
      
      // Mock isSimulationSuccess to return true
      jest.spyOn(StellarSdk.rpc.Api, 'isSimulationSuccess').mockReturnValue(true);
      jest.spyOn(StellarSdk.rpc.Api, 'isSimulationError').mockReturnValue(false);
      
      (StellarSdk.rpc.Server as jest.Mock).mockImplementation((url: string) => {
        expect(url).toBe(mockMainnetConfig.rpcUrl);
        return mockRpcServer;
      });

      // Use a valid contract ID (this is a properly formatted Stellar contract address)
      await simulateCall("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "decimals", mockMainnetConfig);
      
      expect(StellarSdk.rpc.Server).toHaveBeenCalledWith(mockMainnetConfig.rpcUrl);
    });
  });

  describe("fetchCurrentLedger", () => {
    it("should use config.rpcUrl", async () => {
      const { fetchCurrentLedger } = await import("../lib/stellar");
      
      const mockRpcServer = {
        getLatestLedger: jest.fn().mockResolvedValue({ sequence: 12345 }),
      };
      
      (StellarSdk.rpc.Server as jest.Mock).mockImplementation((url: string) => {
        expect(url).toBe(mockTestnetConfig.rpcUrl);
        return mockRpcServer;
      });

      const result = await fetchCurrentLedger(mockTestnetConfig);
      
      expect(result).toBe(12345);
      expect(StellarSdk.rpc.Server).toHaveBeenCalledWith(mockTestnetConfig.rpcUrl);
    });
  });

  describe("fetchAccountBalances", () => {
    it("should use config.horizonUrl", async () => {
      const { fetchAccountBalances } = await import("../lib/stellar");
      
      const mockHorizonServer = {
        loadAccount: jest.fn().mockResolvedValue({
          balances: [
            {
              asset_type: "native",
              balance: "100.0000000",
            },
          ],
        }),
      };
      
      (StellarSdk.Horizon.Server as jest.Mock).mockImplementation((url: string) => {
        expect(url).toBe(mockMainnetConfig.horizonUrl);
        return mockHorizonServer;
      });

      await fetchAccountBalances("GTEST", mockMainnetConfig);
      
      expect(StellarSdk.Horizon.Server).toHaveBeenCalledWith(mockMainnetConfig.horizonUrl);
    });
  });

  describe("Network switching", () => {
    it("should switch from testnet to mainnet correctly", async () => {
      const { fetchCurrentLedger } = await import("../lib/stellar");
      
      const mockRpcServer = {
        getLatestLedger: jest.fn().mockResolvedValue({ sequence: 99999 }),
      };
      
      // First call with testnet
      (StellarSdk.rpc.Server as jest.Mock).mockImplementationOnce((url: string) => {
        expect(url).toBe(mockTestnetConfig.rpcUrl);
        return mockRpcServer;
      });
      
      await fetchCurrentLedger(mockTestnetConfig);
      
      // Second call with mainnet
      (StellarSdk.rpc.Server as jest.Mock).mockImplementationOnce((url: string) => {
        expect(url).toBe(mockMainnetConfig.rpcUrl);
        return mockRpcServer;
      });
      
      await fetchCurrentLedger(mockMainnetConfig);
      
      expect(StellarSdk.rpc.Server).toHaveBeenCalledTimes(2);
    });
  });
});
