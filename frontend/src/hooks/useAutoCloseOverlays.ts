// frontend/src/hooks/useAutoCloseOverlays.ts
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOverlayContext } from '@/contexts/OverlayContext';

/**
 * Custom hook that automatically closes overlays when navigating between tabs
 * @param overlayStates - Array of overlay state setters to close
 */
export function useAutoCloseOverlays(overlayStates: Array<() => void>) {
  const navigation = useNavigation();
  const { closeAllOverlays } = useOverlayContext();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      // Close all overlays when any tab is pressed
      closeAllOverlays();
    });

    return unsubscribe;
  }, [navigation, closeAllOverlays]);
}
