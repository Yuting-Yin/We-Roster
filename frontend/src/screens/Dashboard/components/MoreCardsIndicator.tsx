import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";

interface MoreCardsIndicatorProps {
  count: number; // Number of hidden cards
}

export function MoreCardsIndicator({ count }: MoreCardsIndicatorProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="ellipsis-horizontal-circle" size={sx(32)} color={COLOR.brand} />
        <Text style={styles.text}>
          +{count} more {count === 1 ? 'card' : 'cards'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: sx(280),
    height: sy(180),
    marginRight: sx(16),
    borderRadius: sx(12),
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: COLOR.divider,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: sy(8),
  },
  text: {
    fontSize: sx(14),
    fontWeight: "600",
    color: COLOR.label,
    textAlign: "center",
  },
});

