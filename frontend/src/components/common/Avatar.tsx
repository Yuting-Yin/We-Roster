import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLOR } from "@/theme/colors";
import { sx } from "@/theme/metrics";

export default function Avatar({ initials }: { initials: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.txt}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: sx(28),
    height: sx(28),
    borderRadius: sx(14),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: { color: "#fff", fontSize: sx(10), fontWeight: "700" },
});