import React from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  likes: number;
  isLiked: boolean;
  onToggle: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ likes, isLiked, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
