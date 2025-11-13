'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Hash, SendHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadPostImages } from '@/api/posts';
import type { CreatePostRequest, PostVisibility } from '@/types/domains/posts';

interface PostComposerProps {
  onSubmit: (payload: CreatePostRequest) => Promise<void>;
  loading?: boolean;
  displayName?: string;
  avatarUrl?: string | null;
  visibilities?: PostVisibility[];
}

const DEFAULT_VISIBILITIES: PostVisibility[] = ['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE'];

export function PostComposer({
  onSubmit,
  loading = false,
  displayName,
  avatarUrl,
  visibilities = DEFAULT_VISIBILITIES,
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC');
  const [error, setError] = useState<string | null>(null);
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return !loading && (content.trim().length > 0 || images.length > 0 || selectedFiles.length > 0);
  }, [content, images.length, loading, selectedFiles.length]);

  const formattedHashtags = useMemo(() => {
    if (!hashtagsInput.trim()) {
      return [];
    }
    return hashtagsInput
      .split(/[,\s#]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.replace(/^#/, ''));
  }, [hashtagsInput]);

  const handleFocus = () => setExpanded(true);

  const handleReset = () => {
    setContent('');
    setImages([]);
    setSelectedFiles([]);
    setHashtagsInput('');
    setVisibility('PUBLIC');
    setImageUploadKey((prev) => prev + 1);
    setExpanded(false);
    setError(null);
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Write something or add media before sharing.');
      return;
    }

    setError(null);

    try {
      setSubmitting(true);

      let finalImageUrls: string[] | undefined;

      if (selectedFiles.length > 0) {
        try {
          finalImageUrls = await uploadPostImages(selectedFiles);
          setImages(finalImageUrls);
          setSelectedFiles([]);
        } catch (uploadError: any) {
          const message =
            uploadError?.response?.data?.message ||
            uploadError?.message ||
            'Failed to upload images';
          setError(message);
          return;
        }
      } else if (images.length > 0) {
        finalImageUrls = images;
      }

      await onSubmit({
        content: content.trim(),
        images: finalImageUrls && finalImageUrls.length ? finalImageUrls : undefined,
        hashtags: formattedHashtags.length ? formattedHashtags : undefined,
        visibility,
      });

      handleReset();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create post';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm border border-border/60">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-lg font-semibold text-primary-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName ?? 'User avatar'}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (displayName ?? 'You').charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <CardTitle className="text-base font-semibold text-foreground">
            Share something with the community
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {displayName ? `Posting as ${displayName}` : 'Connect with other sustainable fashion lovers'}
          </p>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button variant="ghost" size="icon" onClick={handleReset} disabled={submitting}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-6">
        <textarea
          id="post-composer-textarea"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What sustainable story or fashion tip would you like to share today?"
          onFocus={handleFocus}
          className="w-full min-h-[80px] resize-none rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
        />

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <ImagePlus className="h-4 w-4" />
                    Images
                  </span>
                  <ImageUpload
                    key={imageUploadKey}
                    onUpload={setImages}
                    existingImages={images}
                    maxFiles={6}
                    className="border-dashed"
                    mode="deferred"
                    onFileSelect={handleFilesSelected}
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <Hash className="h-4 w-4" />
                    Hashtags
                  </span>
                  <input
                    type="text"
                    value={hashtagsInput}
                    onChange={(event) => setHashtagsInput(event.target.value)}
                    placeholder="#sustainability #upcycling"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/40 transition outline-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas or spaces. We&apos;ll format them automatically.
                  </p>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Visibility</span>
                  <select
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value as PostVisibility)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition"
                  >
                    {visibilities.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2"
          >
            {error}
          </motion.p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2"
          >
            <SendHorizontal className="h-4 w-4" />
            {submitting ? 'Sharing...' : 'Share post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

