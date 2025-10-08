import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import AppBar from "@/components/common/AppBar";
import { COLOR } from "@/theme/colors";

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <AppBar />
      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Settings (coming soon)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: COLOR.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  comingSoonText: {
    color: COLOR.ink,
    fontSize: 16,
    textAlign: "center",
  },
});
