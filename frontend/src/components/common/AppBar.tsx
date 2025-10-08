import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import NotificationBell from "@/components/common/NotificationBell";
import { useNotificationContext } from "@/contexts/NotificationContext";

type AppBarNav = NativeStackNavigationProp<RootStackParamList>;

interface AppBarProps {
  title?: string;
}

export default function AppBar({ title }: AppBarProps) {
  const navigation = useNavigation<AppBarNav>();
  const route = useRoute();
  const { unreadCount } = useNotificationContext();

  // Auto-detect title based on route if not provided
  const getTitle = () => {
    if (title) return title;
    
    const routeName = route.name;
    switch (routeName) {
      case "Dashboard":
        return "Dashboard";
      case "Roster":
        return "Roster";
      case "My Request":
        return "My Request";
      case "My Team":
        return "My Team";
      case "Settings":
        return "Settings";
      default:
        return "Roster"; // Default fallback
    }
  };

  return (
    <View style={styles.appbar}>
      <Text style={styles.title}>{getTitle()}</Text>
      <NotificationBell
        onPress={() => navigation.navigate("Notifications")}
        unreadCount={unreadCount}
        size={24}
        color="#fff"
      />
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
