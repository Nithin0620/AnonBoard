import React from 'react';
import { Comment } from '../types';
import { User } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.author}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(comment.timestamp).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export default CommentCard;
