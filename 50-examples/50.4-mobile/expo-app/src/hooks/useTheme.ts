import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeState, ThemeMode } from '@types';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const colors = {
    background: isDark ? '#0a0a0a' : '#ffffff',
    surface: isDark ? '#1c1c1e' : '#f2f2f7',
    primary: '#007AFF',
    secondary: '#5856D6',
    text: isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#8e8e93' : '#666666',
    border: isDark ? '#38383a' : '#e5e5ea',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  };

  return {
    isDark,
    colors,
    mode,
    setMode: useThemeStore((state) => state.setMode),
  };
}
