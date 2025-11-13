import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from '@/types/domains/common';
import type { Post, CreatePostRequest, UpdatePostRequest, PostComment } from '@/types/domains/posts';

export const createPost = async (userId: string, payload: CreatePostRequest): Promise<Post> => {
  const response = await axiosInstance.post<Post>(`/api/posts/users/${userId}`, payload);
  return response.data;
};

export const getPost = async (postId: string, viewerId?: string): Promise<Post> => {
  const response = await axiosInstance.get<Post>(`/api/posts/${postId}`, {
    params: viewerId ? { viewerId } : undefined,
  });
  return response.data;
};

export const getUserPosts = async (
  userId: string,
  options: {
    viewerId?: string;
    includeHidden?: boolean;
    page?: number;
    size?: number;
  } = {}
): Promise<PaginatedResponse<Post>> => {
  const { viewerId, includeHidden = false, page = 0, size = 10 } = options;
  const response = await axiosInstance.get<PaginatedResponse<Post>>(`/api/posts/users/${userId}`, {
    params: {
      viewerId,
      includeHidden,
      page,
      size,
    },
  });
  return response.data;
};

export const getFeed = async (
  options: {
    viewerId?: string;
    page?: number;
    size?: number;
  } = {}
): Promise<PaginatedResponse<Post>> => {
  const { viewerId, page = 0, size = 10 } = options;
  const response = await axiosInstance.get<PaginatedResponse<Post>>('/api/posts/feed', {
    params: {
      viewerId,
      page,
      size,
    },
  });
  return response.data;
};

export const getFollowingFeed = async ({
  viewerId,
  page = 0,
  size = 10,
}: {
  viewerId: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Post>> => {
  const response = await axiosInstance.get<PaginatedResponse<Post>>('/api/posts/feed/following', {
    params: {
      viewerId,
      page,
      size,
    },
  });
  return response.data;
};

export const getCommunityFeed = async ({
  page = 0,
  size = 10,
  viewerId,
}: {
  page?: number;
  size?: number;
  viewerId?: string;
}): Promise<PaginatedResponse<Post>> => {
  const response = await axiosInstance.get<PaginatedResponse<Post>>('/api/posts/feed/community', {
    params: {
      page,
      size,
      viewerId,
    },
  });
  return response.data;
};

export const likePost = async (postId: string, userId: string): Promise<Post> => {
  const response = await axiosInstance.post<Post>(`/api/posts/${postId}/like`, null, {
    params: { userId },
  });
  return response.data;
};

export const unlikePost = async (postId: string, userId: string): Promise<Post> => {
  const response = await axiosInstance.delete<Post>(`/api/posts/${postId}/like`, {
    params: { userId },
  });
  return response.data;
};

export const updatePost = async (
  postId: string,
  actorId: string,
  payload: UpdatePostRequest
): Promise<Post> => {
  const response = await axiosInstance.put<Post>(`/api/posts/${postId}`, payload, {
    params: { actorId },
  });
  return response.data;
};

export const deletePost = async (postId: string, actorId: string): Promise<void> => {
  await axiosInstance.delete(`/api/posts/${postId}`, {
    params: { actorId },
  });
};

export const restorePost = async (postId: string, actorId: string): Promise<Post> => {
  const response = await axiosInstance.patch<Post>(`/api/posts/${postId}/restore`, null, {
    params: { actorId },
  });
  return response.data;
};

export const getComments = async (
  postId: string,
  options: { page?: number; size?: number } = {},
): Promise<PaginatedResponse<PostComment>> => {
  const { page = 0, size = 20 } = options;
  const response = await axiosInstance.get<PaginatedResponse<PostComment>>(`/api/posts/${postId}/comments`, {
    params: { page, size },
  });
  return response.data;
};

export const addComment = async (
  postId: string,
  userId: string,
  payload: { content: string },
): Promise<PostComment> => {
  const response = await axiosInstance.post<PostComment>(`/api/posts/${postId}/comments`, payload, {
    params: { userId },
  });
  return response.data;
};

export const updateComment = async (
  postId: string,
  commentId: number,
  userId: string,
  payload: { content: string },
): Promise<PostComment> => {
  const response = await axiosInstance.put<PostComment>(`/api/posts/${postId}/comments/${commentId}`, payload, {
    params: { userId },
  });
  return response.data;
};

export const deleteComment = async (postId: string, commentId: number, userId: string) => {
  await axiosInstance.delete(`/api/posts/${postId}/comments/${commentId}`, {
    params: { userId },
  });
};

export const uploadPostImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await axiosInstance.post<string[]>('/api/posts/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

