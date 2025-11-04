import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { useSettings } from "@/contexts/SettingsContext";

interface NotificationBellProps {
  onPress: () => void;
  unreadCount?: number;
  size?: number;
  color?: string;
  hitSlop?: number;
  accessibilityLabel?: string;
}

export default function NotificationBell({
  onPress,
  unreadCount = 0,
  size = 24,
  color = "#fff",
  hitSlop = 8,
  accessibilityLabel = "Open notifications",
}: NotificationBellProps) {
  const { notificationsEnabled } = useSettings();
  const hasUnread = notificationsEnabled && unreadCount > 0;
  
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{ position: "relative" }}
    >
      <Ionicons name="notifications-outline" size={sx(size)} color={color} />
      
      {hasUnread && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            backgroundColor: COLOR.red,
            borderRadius: sx(8),
            minWidth: sx(16),
            height: sx(16),
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: color,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: sx(10),
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount.toString()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
