import { useCallback, useEffect, useMemo, useState } from 'react';
import * as postsApi from '@/api/posts';
import type { PaginatedResponse } from '@/types/domains/common';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostComment,
  PostFeedScope,
} from '@/types/domains/posts';

interface BasePaginationState {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
}

const toPaginationState = <T,>(pageData: PaginatedResponse<T>, pageSize: number): BasePaginationState => ({
  page: pageData.number ?? 0,
  size: pageData.size ?? pageSize,
  totalPages: pageData.totalPages ?? 0,
  totalElements: pageData.totalElements ?? 0,
  hasMore: !(pageData.last ?? true),
});

interface UsePostFeedOptions {
  scope: PostFeedScope;
  viewerId?: string;
  actorId?: string;
  pageSize?: number;
  autoLoad?: boolean;
  includeHidden?: boolean;
}

const fetchPostsByScope = async (
  scope: PostFeedScope,
  viewerId: string | undefined,
  page: number,
  size: number,
  includeHidden: boolean,
) => {
  switch (scope) {
    case 'following':
      if (!viewerId) throw new Error('Viewer ID is required to load following feed');
      return postsApi.getFollowingFeed({ viewerId, page, size });
    case 'mine':
      if (!viewerId) throw new Error('Viewer ID is required to load personal posts');
      return postsApi.getUserPosts(viewerId, {
        viewerId,
        includeHidden,
        page,
        size,
      });
    case 'community':
    default:
      return postsApi.getCommunityFeed({ page, size, viewerId });
  }
};

export const usePostFeed = ({
  scope,
  viewerId,
  actorId,
  pageSize = 10,
  autoLoad = true,
  includeHidden = false,
}: UsePostFeedOptions) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<BasePaginationState>({
    page: 0,
    size: pageSize,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts([]);
    setPagination({
      page: 0,
      size: pageSize,
      totalPages: 0,
      totalElements: 0,
      hasMore: false,
    });
  }, [scope, viewerId, pageSize, includeHidden]);

  const loadPage = useCallback(
    async (page: number, append: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPostsByScope(scope, viewerId, page, pageSize, includeHidden);
        const pageState = toPaginationState(data, pageSize);
        setPagination(pageState);
        setPosts((prev) => {
          const next = data.content ?? [];
          return append ? [...prev, ...next] : next;
        });
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load posts';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [scope, viewerId, pageSize, includeHidden],
  );

  useEffect(() => {
    if (autoLoad) {
      loadPage(0, false);
    }
  }, [autoLoad, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || !pagination.hasMore) return;
    loadPage(pagination.page + 1, true);
  }, [loading, pagination, loadPage]);

  const refresh = useCallback(() => {
    loadPage(0, false);
  }, [loadPage]);

  const createPost = useCallback(
    async (payload: CreatePostRequest, userIdOverride?: string) => {
      const ownerId = userIdOverride ?? actorId;
      if (!ownerId) {
        throw new Error('User ID is required to create a post');
      }
      const newPost = await postsApi.createPost(ownerId, payload);

      const shouldPrepend =
        scope === 'mine'
          ? viewerId === ownerId
          : scope === 'following'
            ? viewerId === ownerId
            : newPost.visibility === 'PUBLIC';

      if (shouldPrepend) {
        setPosts((prev) => [newPost, ...prev]);
      }

      return newPost;
    },
    [actorId, scope, viewerId],
  );

  const updatePost = useCallback(
    async (postId: string, payload: UpdatePostRequest, actorIdOverride?: string) => {
      const actingUserId = actorIdOverride ?? actorId ?? viewerId;
      if (!actingUserId) {
        throw new Error('Actor ID is required to update a post');
      }
      const updated = await postsApi.updatePost(postId, actingUserId, payload);
      setPosts((prev) => prev.map((post) => (post.postId === updated.postId ? updated : post)));
      return updated;
    },
    [actorId, viewerId],
  );

  const deletePost = useCallback(
    async (postId: string, actorIdOverride?: string) => {
      const actingUserId = actorIdOverride ?? actorId ?? viewerId;
      if (!actingUserId) {
        throw new Error('Actor ID is required to delete a post');
      }
      await postsApi.deletePost(postId, actingUserId);
      setPosts((prev) => prev.filter((post) => post.postId !== postId));
    },
    [actorId, viewerId],
  );

  const restorePost = useCallback(
    async (postId: string, actorIdOverride?: string) => {
      const actingUserId = actorIdOverride ?? actorId ?? viewerId;
      if (!actingUserId) {
        throw new Error('Actor ID is required to restore a post');
      }
      const restored = await postsApi.restorePost(postId, actingUserId);
      setPosts((prev) => prev.map((post) => (post.postId === restored.postId ? restored : post)));
      return restored;
    },
    [actorId, viewerId],
  );

  const likePost = useCallback(
    async (postId: string) => {
      if (!viewerId) throw new Error('Viewer ID is required to like a post');
      const updated = await postsApi.likePost(postId, viewerId);
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === updated.postId
            ? {
                ...post,
                likesCount: updated.likesCount,
                likedByViewer: updated.likedByViewer ?? true,
              }
            : post,
        ),
      );
      return updated;
    },
    [viewerId],
  );

  const unlikePost = useCallback(
    async (postId: string) => {
      if (!viewerId) throw new Error('Viewer ID is required to unlike a post');
      const updated = await postsApi.unlikePost(postId, viewerId);
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === updated.postId
            ? {
                ...post,
                likesCount: updated.likesCount,
                likedByViewer: updated.likedByViewer ?? false,
              }
            : post,
        ),
      );
      return updated;
    },
    [viewerId],
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!viewerId) throw new Error('Viewer ID is required to comment');
      const comment = await postsApi.addComment(postId, viewerId, { content });
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId
            ? {
                ...post,
                commentsCount: (post.commentsCount ?? 0) + 1,
              }
            : post,
        ),
      );
      return comment;
    },
    [viewerId],
  );

  const updateComment = useCallback(
    async (postId: string, commentId: number, content: string) => {
      if (!viewerId) throw new Error('Viewer ID is required to update comments');
      return postsApi.updateComment(postId, commentId, viewerId, { content });
    },
    [viewerId],
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: number) => {
      if (!viewerId) throw new Error('Viewer ID is required to delete comments');
      await postsApi.deleteComment(postId, commentId, viewerId);
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId
            ? {
                ...post,
                commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1),
              }
            : post,
        ),
      );
    },
    [viewerId],
  );

  const getComments = useCallback(
    async (postId: string, page: number = 0, size: number = 20) => {
      const data = await postsApi.getComments(postId, { page, size });
      return data;
    },
    [],
  );

  return useMemo(
    () => ({
      posts,
      loading,
      error,
      pagination,
      hasMore: pagination.hasMore,
      scope,
      loadMore,
      refresh,
      createPost,
      updatePost,
      deletePost,
      restorePost,
      likePost,
      unlikePost,
      addComment,
      updateComment,
      deleteComment,
      getComments,
    }),
    [
      posts,
      loading,
      error,
      pagination,
      scope,
      loadMore,
      refresh,
      createPost,
      updatePost,
      deletePost,
      restorePost,
      likePost,
      unlikePost,
      addComment,
      updateComment,
      deleteComment,
      getComments,
    ],
  );
};

interface UseUserPostsOptions {
  userId: string;
  actorId?: string;
  pageSize?: number;
  autoLoad?: boolean;
  includeHidden?: boolean;
}

export const useUserPosts = ({
  userId,
  actorId,
  pageSize = 10,
  autoLoad = true,
  includeHidden = true,
}: UseUserPostsOptions) =>
  usePostFeed({
    scope: 'mine',
    viewerId: userId,
    actorId,
    pageSize,
    autoLoad,
    includeHidden,
  });

export type CommentList = PaginatedResponse<PostComment>;
