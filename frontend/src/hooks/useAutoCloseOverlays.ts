// frontend/src/hooks/useAutoCloseOverlays.ts
import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOverlayContext } from '@/contexts/OverlayContext';

/**
 * Custom hook that automatically closes overlays when navigating between tabs or screens
 * @param overlayStates - Array of overlay state setters to close
 */
export function useAutoCloseOverlays(overlayStates: Array<() => void>) {
  const navigation = useNavigation();
  const { closeAllOverlays } = useOverlayContext();
  const hasBeenBlurred = useRef(false);

  useEffect(() => {
    // Listen for tab press events
    const unsubscribeTabPress = navigation.addListener('tabPress', () => {
      // Close all overlays when any tab is pressed
      closeAllOverlays();
    });

    // Listen for blur events - mark that screen has been blurred
    const unsubscribeBlur = navigation.addListener('blur', () => {
      // Mark that the screen has been blurred (user navigated away)
      hasBeenBlurred.current = true;
      // Also close overlays immediately when leaving
      closeAllOverlays();
    });

    // Listen for focus events - only close overlays if screen was previously blurred
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // Only close overlays if the screen was previously blurred (user navigated away and back)
      if (hasBeenBlurred.current) {
        closeAllOverlays();
        hasBeenBlurred.current = false; // Reset the flag
      }
    });

    return () => {
      unsubscribeTabPress();
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation, closeAllOverlays]);
}
