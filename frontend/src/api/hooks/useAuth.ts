/**
 * Auth API Hooks
 */
import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import type { UserCreate, UserLogin, UserResponse, Token } from '../types';

export function useAuth() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: UserCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<UserResponse>('/api/v1/auth/register', data);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: UserLogin) => {
    setLoading(true);
    setError(null);
    try {
      // FastAPI OAuth2 expects form data
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const token: Token = await response.json();
      apiClient.setToken(token.access_token);
      localStorage.setItem('refresh_token', token.refresh_token);

      // Fetch user info
      const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
      setUser(userInfo);

      return token;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!apiClient.getToken()) return null;

    setLoading(true);
    try {
      const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
      setUser(userInfo);
      return userInfo;
    } catch (err: any) {
      // Token might be expired
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;

    try {
      const response = await apiClient.post<Token>('/api/v1/auth/refresh', {
        refresh_token: refresh,
      });
      apiClient.setToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    fetchCurrentUser,
    refreshToken,
    isAuthenticated: !!apiClient.getToken(),
  };
}
