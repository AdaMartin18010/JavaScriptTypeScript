import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppContext as IAppContext, Config, AppState } from './types';
import { DEFAULT_CONFIG } from './constants';

// 创建 Context
const AppContextInstance = createContext<IAppContext | null>(null);

interface AppProviderProps {
  children: ReactNode;
  config?: Partial<Config>;
}

/**
 * 应用提供者组件
 */
export function AppProvider({ children, config = {} }: AppProviderProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setStateState] = useState<AppState>({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    theme: mergedConfig.theme,
  });

  const setState = useCallback((partial: Partial<AppState>) => {
    setStateState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value: IAppContext = {
    config: mergedConfig,
    state,
    setState,
  };

  return (
    <AppContextInstance.Provider value={value}>
      {children}
    </AppContextInstance.Provider>
  );
}

/**
 * 使用应用 Context
 */
export function useAppContext(): IAppContext {
  const context = useContext(AppContextInstance);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export { AppContextInstance as AppContext };
