/**
 * BlockchainContext.tsx
 * 
 * Production-ready Context API for interacting with AnonBoard smart contract using Thirdweb SDK
 * 
 * Features:
 * - Read contract data using useReadContract hook
 * - Write to contract using prepareContractCall + useSendTransaction
 * - Automatic refetching after transactions
 * - Comprehensive error handling
 * - TypeScript type safety
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useReadContract, useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, readContract } from 'thirdweb';
import type { ThirdwebContract } from 'thirdweb';

// ============================================================================
// TYPES
// ============================================================================

export interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: number;
  author: string;
  content: string;
  likes: number;
  timestamp: number;
  comments?: Comment[];
}

interface BlockchainContextType {
  contract: ThirdwebContract | null;
  account: string | null;
  totalPosts: bigint | undefined;
  nextPostId: bigint | undefined;
  nextCommentId: bigint | undefined;
  isLoadingPosts: boolean;
  isLoadingComments: boolean;
  isTransactionPending: boolean;
  error: string | null;
  createPost: (content: string) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string) => Promise<void>;
  getPost: (postId: number) => Promise<Post | null>;
  getAllPosts: () => Promise<Post[]>;
  getComments: (postId: number) => Promise<Comment[]>;
  hasLiked: (postId: number, userAddress?: string) => Promise<boolean>;
  refetchData: () => void;
  clearError: () => void;
}

interface BlockchainProviderProps {
  children: ReactNode;
  contract: ThirdwebContract | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children, contract }) => {
  const account = useActiveAccount();
  const accountAddress = account?.address || null;
  const [error, setError] = useState<string | null>(null);
  
  const { 
    mutateAsync: sendTransaction, 
    isPending: isTransactionPending,
    error: transactionError 
  } = useSendTransaction();
  
  // Read total posts
  const { 
    data: totalPosts, 
    isLoading: isLoadingTotalPosts,
    refetch: refetchTotalPosts 
  } = useReadContract({
    contract: contract as ThirdwebContract,
    method: 'function getTotalPosts() view returns (uint256)',
    params: [],
  });
  
  // Read next post ID
  const { 
    data: nextPostId,
    refetch: refetchNextPostId 
  } = useReadContract({
    contract: contract as ThirdwebContract,
    method: 'function nextPostId() view returns (uint256)',
    params: [],
  });
  
  // Read next comment ID
  const { 
    data: nextCommentId,
    refetch: refetchNextCommentId 
  } = useReadContract({
    contract: contract as ThirdwebContract,
    method: 'function nextCommentId() view returns (uint256)',
    params: [],
  });
  
  // ============================================================================
  // WRITE FUNCTIONS
  // ============================================================================
  
  const createPost = async (content: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    if (!accountAddress) throw new Error('Wallet not connected');
    if (!content.trim()) throw new Error('Post content cannot be empty');
    
    try {
      setError(null);
      const transaction = prepareContractCall({
        contract,
        method: 'function createPost(string _content)',
        params: [content],
      });
      await sendTransaction(transaction);
      setTimeout(() => {
        refetchTotalPosts();
        refetchNextPostId();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create post';
      setError(errorMessage);
      console.error('Create post error:', err);
      throw err;
    }
  };
  
  const toggleLike = async (postId: number): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    if (!accountAddress) throw new Error('Wallet not connected');
    
    try {
      setError(null);
      const transaction = prepareContractCall({
        contract,
        method: 'function toggleLike(uint256 _postId)',
        params: [BigInt(postId)],
      });
      await sendTransaction(transaction);
      setTimeout(() => refetchTotalPosts(), 1000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to toggle like';
      setError(errorMessage);
      console.error('Toggle like error:', err);
      throw err;
    }
  };
  
  const addComment = async (postId: number, content: string): Promise<void> => {
    if (!contract) throw new Error('Contract not initialized');
    if (!accountAddress) throw new Error('Wallet not connected');
    if (!content.trim()) throw new Error('Comment content cannot be empty');
    
    try {
      setError(null);
      const transaction = prepareContractCall({
        contract,
        method: 'function addComment(uint256 _postId, string _content)',
        params: [BigInt(postId), content],
      });
      await sendTransaction(transaction);
      setTimeout(() => refetchNextCommentId(), 1000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to add comment';
      setError(errorMessage);
      console.error('Add comment error:', err);
      throw err;
    }
  };
  
  // ============================================================================
  // READ FUNCTIONS
  // ============================================================================
  
  const getPost = async (postId: number): Promise<Post | null> => {
    if (!contract) return null;
    try {
      const postData = await readContract({
        contract,
        method: 'function posts(uint256) view returns (uint256 id, address author, string content, uint256 likes, uint256 timestamp)',
        params: [BigInt(postId)],
      });
      return {
        id: Number(postData[0]),
        author: postData[1] as string,
        content: postData[2] as string,
        likes: Number(postData[3]),
        timestamp: Number(postData[4]),
      };
    } catch (err) {
      console.error(`Error fetching post ${postId}:`, err);
      return null;
    }
  };
  
  const getAllPosts = async (): Promise<Post[]> => {
    if (!contract || !totalPosts) return [];
    try {
      const total = Number(totalPosts);
      const postPromises = [];
      for (let i = 1; i <= total; i++) {
        postPromises.push(getPost(i));
      }
      const results = await Promise.all(postPromises);
      return results
        .filter((post): post is Post => post !== null)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      console.error('Error fetching all posts:', err);
      return [];
    }
  };
  
  const getComments = async (postId: number): Promise<Comment[]> => {
    if (!contract) return [];
    try {
      // @ts-ignore - Thirdweb type inference issue with complex tuple returns
      const commentsData = await readContract({
        contract,
        method: 'function getComments(uint256 _postId) view returns (tuple(uint256 id, uint256 postId, address author, string content, uint256 timestamp)[])',
        params: [BigInt(postId)],
      });
      
      return (commentsData as any[]).map((comment: any) => ({
        id: Number(comment.id),
        postId: Number(comment.postId),
        author: comment.author as string,
        content: comment.content as string,
        timestamp: Number(comment.timestamp),
      }));
    } catch (err) {
      console.error(`Error fetching comments for post ${postId}:`, err);
      return [];
    }
  };
  
  const hasLiked = async (postId: number, userAddress?: string): Promise<boolean> => {
    if (!contract) return false;
    const addressToCheck = userAddress || accountAddress;
    if (!addressToCheck) return false;
    try {
      const liked: any = await readContract({
        contract,
        method: 'function hasLiked(uint256, address) view returns (bool)',
        params: [BigInt(postId), addressToCheck],
      });
      return liked as boolean;
    } catch (err) {
      console.error(`Error checking like status for post ${postId}:`, err);
      return false;
    }
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const refetchData = () => {
    refetchTotalPosts();
    refetchNextPostId();
    refetchNextCommentId();
  };
  
  const clearError = () => setError(null);
  
  useEffect(() => {
    if (transactionError) {
      setError(transactionError.message || 'Transaction failed');
    }
  }, [transactionError]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: BlockchainContextType = {
    contract,
    account: accountAddress,
    totalPosts,
    nextPostId,
    nextCommentId,
    isLoadingPosts: isLoadingTotalPosts,
    isLoadingComments: false,
    isTransactionPending,
    error,
    createPost,
    toggleLike,
    addComment,
    getPost,
    getAllPosts,
    getComments,
    hasLiked,
    refetchData,
    clearError,
  };
  
  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useBlockchain = (): BlockchainContextType => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
};

export default BlockchainContext;
