# AnonBoard - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Moralis

Create a `.env` file in the `client` directory:

```env
VITE_MORALIS_APP_ID=your_app_id
VITE_MORALIS_SERVER_URL=your_server_url
VITE_CONTRACT_ADDRESS=your_contract_address
```

**Get Moralis Credentials:**
- Visit [Moralis Dashboard](https://admin.moralis.io/)
- Create a new server or use existing
- Copy App ID and Server URL

### 3. Run Development Server
```bash
npm run dev
```

## What's Integrated

### ✅ Moralis Authentication
- Automatic wallet connection with `useMoralis()` hook
- Account detection and management
- Web3 provider initialization

### ✅ web3uikit ConnectButton
- Pre-built wallet connection UI
- Multi-wallet support (MetaMask, WalletConnect, etc.)
- Network switching capabilities

### ✅ Blockchain Context API
Located at `src/context/BlockchainContext.tsx`

**Available Functions:**
```typescript
const {
  posts,              // Array of posts
  isLoading,          // Loading state
  error,              // Error messages
  createPost,         // (content: string) => Promise<void>
  addComment,         // (postId: number, content: string) => Promise<void>
  toggleLike,         // (postId: number) => Promise<void>
  loadPosts,          // () => Promise<void>
  getComments,        // (postId: number) => Promise<Comment[]>
  getTotalPosts,      // () => Promise<number>
} = useBlockchain();
```

### ✅ UI Components
- **Navbar**: ConnectButton + Dark mode toggle
- **PostCard**: Post display with likes and comments
- **CommentCard**: Comment display
- **Modal**: Reusable modal component
- **LikeButton**: Like interaction

## Current State

The app runs in **mock mode** without actual blockchain calls. All functions use local state management to simulate blockchain interactions.

## Next Steps to Integrate Smart Contract

### 1. Deploy Your Contract
Deploy the AnonBoard smart contract and note the address.

### 2. Add Contract ABI
Create `src/contracts/AnonBoardABI.json` with your contract ABI.

### 3. Update BlockchainProvider
In `src/App.tsx`, pass the contract details:

```typescript
import AnonBoardABI from './contracts/AnonBoardABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// In App component:
<BlockchainProvider 
  contractAddress={CONTRACT_ADDRESS}
  contractABI={AnonBoardABI}
>
  <Home />
</BlockchainProvider>
```

### 4. Implement Contract Calls
In `src/context/BlockchainContext.tsx`, uncomment and implement the Web3 contract calls:

```typescript
// Example for createPost:
const createPost = async (content: string) => {
  const options = {
    contractAddress,
    functionName: 'createPost',
    abi: contractABI,
    params: { _content: content }
  };
  
  const tx = await Moralis.executeFunction(options);
  await tx.wait();
  await loadPosts();
};
```

## Testing

### Without Blockchain (Current)
1. Run `npm run dev`
2. Click "Connect Wallet" (simulated)
3. Create posts, add comments, toggle likes
4. All data is stored in local state

### With Blockchain (After Integration)
1. Configure Moralis server with your network
2. Add contract address and ABI
3. Implement contract calls in context
4. Connect real wallet
5. Interact with actual blockchain

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Moralis (Web3 authentication)
- react-moralis (React hooks)
- @web3uikit/web3 (ConnectButton)
- ethers.js (Ethereum library)
- lucide-react (icons)

## Folder Structure

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── PostCard.tsx
│   │   ├── CommentCard.tsx
│   │   ├── Modal.tsx
│   │   └── LikeButton.tsx
│   ├── context/           # Context providers
│   │   └── BlockchainContext.tsx
│   ├── pages/             # Page components
│   │   └── Home.tsx
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx            # Main app with providers
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .env.example           # Example env file
└── package.json
```

## Troubleshooting

### Moralis Connection Issues
- Verify APP_ID and SERVER_URL in `.env`
- Check Moralis server is running
- Ensure correct network configuration

### Wallet Connection Issues
- Clear browser cache
- Try different wallet (MetaMask, WalletConnect)
- Check wallet is unlocked
- Verify correct network selected

### Build Warnings
The large chunk size warnings are from Moralis/Web3 dependencies. They're safe to ignore for development. For production, consider:
- Lazy loading the Web3 components
- Code splitting with dynamic imports
- Using manual chunks in Vite config

## Support

For issues or questions:
1. Check [Moralis Documentation](https://docs.moralis.io/)
2. Review [web3uikit Documentation](https://web3ui.github.io/web3uikit/)
3. Check browser console for errors
