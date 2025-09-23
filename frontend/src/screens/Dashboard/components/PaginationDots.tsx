import React from "react";
import { View } from "react-native";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";

export function PaginationDots({ count, index }: { count: number; index: number }) {
  if (count < 2) return null;
  return (
    <View style={{ flexDirection: "row", alignSelf: "center", marginTop: sy(8) }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: Math.round(sx(8)),
            height: Math.round(sx(8)),
            borderRadius: Math.round(sx(4)),
            marginHorizontal: Math.round(sx(3)),
            backgroundColor: i === index ? COLOR.brand : "#E0E0E0",
          }}
        />
      ))}
    </View>
  );
}
