/**
 * AuthContext - 전역 인증 상태 관리
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api/client';
import type { UserResponse, Token } from '@/api/types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient.setToken(token);
        try {
          const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
          setUser(userInfo);
        } catch (error) {
          // 토큰 만료 등의 이유로 실패하면 로그아웃
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<Token>('/api/v1/auth/login', {
      username,
      password,
    });

    apiClient.setToken(response.access_token);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    // 사용자 정보 가져오기
    const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
    setUser(userInfo);
  }, []);

  const signup = useCallback(async (username: string, password: string, nickname?: string) => {
    await apiClient.post<UserResponse>('/api/v1/auth/signup', {
      username,
      password,
      nickname,
    });
    // 회원가입 후 자동 로그인
    await login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('selected_kid_id');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!apiClient.getToken()) return;
    try {
      const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
      setUser(userInfo);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
