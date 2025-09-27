import React from "react";
import { View, Text } from "react-native";
import { sx, sy } from "@/theme/metrics";
import { styles } from "../styles";

export const Row = ({ text, icon, gap = 4 }: { text: string; icon: React.ReactNode; gap?: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginTop: sy(4) }}>
    <View style={{ marginRight: sx(gap) }}>{icon}</View>
    <Text style={styles.meta12}>{text}</Text>
  </View>
);
