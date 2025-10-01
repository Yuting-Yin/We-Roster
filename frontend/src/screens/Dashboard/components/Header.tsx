import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx } from "@/theme/metrics";
import { styles } from "../styles";
import NotificationBell from "@/components/common/NotificationBell";

export const Header = memo(function Header({
  name,
  onHelloPress,
  onBellPress,
  unreadCount = 0,
}: {
  name: string;
  onHelloPress: () => void;
  onBellPress?: () => void;
  unreadCount?: number;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.headerLeft}
        onPress={onHelloPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
      >
        <Ionicons name="person-circle-outline" size={sx(24)} color="#fff" />
        <Text style={styles.headerTitle}>Hello, {name}</Text>
      </Pressable>
      <NotificationBell
        onPress={onBellPress || (() => {})}
        unreadCount={unreadCount}
        size={24}
        color="#fff"
      />
    </View>
  );
});
