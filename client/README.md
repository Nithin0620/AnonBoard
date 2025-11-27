# AnonBoard Client

React + Vite + TypeScript + TailwindCSS frontend for AnonBoard with Moralis authentication and Web3 integration.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_MORALIS_APP_ID=your_moralis_app_id_here
VITE_MORALIS_SERVER_URL=your_moralis_server_url_here
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

**Get Moralis Credentials:**
1. Go to [Moralis Admin Dashboard](https://admin.moralis.io/)
2. Create a new server (or use existing)
3. Copy the App ID and Server URL

### 3. Run Development Server
```bash
npm run dev
```

## Features

- **Moralis Authentication**: Web3 wallet connection using Moralis and web3uikit
- **ConnectButton**: Pre-built wallet connection UI from web3uikit
- **Blockchain Context**: Centralized state management for blockchain interactions
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-friendly Tailwind CSS styling

## Architecture

### Context API (`src/context/BlockchainContext.tsx`)
Provides blockchain interaction functions:
- `createPost(content: string)`: Create a new post
- `addComment(postId: number, content: string)`: Add comment to a post
- `toggleLike(postId: number)`: Toggle like on a post
- `loadPosts()`: Load all posts from blockchain
- `getComments(postId: number)`: Get comments for a post
- `getTotalPosts()`: Get total number of posts

### Components
- **Navbar**: App branding, dark mode toggle, and ConnectButton
- **PostCard**: Individual post display with author, content, likes, comments
- **CommentCard**: Individual comment display
- **Modal**: Reusable modal for creating posts and viewing comments
- **LikeButton**: Like/unlike interaction button

### Pages
- **Home**: Main feed with post creation, viewing, and interaction

## Next Steps

1. **Deploy Smart Contract**: Deploy your AnonBoard contract and update `.env` with the contract address
2. **Add Contract ABI**: Import your contract ABI and pass it to `BlockchainProvider`
3. **Implement Contract Calls**: Uncomment and implement the actual Web3 contract calls in `BlockchainContext.tsx`
4. **Configure Moralis**: Set up Moralis server with your blockchain network

## Current State

The app currently works in **mock mode** without actual blockchain calls. All functions are implemented as placeholder logic that manages local state. This allows you to:
- Test the UI and user experience
- Develop and refine the interface
- Prepare for blockchain integration

Once you have your smart contract deployed and Moralis configured, you can replace the mock implementations with actual Web3 calls.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Moralis**: Web3 authentication
- **react-moralis**: React hooks for Moralis
- **web3uikit**: Pre-built Web3 UI components
- **ethers.js**: Ethereum library
- **lucide-react**: Icons
