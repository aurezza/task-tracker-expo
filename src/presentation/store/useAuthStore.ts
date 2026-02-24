import {
  loginUseCase,
  logoutUseCase,
  registerUseCase,
  restoreSessionUseCase
} from '@/core/services';
import { Session, User } from '@supabase/supabase-js'; // Use Supabase types or domain types
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  restoreSession: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  error: null,

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    const result = await restoreSessionUseCase.execute();
    if (result.success) {
      set({ session: result.data, user: result.data?.user ?? null, isLoading: false });
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed to restore session', isLoading: false });
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    const result = await loginUseCase.execute(email, pass);
    if (result.success) {
      set({ session: result.data, user: result.data.user, isLoading: false });
    } else {
       // Supabase error message
      set({ error: result.error instanceof Error ? result.error.message : 'Login failed', isLoading: false });
    }
  },

  register: async (email, pass) => {
    set({ isLoading: true, error: null });
    const result = await registerUseCase.execute(email, pass);
    if (result.success) {
      set({ session: result.data, user: result.data?.user ?? null, isLoading: false });
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Registration failed', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
     // We can just clear local state immediately, but good to call Supabase logout
    const result = await logoutUseCase.execute();
    if (result.success) {
        set({ session: null, user: null, isLoading: false });
    } else {
        set({ error: result.error instanceof Error ? result.error.message : 'Logout failed', isLoading: false, session: null, user: null });
    }
  },
}));
