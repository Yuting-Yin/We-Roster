import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLOR } from "@/theme/colors";

export default function Settings() {
  return (
    <View style={styles.wrap}>
      <Text style={{ color: COLOR.ink }}>Settings (coming soon)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLOR.bg, alignItems: "center", justifyContent: "center" },
});
