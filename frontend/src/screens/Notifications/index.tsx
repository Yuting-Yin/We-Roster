// src/screens/Notifications/index.tsx
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationContext } from "@/contexts/NotificationContext";
import type { Notification, NotificationFilter } from "@/types/notification";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type NotificationNav = NativeStackNavigationProp<RootStackParamList, "Notifications">;

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const NotificationItem = React.memo(({ notification, onPress }: NotificationItemProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }) + " - " + date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Event":
        return COLOR.brand;
      case "Leave":
        return COLOR.success;
      case "Swap":
        return COLOR.warn;
      default:
        return COLOR.label;
    }
  };

  return (
    <Pressable
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: COLOR.brand }]}>
          <Text style={styles.avatarText}>
            {notification.initials || "??"}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.messageText} numberOfLines={3}>
          {notification.message}
        </Text>
        
        <View style={styles.bottomRow}>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(notification.type) + "20" }]}>
            <Text style={[styles.typeText, { color: getTypeColor(notification.type) }]}>
              {notification.type}
            </Text>
          </View>
          
          <Text style={styles.timestampText}>
            {formatTimestamp(notification.timestamp)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationNav>();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    notifications,
    loading,
    error,
    filter,
    unreadCount,
    markAsRead,
    markAllAsRead,
    changeFilter,
    refresh,
  } = useNotifications({ autoRefresh: false });

  const { refreshUnreadCount, markAsRead: contextMarkAsRead, markAllAsRead: contextMarkAllAsRead } = useNotificationContext();

  // Refresh unread count when screen comes into focus (user navigates back to this screen)
  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      // Use both the local hook and context to keep everything in sync
      await Promise.all([
        markAsRead(notification.id),
        contextMarkAsRead(notification.id)
      ]);
    }
    // TODO: Navigate to specific notification details or related screen
  }, [markAsRead, contextMarkAsRead]);

  const handleFilterChange = useCallback((newFilter: NotificationFilter) => {
    changeFilter(newFilter);
  }, [changeFilter]);

  const handleMarkAllAsRead = useCallback(async () => {
    // Use both the local hook and context to keep everything in sync
    await Promise.all([
      markAllAsRead(),
      contextMarkAllAsRead()
    ]);
  }, [markAllAsRead, contextMarkAllAsRead]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refresh(),
      refreshUnreadCount()
    ]);
    setRefreshing(false);
  }, [refresh, refreshUnreadCount]);

  const renderNotificationItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
    />
  ), [handleNotificationPress]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={sx(24)} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notification - My Team</Text>
        <View style={styles.headerRight}>
          <Ionicons name="code-outline" size={sx(20)} color="#fff" />
        </View>
      </View>
      
      <View style={styles.subHeader}>
        <View style={styles.filterContainer}>
          <Pressable
            style={[styles.filterButton, filter === "Direct" && styles.activeFilter]}
            onPress={() => handleFilterChange("Direct")}
          >
            <Text style={[styles.filterText, filter === "Direct" && styles.activeFilterText]}>
              Direct
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.filterButton, filter === "Overall" && styles.activeFilter]}
            onPress={() => handleFilterChange("Overall")}
          >
            <Text style={[styles.filterText, filter === "Overall" && styles.activeFilterText]}>
              Overall
            </Text>
          </Pressable>
        </View>
        
        <Pressable
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllText}>Mark All As Read</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={sx(64)} color={COLOR.label} />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={sx(64)} color={COLOR.red} />
      <Text style={styles.errorTitle}>Failed to load notifications</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <Pressable style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.brand} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {error && notifications.length === 0 ? (
        renderError()
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLOR.brand]}
              tintColor={COLOR.brand}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  
  // Header styles
  header: {
    backgroundColor: COLOR.brand,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(18),
    paddingVertical: sy(12),
  },
  backButton: {
    padding: sx(4),
  },
  headerTitle: {
    color: "#fff",
    fontSize: sx(20),
    flex: 1,
    textAlign: "center",
    marginHorizontal: sx(16),
  },
  headerRight: {
    width: sx(32),
    alignItems: "center",
  },
  
  // Sub header styles
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(18),
    backgroundColor: "#fff",
    paddingVertical: sy(12),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.divider,
  },
  filterContainer: {
    flexDirection: "row",
    gap: sx(24),
  },
  filterButton: {
    paddingVertical: sy(4),
  },
  activeFilter: {
    borderBottomWidth: 2,
    borderBottomColor: COLOR.brand,
  },
  filterText: {
    fontSize: sx(14),
    color: COLOR.label,
    fontWeight: "500",
  },
  activeFilterText: {
    color: COLOR.brand,
  },
  markAllButton: {
    paddingVertical: sy(4),
  },
  markAllText: {
    fontSize: sx(12),
    color: COLOR.brand,
    fontWeight: "500",
  },
  
  // List styles
  listContainer: {
    flexGrow: 1,
  },
  
  // Notification item styles
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: sx(18),
    paddingVertical: sy(16),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    backgroundColor: "#fff",
  },
  unreadNotification: {
    backgroundColor: COLOR.subtleBlue,
  },
  avatarContainer: {
    marginRight: sx(12),
  },
  avatar: {
    width: sx(40),
    height: sx(40),
    borderRadius: sx(20),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: sx(14),
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: sx(14),
    color: COLOR.text,
    lineHeight: sx(20),
    marginBottom: sy(8),
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeTag: {
    paddingHorizontal: sx(8),
    paddingVertical: sy(2),
    borderRadius: sx(12),
  },
  typeText: {
    fontSize: sx(12),
    fontWeight: "500",
  },
  timestampText: {
    fontSize: sx(12),
    color: COLOR.label,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: sy(16),
  },
  loadingText: {
    fontSize: sx(16),
    color: COLOR.label,
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sx(32),
    gap: sy(16),
  },
  emptyTitle: {
    fontSize: sx(18),
    fontWeight: "600",
    color: COLOR.text,
  },
  emptySubtitle: {
    fontSize: sx(14),
    color: COLOR.label,
    textAlign: "center",
    lineHeight: sx(20),
  },
  
  // Error state styles
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sx(32),
    gap: sy(16),
  },
  errorTitle: {
    fontSize: sx(18),
    fontWeight: "600",
    color: COLOR.red,
  },
  errorSubtitle: {
    fontSize: sx(14),
    color: COLOR.label,
    textAlign: "center",
    lineHeight: sx(20),
  },
  retryButton: {
    backgroundColor: COLOR.brand,
    paddingHorizontal: sx(24),
    paddingVertical: sy(12),
    borderRadius: sx(8),
    marginTop: sy(8),
  },
  retryText: {
    color: "#fff",
    fontSize: sx(14),
    fontWeight: "600",
  },
});
