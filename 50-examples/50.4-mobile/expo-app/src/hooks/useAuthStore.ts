import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '@types';
import * as SecureStore from 'expo-secure-store';
import { post } from '@utils/api';

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'idle',

      login: async (email: string, password: string) => {
        set({ status: 'loading' });
        try {
          const response = await post<{ user: User; token: string; refreshToken: string }>(
            '/auth/login',
            { email, password }
          );
          await SecureStore.setItemAsync('auth_token', response.token);
          await SecureStore.setItemAsync('refresh_token', response.refreshToken);
          set({ user: response.user, token: response.token, status: 'authenticated' });
        } catch (error) {
          set({ status: 'unauthenticated' });
          throw error;
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        set({ user: null, token: null, status: 'unauthenticated' });
      },

      initializeAuth: async () => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (token) {
            // In a real app, validate token and fetch user
            set({ token, status: 'authenticated' });
          } else {
            set({ status: 'unauthenticated' });
          }
        } catch {
          set({ status: 'unauthenticated' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
