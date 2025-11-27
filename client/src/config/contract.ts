/**
 * Contract configuration for AnonBoard
 * 
 * This file initializes the Thirdweb contract instance that will be used
 * throughout the application for blockchain interactions.
 */

import { getContract } from 'thirdweb';

/**
 * Create a Thirdweb client
 * Get your client ID from: https://thirdweb.com/dashboard/settings
 */
import { createThirdwebClient } from 'thirdweb';

// Initialize the Thirdweb client with your client ID
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || '',
});

/**
 * Define your blockchain network
 * 
 * For common chains, you can import from 'thirdweb/chains':
 * - ethereum (mainnet)
 * - sepolia (Ethereum testnet)
 * - polygon
 * - polygonAmoy (Polygon testnet)
 * - arbitrum
 * - optimism
 * 
 * For custom chains, use defineChain():
 */
// Example for Ethereum Sepolia testnet
import { sepolia } from 'thirdweb/chains';
export const chain = sepolia;

// OR define a custom chain:
// export const chain = defineChain({
//   id: 11155111, // Chain ID
//   rpc: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
//   nativeCurrency: {
//     name: 'Sepolia ETH',
//     symbol: 'SEP',
//     decimals: 18,
//   },
// });

/**
 * Contract address
 * Replace with your deployed contract address
 */
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

/**
 * Initialize the contract instance
 * 
 * This creates a contract object that can be used with Thirdweb hooks
 * and functions throughout your application.
 */
export const contract = CONTRACT_ADDRESS
  ? getContract({
      client,
      chain,
      address: CONTRACT_ADDRESS,
    })
  : null;

/**
 * Export contract address for convenience
 */
export const contractAddress = CONTRACT_ADDRESS;

/**
 * Helper to check if contract is configured
 */
export const isContractConfigured = (): boolean => {
  return !!(
    import.meta.env.VITE_THIRDWEB_CLIENT_ID &&
    import.meta.env.VITE_CONTRACT_ADDRESS
  );
};
