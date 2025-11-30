import React, { useState, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import CommentCard from '../components/CommentCard';
import { useBlockchain } from '../context/BlockchainContext' ;
import { Post } from '../types';

const Home: React.FC = () => {
  const account = useActiveAccount();
  const { 
    createPost: blockchainCreatePost,
    addComment: blockchainAddComment,
    toggleLike: blockchainToggleLike,
    getAllPosts,
    isTransactionPending,
    error
  } = useBlockchain();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Handlers with optimistic updates
  const handleCreatePost = async (content: string) => {
    if (!account) return;
    
    // Optimistic update: Add post immediately to UI
    const optimisticPost: Post = {
      id: Date.now(), // Temporary ID
      author: account.address,
      content,
      likes: 0,
      timestamp: Math.floor(Date.now() / 1000),
      comments: [],
    };
    
    const updatedPosts = [optimisticPost, ...posts];
    setPosts(updatedPosts);
    // Update cache immediately for persistence
    localStorage.setItem('anonboard_posts', JSON.stringify(updatedPosts));
    
    setIsCreateModalOpen(false);
    setNewPostContent('');
    
    try {
      // Process blockchain transaction in background
      await blockchainCreatePost(content);
      // Reload posts after a delay to get correct data from blockchain
      setTimeout(() => loadPosts(), 2000);
    } catch (err) {
      console.error('Failed to create post:', err);
      // Revert optimistic update on error
      const revertedPosts = posts.filter(p => p.id !== optimisticPost.id);
      setPosts(revertedPosts);
      localStorage.setItem('anonboard_posts', JSON.stringify(revertedPosts));
    }
  };

  const handleAddComment = async (postId: number, content: string) => {
    if (!account) return;
    
    // Optimistic update: Add comment immediately
    const optimisticComment = {
      id: Date.now(),
      postId,
      author: account.address,
      content,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...(post.comments || []), optimisticComment] }
        : post
    );
    setPosts(updatedPosts);
    // Update cache immediately
    localStorage.setItem('anonboard_posts', JSON.stringify(updatedPosts));
    
    if (selectedPost?.id === postId) {
      const updatedSelectedPost = {
        ...selectedPost,
        comments: [...(selectedPost.comments || []), optimisticComment]
      };
      setSelectedPost(updatedSelectedPost);
    }
    
    setNewCommentContent('');
    
    try {
      // Process blockchain transaction in background
      await blockchainAddComment(postId, content);
      // Reload posts after a delay to sync with blockchain
      setTimeout(async () => {
        const freshPosts = await loadPosts();
        const updatedPost = freshPosts.find((p: Post) => p.id === postId);
        if (updatedPost && selectedPost?.id === postId) {
          setSelectedPost(updatedPost);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to add comment:', err);
      // Revert optimistic update on error
      const revertedPosts = posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments?.filter(c => c.id !== optimisticComment.id) }
          : post
      );
      setPosts(revertedPosts);
      localStorage.setItem('anonboard_posts', JSON.stringify(revertedPosts));
    }
  };

  const handleToggleLike = async (postId: number) => {
    if (!account) return;
    
    // Optimistic update: Toggle like immediately
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 } // Simplified - just increment
        : post
    );
    setPosts(updatedPosts);
    // Update cache immediately
    localStorage.setItem('anonboard_posts', JSON.stringify(updatedPosts));
    
    try {
      // Process blockchain transaction in background
      await blockchainToggleLike(postId);
      // Reload posts after a delay to get accurate like count
      setTimeout(() => loadPosts(), 2000);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert on error
      const revertedPosts = posts.map(post => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes - 1) }
          : post
      );
      setPosts(revertedPosts);
      localStorage.setItem('anonboard_posts', JSON.stringify(revertedPosts));
    }
  };

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
      // Cache posts for next visit
      localStorage.setItem('anonboard_posts', JSON.stringify(fetchedPosts));
      return fetchedPosts;
    } catch (err) {
      console.error('Failed to load posts:', err);
      return [];
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Effects
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    // Load cached posts on mount for instant display
    const cachedPosts = localStorage.getItem('anonboard_posts');
    if (cachedPosts) {
      try {
        setPosts(JSON.parse(cachedPosts));
      } catch (e) {
        console.error('Failed to parse cached posts:', e);
      }
    }
  }, []);

  // Load posts when account connects
  useEffect(() => {
    if (account) {
      loadPosts();
    }
  }, [account]);

  // Reload posts periodically to catch new posts/comments (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      if (account) {
        loadPosts();
      }
    }, 30000); // Refresh every 30 seconds instead of 10
    
    return () => clearInterval(interval);
  }, [account]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const isLoading = isLoadingPosts || isTransactionPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
      />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Connect Wallet Banner */}
        {!account && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white">
            <h2 className="text-xl font-bold mb-2">Connect Your Web3 Wallet</h2>
            <p className="text-blue-50">
              Connect your wallet to view the latest anonymous posts and start sharing your thoughts with the community!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Create Post Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!account || isLoading}
            className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">
              {!account ? 'Connect wallet to post' : 'What\'s on your mind?'}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleToggleLike}
              onViewComments={(post) => setSelectedPost(post)}
            />
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to post!</p>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Post"
      >
        <div className="space-y-4">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your thoughts anonymously..."
            className="w-full h-32 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleCreatePost(newPostContent)}
              disabled={!newPostContent.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title="Comments"
      >
        <div className="space-y-6">
          {/* Original Post Context */}
          {selectedPost && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {selectedPost.content}
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {(selectedPost?.comments?.length || 0) === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments yet. Be the first!</p>
            ) : (
              selectedPost?.comments?.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder={account ? "Write a comment..." : "Connect wallet to comment"}
              disabled={!account || isLoading}
              className="flex-1 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700/50 border-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCommentContent.trim() && selectedPost && !isLoading) {
                  handleAddComment(selectedPost.id, newCommentContent);
                }
              }}
            />
            <button
              onClick={() => selectedPost && handleAddComment(selectedPost.id, newCommentContent)}
              disabled={!newCommentContent.trim() || !account || isLoading}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
