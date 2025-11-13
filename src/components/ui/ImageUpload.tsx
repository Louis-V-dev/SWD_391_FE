'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { Button } from './Button';
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from '@/lib/cloudinary';

const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER;

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  existingImages?: string[];
  className?: string;
  mode?: 'immediate' | 'deferred';
  onFileSelect?: (files: File[]) => void;
}

interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  file?: File;
}

const arraysAreEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function ImageUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  existingImages = [],
  className = '',
  mode = 'immediate',
  onFileSelect,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      publicId: '',
      status: 'success' as const
    }))
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const lastUploadedUrlsRef = useRef<string[]>([]);
  const lastSelectedFilesRef = useRef<File[]>([]);

  useEffect(() => {
    setImages(prevImages => {
      const prevUrls = prevImages.map(img => img.url);
      if (arraysAreEqual(prevUrls, existingImages)) {
        return prevImages;
      }

      prevImages
        .filter(img => !existingImages.includes(img.url) && img.url.startsWith('blob:'))
        .forEach(img => URL.revokeObjectURL(img.url));

      return existingImages.map((url, index) => {
        const existingImage = prevImages.find(img => img.url === url);
        if (existingImage) {
          return existingImage;
        }

        return {
          id: `existing-${index}`,
          url,
          publicId: '',
          status: 'success' as const
        };
      });
    });
  }, [existingImages]);

  const uploadToCloudinary = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    if (CLOUDINARY_FOLDER) {
      formData.append('folder', CLOUDINARY_FOLDER);
    }

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // ignore json parse errors
    }

    if (!response.ok || !data) {
      const message =
        data?.error?.message || data?.message || `Upload failed (${response.status})`;
      if (process.env.NODE_ENV !== 'production') {
        console.error('Cloudinary upload failed', {
          status: response.status,
          statusText: response.statusText,
          response: data,
        });
      }
      throw new Error(message);
    }

    return {
      id: data.public_id,
      url: data.secure_url,
      publicId: data.public_id,
      status: 'success'
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null);

    // Check if adding these files would exceed the limit
    if (images.length + acceptedFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError(`Files must be smaller than ${maxSize}MB`);
      return;
    }

    if (mode === 'deferred') {
      const localImages = acceptedFiles.map((file, index) => ({
        id: `local-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        publicId: '',
        status: 'success' as const,
        file,
      }));

      setImages(prev => [...prev, ...localImages]);
      return;
    }

    // Create pending upload entries
    const pendingUploads = acceptedFiles.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      publicId: '',
      status: 'uploading' as const
    }));

    setImages(prev => [...prev, ...pendingUploads]);

    const errorMessages: string[] = [];

    const uploadPromises = acceptedFiles.map(async (file, index) => {
      const uploadId = pendingUploads[index].id;
      try {
        const uploadedImage = await uploadToCloudinary(file);
        setImages(prev =>
          prev.map(img =>
            img.id === uploadId ? { ...uploadedImage, id: uploadId } : img
          )
        );
        return { status: 'fulfilled' as const };
      } catch (error: any) {
        setImages(prev =>
          prev.map(img =>
            img.id === uploadId ? { ...img, status: 'error' as const } : img
          )
        );
        const message = error instanceof Error ? error.message : 'Upload failed';
        if (process.env.NODE_ENV !== 'production') {
          console.error('Cloudinary upload error', { uploadId, message });
        }
        errorMessages.push(message);
        return { status: 'rejected' as const, reason: error };
      }
    });

    const results = await Promise.all(uploadPromises);
    const hasFailure = results.some(result => result.status === 'rejected');

    if (hasFailure) {
      const message = errorMessages[0] ?? 'Some uploads failed. Please verify your Cloudinary configuration and try again.';
      setUploadError(message);
    }
  }, [images.length, maxFiles, maxSize, mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles
  });

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === imageId);
      if (target && target.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  useEffect(() => {
    const successful = images
      .filter(img => img.status === 'success')
      .map(img => img.url);

    if (mode === 'deferred') {
      const files = images
        .filter((img): img is UploadedImage & { file: File } => img.status === 'success' && Boolean(img.file))
        .map(img => img.file);

      const filesChanged =
        files.length !== lastSelectedFilesRef.current.length ||
        files.some((file, index) => file !== lastSelectedFilesRef.current[index]);

      if (filesChanged) {
        lastSelectedFilesRef.current = files;
        onFileSelect?.(files);
      }

      if (!arraysAreEqual(successful, lastUploadedUrlsRef.current)) {
        lastUploadedUrlsRef.current = successful;
        onUpload(successful);
      }
      return;
    }

    if (!arraysAreEqual(successful, lastUploadedUrlsRef.current)) {
      lastUploadedUrlsRef.current = successful;
      onUpload(successful);
    }
  }, [images, mode, onFileSelect, onUpload]);

  useEffect(() => {
    lastUploadedUrlsRef.current = [];
    lastSelectedFilesRef.current = [];
  }, [mode]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
          }
          ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {images.length}/{maxFiles} images • Max {maxSize}MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{uploadError}</span>
        </motion.div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                {/* Image */}
                <div className="w-full h-full flex items-center justify-center">
                  {image.url && image.status !== 'uploading' ? (
                    <img
                      src={image.url}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                </div>

                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {image.status === 'uploading' && (
                    <div className="text-white text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">Uploading...</p>
                    </div>
                  )}

                  {image.status === 'error' && (
                    <div className="text-white text-center">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-xs">Upload failed</p>
                    </div>
                  )}

                  {image.status === 'success' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
} 