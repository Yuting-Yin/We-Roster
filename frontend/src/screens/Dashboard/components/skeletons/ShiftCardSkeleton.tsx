import React from "react";
import { View } from "react-native";
import { styles } from "../../styles";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { Pulse } from "./Pulse";

export const ShiftCardSkeleton = () => (
  <View style={styles.shiftCard}>
    <Pulse style={{ height: sy(16), width: sx(140), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginBottom: sy(8) }} />
    {Array.from({ length: 3 }).map((_, i) => (
      <Pulse key={i} style={{ height: sy(12), width: sx(120 + i * 20), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginTop: sy(6) }} />
    ))}
  </View>
);
