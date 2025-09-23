import React from "react";
import { View } from "react-native";
import { styles } from "../../styles";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { Pulse } from "./Pulse";

export const LeaveCardSkeleton = () => (
  <View style={styles.leaveCard}>
    <Pulse style={{ height: sy(16), width: sx(140), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginBottom: sy(8) }} />
    {Array.from({ length: 2 }).map((_, i) => (
      <Pulse key={i} style={{ height: sy(12), width: sx(120 + i * 40), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginTop: sy(6) }} />
    ))}
    <Pulse style={{ height: sy(18), width: sx(90), backgroundColor: COLOR.skeleton, borderRadius: sx(12), marginTop: sy(8) }} />
  </View>
);
