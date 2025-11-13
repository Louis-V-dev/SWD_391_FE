'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Heart,
  MessageCircle,
  Share2,
  EyeOff,
  Loader2,
  SendHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
import type { Post, PostComment, PostVisibility } from '@/types/domains/posts';
import type { CommentList } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  isStaff?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onRestore?: (post: Post) => void;
  onLike?: (postId: string) => Promise<Post | void>;
  onUnlike?: (postId: string) => Promise<Post | void>;
  onAddComment?: (postId: string, content: string) => Promise<PostComment>;
  onUpdateComment?: (postId: string, commentId: number, content: string) => Promise<PostComment>;
  onDeleteComment?: (postId: string, commentId: number) => Promise<void>;
  onUpdatePost?: (postId: string, payload: { content?: string; images?: string[]; hashtags?: string[]; visibility?: PostVisibility }) => Promise<Post | void>;
  fetchComments?: (postId: string, page?: number, size?: number) => Promise<CommentList>;
}

export function PostCard({
  post,
  currentUserId,
  isStaff = false,
  onEdit,
  onDelete,
  onRestore,
  onLike,
  onUnlike,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onUpdatePost,
  fetchComments,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = currentUserId && post.authorId === currentUserId;
  const canManage = isOwner || isStaff;
  const createdDate = new Date(post.createdAt);
  const updatedDate = new Date(post.updatedAt);
  const liked = useMemo(() => Boolean(post.likedByViewer), [post.likedByViewer]);
  const [likePending, setLikePending] = useState(false);
  const likeDisabled = !onLike || !onUnlike || likePending || !currentUserId;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? '');
  const [editHashtagsInput, setEditHashtagsInput] = useState((post.hashtags ?? []).join(' '));
  const [editImages, setEditImages] = useState<string[]>(post.images ?? []);
  const [editVisibility, setEditVisibility] = useState<PostVisibility>(post.visibility);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editImageKey, setEditImageKey] = useState(0);

  useEffect(() => {
    if (!isEditingPost) {
      setEditContent(post.content ?? '');
      setEditHashtagsInput((post.hashtags ?? []).join(' '));
      setEditImages(post.images ?? []);
      setEditVisibility(post.visibility);
    }
  }, [post, isEditingPost]);

  const parsedEditHashtags = useMemo(() => {
    if (!editHashtagsInput.trim()) {
      return [] as string[];
    }
    return editHashtagsInput
      .split(/[\s,#]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.replace(/^#/, ''));
  }, [editHashtagsInput]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleEditMenuAction = () => {
    if (!canManage || !onUpdatePost) {
      onEdit?.(post);
      return;
    }
    setEditContent(post.content ?? '');
    setEditHashtagsInput((post.hashtags ?? []).join(' '));
    setEditImages(post.images ?? []);
    setEditVisibility(post.visibility);
    setEditError(null);
    setEditImageKey((key) => key + 1);
    setIsEditingPost(true);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(post);
  };

  const handleRestore = () => {
    setMenuOpen(false);
    onRestore?.(post);
  };

  const loadComments = useCallback(
    async (page: number, append: boolean) => {
      if (!fetchComments) return;
      try {
        setLoadingComments(true);
        const data = await fetchComments(post.postId, page);
        setComments((prev) => {
          const next = data.content ?? [];
          return append ? [...prev, ...next] : next;
        });
        setCommentsPage(data.number ?? page);
        setHasMoreComments(!(data.last ?? true));
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    },
    [fetchComments, post.postId],
  );

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0 && fetchComments) {
      await loadComments(0, false);
    }
  };

  const handleLoadMoreComments = async () => {
    await loadComments(commentsPage + 1, true);
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !onAddComment) return;
    try {
      setSubmittingComment(true);
      const comment = await onAddComment(post.postId, commentInput.trim());
      setCommentInput('');
      setComments((prev) => [comment, ...prev]);
      if (!showComments) {
        setShowComments(true);
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!onDeleteComment) return;
    try {
      await onDeleteComment(post.postId, commentId);
      setComments((prev) => prev.filter((comment) => comment.commentId !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const handleCommentEditStart = (comment: PostComment) => {
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const handleCommentEditSave = async () => {
    if (!onUpdateComment || editingCommentId == null || !editingContent.trim()) return;
    try {
      const updated = await onUpdateComment(post.postId, editingCommentId, editingContent.trim());
      setComments((prev) =>
        prev.map((comment) => (comment.commentId === updated.commentId ? updated : comment)),
      );
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const handleLikeToggle = async () => {
    if (likeDisabled) return;
    try {
      setLikePending(true);
      if (liked) {
        await onUnlike?.(post.postId);
      } else {
        await onLike?.(post.postId);
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    } finally {
      setLikePending(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditingPost(false);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!onUpdatePost) return;
    if (!editContent.trim() && editImages.length === 0) {
      setEditError('Write something or keep at least one image before saving.');
      return;
    }
    try {
      setEditSubmitting(true);
      await onUpdatePost(post.postId, {
        content: editContent.trim(),
        images: editImages,
        hashtags: parsedEditHashtags,
        visibility: editVisibility,
      });
      setIsEditingPost(false);
      setEditError(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update post';
      setEditError(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${post.hidden ? 'opacity-70' : ''}`}>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
          {post.authorDisplayName?.charAt(0)?.toUpperCase() || post.authorUsername?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{post.authorDisplayName || post.authorUsername}</p>
            <Badge variant="secondary" className="uppercase text-xs">
              {post.postType.replace(/_/g, ' ')}
            </Badge>
            {post.featured && (
              <Badge variant="success" className="uppercase text-xs">
                Featured
              </Badge>
            )}
            {post.hidden && (
              <Badge variant="outline" className="uppercase text-xs flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Hidden
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
            <span>{createdDate.toLocaleString()}</span>
            {updatedDate.getTime() !== createdDate.getTime() && (
              <span>(Edited {updatedDate.toLocaleString()})</span>
            )}
            <span>• Visibility: {post.visibility.replace(/_/g, ' ')}</span>
            {post.itemId && post.itemName && (
              <Link href={`/item/${post.itemId}`} className="text-primary hover:underline">
                View related item: {post.itemName}
              </Link>
            )}
          </div>
        </div>
        {canManage && (
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <MoreVertical className="h-4 w-4" />
            </Button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-background shadow-lg z-10"
                >
                  <div className="py-2">
                    {onUpdatePost && (
                      <button
                        onClick={handleEditMenuAction}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                        Edit post
                      </button>
                    )}
                    {!post.hidden && onDelete && (
                      <button
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove post
                      </button>
                    )}
                    {post.hidden && onRestore && (
                      <button
                        onClick={handleRestore}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Restore post
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardHeader>

      {isEditingPost ? (
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              placeholder="Update your post content..."
              className="w-full min-h-[120px] resize-none rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Images</span>
                <ImageUpload
                  key={editImageKey}
                  onUpload={setEditImages}
                  existingImages={editImages}
                  maxFiles={6}
                  className="border-dashed"
                />
              </label>

              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Hashtags</span>
                  <input
                    type="text"
                    value={editHashtagsInput}
                    onChange={(event) => setEditHashtagsInput(event.target.value)}
                    placeholder="#sustainability #upcycling"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/40 transition outline-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with spaces or commas. We&apos;ll format them automatically.
                  </p>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Visibility</span>
                  <select
                    value={editVisibility}
                    onChange={(event) => setEditVisibility(event.target.value as PostVisibility)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition"
                  >
                    {(['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE'] as PostVisibility[]).map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {editError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {editError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleEditCancel} disabled={editSubmitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSave} disabled={editSubmitting}>
                {editSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        (post.content || post.images.length > 0 || post.videos.length > 0 || post.hashtags.length > 0) && (
          <CardContent className="space-y-4">
            {post.content && (
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
            )}

            {post.images.length > 0 && (
              <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                {post.images.map((url) => (
                  <div
                    key={url}
                    className="rounded-lg overflow-hidden border border-border bg-muted/20 aspect-square"
                  >
                    <img
                      src={url}
                      alt="Post media"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {post.videos.length > 0 && (
              <div className="space-y-3">
                {post.videos.map((videoUrl) => (
                  <div key={videoUrl} className="rounded-lg overflow-hidden border border-border">
                    <video src={videoUrl} controls className="w-full" />
                  </div>
                ))}
              </div>
            )}

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag.replace(/^#/, '')}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )
      )}

      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/50 bg-muted/30">
        <div className="flex items-center gap-6 text-sm text-muted-foreground px-2 pt-2">
          <span>{post.likesCount ?? 0} likes</span>
          <span>{post.commentsCount ?? 0} comments</span>
          <span>{post.sharesCount ?? 0} shares</span>
        </div>
        <div className="flex items-center justify-between px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${liked ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleLikeToggle}
            disabled={likeDisabled}
            aria-pressed={liked}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {liked ? 'Liked' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground"
            onClick={handleToggleComments}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-border/50 pt-3 space-y-4"
            >
              {onAddComment && (
                <div className="flex items-start gap-3">
                  <textarea
                    value={editingCommentId == null ? commentInput : editingContent}
                    onChange={(event) =>
                      editingCommentId == null
                        ? setCommentInput(event.target.value)
                        : setEditingContent(event.target.value)
                    }
                    placeholder="Write a comment..."
                    className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition"
                    rows={2}
                  />
                  {editingCommentId == null ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleCommentSubmit}
                      disabled={submittingComment || !commentInput.trim()}
                    >
                      {submittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizontal className="h-4 w-4" />
                      )}
                      Post
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCommentEditSave}
                        disabled={!editingContent.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {loadingComments && comments.length === 0 ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.commentId} className="rounded-lg border border-border bg-muted/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <span>{comment.authorDisplayName || comment.authorUsername}</span>
                            {comment.edited && (
                              <Badge variant="outline" className="text-[10px] uppercase">
                                Edited
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {(comment.authorId === currentUserId || isStaff) && (
                          <div className="flex gap-1">
                            {comment.authorId === currentUserId && onUpdateComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleCommentEditStart(comment)}
                              >
                                Edit
                              </Button>
                            )}
                            {onDeleteComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleCommentDelete(comment.commentId)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-foreground whitespace-pre-line">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {hasMoreComments && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMoreComments}
                    disabled={loadingComments}
                    className="text-muted-foreground"
                  >
                    {loadingComments ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'View more comments'
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}

