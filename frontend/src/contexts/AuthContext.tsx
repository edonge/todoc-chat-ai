/**
 * AuthContext - 전역 인증 상태 관리
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api/client';
import type { UserResponse, Token } from '@/api/types';
import useAuthStore from '@/store/useAuthStore';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login: storeLogin, logout: storeLogout, init: initAuthStore } = useAuthStore();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const initAuth = async () => {
      initAuthStore(); // Initialize store from localStorage
      const token = useAuthStore.getState().token;
      if (token) {
        try {
          const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
          setUser(userInfo);
        } catch (error) {
          // 토큰 만료 등의 이유로 실패하면 로그아웃
          storeLogout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [initAuthStore, storeLogout]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<Token>('/api/v1/auth/login', {
      username,
      password,
    });

    storeLogin(response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    // 사용자 정보 가져오기
    const userInfo = await apiClient.get<UserResponse>('/api/v1/auth/me');
    setUser(userInfo);
  }, [storeLogin]);

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
    setUser(null);
    storeLogout();
  }, [storeLogout]);

  const refreshUser = useCallback(async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
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
