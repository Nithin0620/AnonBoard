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

  // Handlers using blockchain context
  const handleCreatePost = async (content: string) => {
    try {
      await blockchainCreatePost(content);
      setIsCreateModalOpen(false);
      setNewPostContent('');
      // Reload posts after creating
      await loadPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleAddComment = async (postId: number, content: string) => {
    try {
      await blockchainAddComment(postId, content);
      setNewCommentContent('');
      // Reload posts after commenting
      await loadPosts();
      
      // Update selected post if modal is open
      const updatedPosts = await getAllPosts();
      const updatedPost = updatedPosts.find((p: Post) => p.id === postId);
      if (updatedPost && selectedPost?.id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      await blockchainToggleLike(postId);
      // Reload posts after toggling like
      await loadPosts();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
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
    
    // Load posts on mount
    loadPosts();
  }, []);

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
