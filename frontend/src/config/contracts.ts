// Contract addresses and configuration for Glacier
// This file will be auto-generated during deployment

export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorer: 'https://testnet.snowtrace.io',
  contracts: {
    // These addresses will be populated during deployment
    Verifier: '0x0000000000000000000000000000000000000000' as const,
    VeilVoting: '0x0000000000000000000000000000000000000000' as const,
  }
} as const;

export const AVALANCHE_MAINNET_CONFIG = {
  chainId: 43114,
  name: 'Avalanche Mainnet',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  explorer: 'https://snowtrace.io',
  contracts: {
    // Mainnet addresses (deploy when ready for production)
    Verifier: '0x0000000000000000000000000000000000000000' as const,
    VeilVoting: '0x0000000000000000000000000000000000000000' as const,
  }
} as const;

export const LOCAL_CONFIG = {
  chainId: 31337,
  name: 'Local Development',
  rpcUrl: 'http://localhost:8545',
  explorer: '#',
  contracts: {
    // Local development addresses
    Verifier: '0x0000000000000000000000000000000000000000' as const,
    VeilVoting: '0x0000000000000000000000000000000000000000' as const,
  }
} as const;

// Default to Fuji testnet for development
export const CHAIN_CONFIG = AVALANCHE_FUJI_CONFIG;
export const CONTRACT_ADDRESSES = CHAIN_CONFIG.contracts;

// Environment-based configuration
export const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case 43113:
      return AVALANCHE_FUJI_CONFIG;
    case 43114:
      return AVALANCHE_MAINNET_CONFIG;
    case 31337:
      return LOCAL_CONFIG;
    default:
      return AVALANCHE_FUJI_CONFIG;
  }
};