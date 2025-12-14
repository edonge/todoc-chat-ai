import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  login: (token) => {
    localStorage.setItem('access_token', token);
    set({ isAuthenticated: true, token });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ isAuthenticated: false, token: null });
  },
  init: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      set({ isAuthenticated: true, token });
    }
  },
}));

export default useAuthStore;
