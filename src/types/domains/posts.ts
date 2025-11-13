export type PostType =
  | 'GENERAL'
  | 'OUTFIT'
  | 'STYLING_TIP'
  | 'SUSTAINABILITY_TIP'
  | 'ITEM_SHOWCASE'
  | 'BEFORE_AFTER'
  | 'RECYCLING_STORY'
  | 'BRAND_REVIEW'
  | 'LIVE_STREAM_ANNOUNCEMENT';

export type PostVisibility = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

export interface Post {
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string | null;
  content?: string | null;
  images: string[];
  videos: string[];
  hashtags: string[];
  postType: PostType;
  visibility: PostVisibility;
  featured: boolean;
  hidden: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  likedByViewer?: boolean | null;
  itemId?: string | null;
  itemName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content?: string;
  images?: string[];
  hashtags?: string[];
  itemId?: string;
  visibility?: PostVisibility;
  featured?: boolean;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  hidden?: boolean;
}

export interface PostComment {
  commentId: number;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string | null;
  content: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export type PostFeedScope = 'following' | 'community' | 'mine';

