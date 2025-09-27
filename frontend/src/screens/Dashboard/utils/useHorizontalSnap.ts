// src/screens/Dashboard/utils/useHorizontalSnap.ts
import { useCallback, useRef } from "react";
import type { ViewToken } from "react-native";
import { IS_WEB, LEFT_PAD, SNAP } from "../constants";

export function useHorizontalSnapProps<T>(setter: (n: number) => void) {
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: Array<ViewToken<T>> }) => {
      const idx = info.viewableItems[0]?.index;
      if (typeof idx === "number") setter(idx);
    },
    [setter]
  );

  if (IS_WEB) return {} as const;

  return {
    decelerationRate: "fast" as const,
    snapToAlignment: "start" as const,
    snapToInterval: SNAP,
    onViewableItemsChanged,
    viewabilityConfig: viewConfigRef.current,
    getItemLayout: (_: any, index: number) => ({
      length: SNAP,
      offset: LEFT_PAD + SNAP * index,
      index,
    }),
  } as const;
}
