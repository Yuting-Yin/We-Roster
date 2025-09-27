import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

export default function AppBar() {
  return (
    <View style={styles.appbar}>
      <Text style={styles.title}>Roster</Text>
      <Ionicons name="notifications-outline" size={sx(24)} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  appbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLOR.brand,
    paddingVertical: sy(16),
    paddingHorizontal: sx(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { color: "#fff", fontSize: sx(20) },
});
