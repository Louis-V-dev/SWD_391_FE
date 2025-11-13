'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { usePostFeed } from '@/hooks/usePosts';
import type { CreatePostRequest, PostFeedScope } from '@/types/domains/posts';

interface PostsFeedProps {
  viewerId?: string;
  actorId?: string;
  allowCreate?: boolean;
  displayName?: string;
  avatarUrl?: string | null;
  isStaff?: boolean;
}

export function PostsFeed({
  viewerId,
  actorId,
  allowCreate = false,
  displayName,
  avatarUrl,
  isStaff = false,
}: PostsFeedProps) {
  const defaultTab: PostFeedScope = viewerId ? 'following' : 'community';
  const [activeTab, setActiveTab] = useState<PostFeedScope>(defaultTab);

  const tabs = useMemo(() => {
    if (!viewerId) {
      return [{ id: 'community' as PostFeedScope, label: 'Community' }];
    }
    return [
      { id: 'following' as PostFeedScope, label: 'Following' },
      { id: 'community' as PostFeedScope, label: 'Community' },
      { id: 'mine' as PostFeedScope, label: 'My Posts' },
    ];
  }, [viewerId]);

  const {
    posts,
    loading,
    error,
    hasMore,
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
  } = usePostFeed({
    scope: activeTab,
    viewerId,
    actorId,
    pageSize: 6,
    includeHidden: activeTab === 'mine',
  });

  const handleCreate = async (payload: CreatePostRequest) => {
    await createPost(payload);
  };

  const handleDelete = async (postId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to remove this post?');
      if (!confirmed) return;
    }
    await deletePost(postId);
  };

  const handleRestore = async (postId: string) => {
    await restorePost(postId);
  };

  const noPostsMessage = useMemo(() => {
    switch (activeTab) {
      case 'mine':
        return 'You have not created any posts yet.';
      case 'following':
        return 'Follow people to see their latest updates.';
      default:
        return 'No posts to show right now. Be the first to share something!';
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {tabs.length > 1 && (
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {allowCreate && actorId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PostComposer onSubmit={handleCreate} displayName={displayName} avatarUrl={avatarUrl} />
        </motion.div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-muted/20 px-8 py-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">No posts yet</h3>
          <p className="text-sm text-muted-foreground">{noPostsMessage}</p>
          {allowCreate && actorId && activeTab !== 'community' && (
            <Button onClick={() => document.getElementById('post-composer-textarea')?.focus()}>
              Share your first post
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div
            key={post.postId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PostCard
              post={post}
              currentUserId={actorId}
              isStaff={!!isStaff}
              onDelete={() => handleDelete(post.postId)}
              onRestore={() => handleRestore(post.postId)}
              onLike={viewerId ? likePost : undefined}
              onUnlike={viewerId ? unlikePost : undefined}
              onAddComment={viewerId ? addComment : undefined}
              onUpdateComment={viewerId ? updateComment : undefined}
              onDeleteComment={viewerId ? deleteComment : undefined}
              onUpdatePost={viewerId ? updatePost : undefined}
              fetchComments={getComments}
            />
          </motion.div>
        ))}
      </div>

      {loading && posts.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={loading} variant="outline">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
