import React, { createContext, useContext, useCallback, ReactNode } from 'react';

interface RequestRefreshContextType {
  triggerRefresh: () => void;
  registerRefreshCallback: (key: string, callback: () => void) => void;
  unregisterRefreshCallback: (key: string) => void;
}

const RequestRefreshContext = createContext<RequestRefreshContextType | null>(null);

interface RequestRefreshProviderProps {
  children: ReactNode;
}

export function RequestRefreshProvider({ children }: RequestRefreshProviderProps) {
  const refreshCallbacks = React.useRef<Map<string, () => void>>(new Map());

  const triggerRefresh = useCallback(() => {
    console.log('🔄 RequestRefreshContext - Triggering refresh for all registered components');
    refreshCallbacks.current.forEach((callback, key) => {
      try {
        console.log(`🔄 RequestRefreshContext - Refreshing component: ${key}`);
        callback();
      } catch (error) {
        console.error(`🔄 RequestRefreshContext - Error refreshing component ${key}:`, error);
      }
    });
  }, []);

  const registerRefreshCallback = useCallback((key: string, callback: () => void) => {
    console.log(`🔄 RequestRefreshContext - Registering refresh callback for: ${key}`);
    refreshCallbacks.current.set(key, callback);
  }, []);

  const unregisterRefreshCallback = useCallback((key: string) => {
    console.log(`🔄 RequestRefreshContext - Unregistering refresh callback for: ${key}`);
    refreshCallbacks.current.delete(key);
  }, []);

  const value = React.useMemo(
    () => ({
      triggerRefresh,
      registerRefreshCallback,
      unregisterRefreshCallback,
    }),
    [triggerRefresh, registerRefreshCallback, unregisterRefreshCallback]
  );

  return (
    <RequestRefreshContext.Provider value={value}>
      {children}
    </RequestRefreshContext.Provider>
  );
}

export function useRequestRefresh() {
  const context = useContext(RequestRefreshContext);
  if (!context) {
    throw new Error('useRequestRefresh must be used within a RequestRefreshProvider');
  }
  return context;
}
