import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { sx, sy } from "@/theme/metrics";

export default function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      {icon ? <View style={{ marginRight: sx(6) }}>{icon}</View> : null}
      <Text style={{ color: "#292929", fontSize: sx(14) }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FC",
    borderRadius: sx(8),
    paddingVertical: sy(8),
    paddingHorizontal: sx(10),
  },
});
