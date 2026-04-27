/**
 * Mock Freighter API provider for E2E testing
 * 
 * This module creates a mock implementation of window.freighterApi
 * that simulates wallet connection, transaction signing, and other
 * Freighter operations without requiring the actual extension.
 */

export interface MockFreighterOptions {
  /** The mock wallet public key to return */
  publicKey?: string;
  /** Whether the wallet is installed */
  isInstalled?: boolean;
  /** Whether the site is allowed to connect */
  isAllowed?: boolean;
  /** Simulated delay for async operations (ms) */
  delay?: number;
  /** Whether to simulate an error on connect */
  shouldFail?: boolean;
}

const DEFAULT_OPTIONS: Required<MockFreighterOptions> = {
  publicKey: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
  isInstalled: true,
  isAllowed: true,
  delay: 100,
  shouldFail: false,
};

/**
 * Inject mock Freighter API into the page's window object
 * Must be called via page.addInitScript() before page.load()
 */
export function createMockFreighterProvider(options: MockFreighterOptions = {}): string {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return `
    // Mock Freighter API implementation
    (function() {
      const config = ${JSON.stringify(config)};
      
      const mockFreighterApi = {
        isConnected: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          return { isConnected: config.isInstalled, error: null };
        },
        
        isAllowed: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          return { isAllowed: config.isAllowed, error: null };
        },
        
        setAllowed: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          if (config.shouldFail) {
            return { error: 'User rejected connection' };
          }
          return { error: null };
        },
        
        getAddress: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          if (config.shouldFail) {
            return { address: null, error: 'Failed to get address' };
          }
          return { address: config.publicKey, error: null };
        },
        
        signTransaction: async function(xdr, opts) {
          await new Promise(resolve => setTimeout(resolve, config.delay * 2));
          if (config.shouldFail) {
            return { signedTxXdr: null, error: 'Transaction signing failed' };
          }
          // Return a mock signed transaction (base64 XDR)
          return { 
            signedTxXdr: 'AAAAAgAAAADG+8vNqJ6k5j7M9pKqL8yH3vR2wT1xY5zA8bC9dE0fG1hI2j3K4l5M6n7O8p9Q0r1S2t3U4v5W6x7Y8z9A0B==', 
            error: null 
          };
        },
        
        signAuthEntry: async function(entry, opts) {
          await new Promise(resolve => setTimeout(resolve, config.delay * 2));
          return { signedAuthEntry: 'mock_auth_entry', error: null };
        },
        
        getUserInfo: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          return { 
            publicKey: config.publicKey,
            memoRequired: false,
            error: null 
          };
        },
        
        getNetwork: async function() {
          await new Promise(resolve => setTimeout(resolve, config.delay));
          return { 
            network: 'testnet',
            networkPassphrase: 'Test SDF Network ; September 2015',
            error: null 
          };
        },
      };
      
      // Expose as window.freighterApi
      window.freighterApi = mockFreighterApi;
      
      // Also expose on window for legacy compatibility
      window.freighter = mockFreighterApi;
    })();
  `;
}

/**
 * Common test scenarios with pre-configured options
 */
export const FreighterScenarios = {
  /** Happy path: wallet connected and ready */
  connected: {
    publicKey: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    isInstalled: true,
    isAllowed: true,
    shouldFail: false,
  },
  
  /** Wallet not installed */
  notInstalled: {
    isInstalled: false,
    isAllowed: false,
    shouldFail: false,
  },
  
  /** User rejected connection */
  userRejected: {
    isInstalled: true,
    isAllowed: false,
    shouldFail: true,
  },
  
  /** Different test wallet */
  testWallet2: {
    publicKey: 'GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBXHF',
    isInstalled: true,
    isAllowed: true,
    shouldFail: false,
  },
};
