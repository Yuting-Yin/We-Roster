// frontend/src/contexts/OverlayContext.tsx
import React, { createContext, useContext, useCallback, useState } from 'react';

export type TeamMemberNavRequest = {
  staffId: number;
  staffName: string;
  staffInitials?: string;
  returnToTab?: string; // Tab to return to after closing staff details
  timestamp: number;
  // Overlay state to restore when returning
  overlayState?: {
    type: 'shift-details' | 'open-shift-details';
    event?: any; // The event/shift data
    date?: Date;
  };
};

interface OverlayContextType {
  registerOverlay: (id: string, closeFunction: () => void) => void;
  unregisterOverlay: (id: string) => void;
  closeAllOverlays: () => void;
  requestTeamMemberNav: (staffId: number, staffName: string, staffInitials?: string, returnToTab?: string, overlayState?: any) => void;
  teamMemberNavRequest: TeamMemberNavRequest | null;
  clearTeamMemberNavRequest: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const overlays = React.useRef<Map<string, () => void>>(new Map());
  const [teamMemberNavRequest, setTeamMemberNavRequest] = useState<TeamMemberNavRequest | null>(null);

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

  const requestTeamMemberNav = useCallback((staffId: number, staffName: string, staffInitials?: string, returnToTab?: string, overlayState?: any) => {
    setTeamMemberNavRequest({
      staffId,
      staffName,
      staffInitials,
      returnToTab,
      overlayState,
      timestamp: Date.now(),
    });
  }, []);

  const clearTeamMemberNavRequest = useCallback(() => {
    setTeamMemberNavRequest(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ 
      registerOverlay, 
      unregisterOverlay, 
      closeAllOverlays,
      requestTeamMemberNav,
      teamMemberNavRequest,
      clearTeamMemberNavRequest,
    }}>
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
