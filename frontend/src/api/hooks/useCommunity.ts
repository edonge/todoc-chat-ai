/**
 * Community API Hooks
 */
import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import type {
  PostCreate,
  PostUpdate,
  PostResponse,
  PostListResponse,
  CommentCreate,
  CommentResponse,
  CommunityCategory,
} from '../types';

interface PostFilters {
  category?: CommunityCategory;
  page?: number;
  per_page?: number;
}

export function useCommunity() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (filters: PostFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.category) params.category = filters.category;
      if (filters.page) params.page = filters.page.toString();
      if (filters.per_page) params.per_page = filters.per_page.toString();

      const response = await apiClient.get<PostListResponse>('/api/v1/community/posts', params);
      setPosts(response.posts);
      setTotalPosts(response.total);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostById = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PostResponse>(`/api/v1/community/posts/${postId}`);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: PostCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<PostResponse>('/api/v1/community/posts', data);
      setPosts((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (postId: number, data: PostUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<PostResponse>(
        `/api/v1/community/posts/${postId}`,
        data
      );
      setPosts((prev) => prev.map((post) => (post.id === postId ? response : post)));
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/community/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const likePost = useCallback(async (postId: number) => {
    try {
      await apiClient.post(`/api/v1/community/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes_count: post.likes_count + 1, is_liked: true }
            : post
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to like post');
      throw err;
    }
  }, []);

  const unlikePost = useCallback(async (postId: number) => {
    try {
      await apiClient.delete(`/api/v1/community/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1), is_liked: false }
            : post
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to unlike post');
      throw err;
    }
  }, []);

  return {
    posts,
    totalPosts,
    loading,
    error,
    fetchPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
  };
}

export function useComments(postId: number) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<CommentResponse[]>(
        `/api/v1/community/posts/${postId}/comments`
      );
      setComments(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(
    async (data: CommentCreate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<CommentResponse>(
          `/api/v1/community/posts/${postId}/comments`,
          data
        );
        setComments((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to create comment');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/api/v1/community/posts/${postId}/comments/${commentId}`);
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete comment');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    deleteComment,
  };
}
