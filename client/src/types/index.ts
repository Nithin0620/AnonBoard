export interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: number;
  likes: number;
  comments?: Comment[]; // Optional: fetched separately
}
