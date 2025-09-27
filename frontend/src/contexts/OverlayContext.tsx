// frontend/src/contexts/OverlayContext.tsx
import React, { createContext, useContext, useCallback } from 'react';

interface OverlayContextType {
  registerOverlay: (id: string, closeFunction: () => void) => void;
  unregisterOverlay: (id: string) => void;
  closeAllOverlays: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const overlays = React.useRef<Map<string, () => void>>(new Map());

  const registerOverlay = useCallback((id: string, closeFunction: () => void) => {
    overlays.current.set(id, closeFunction);
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    overlays.current.delete(id);
  }, []);

  const closeAllOverlays = useCallback(() => {
    overlays.current.forEach((closeFunction) => {
      closeFunction();
    });
  }, []);

  return (
    <OverlayContext.Provider value={{ registerOverlay, unregisterOverlay, closeAllOverlays }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlayContext() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlayContext must be used within an OverlayProvider');
  }
  return context;
}
