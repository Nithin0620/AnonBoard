import { Post } from '../types';
import { MessageSquare, User } from 'lucide-react';
import LikeButton from './LikeButton';

interface PostCardProps {
  post: Post;
  onLike: (id: number) => void;
  onViewComments: (post: Post) => void;
}

const PostCard = ({ post, onLike, onViewComments }: PostCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{post.author}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(post.timestamp).toLocaleDateString()} • {new Date(post.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <p className="text-gray-800 dark:text-gray-200 mb-6 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <LikeButton 
          likes={post.likes} 
          isLiked={false} // In a real app, check if current user liked
          onToggle={() => onLike(post.id)} 
        />
        
        <button 
          onClick={() => onViewComments(post)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments?.length || 0} Comments</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
