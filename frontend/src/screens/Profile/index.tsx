// src/screens/Profile/index.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useApprovedLeaves } from "@/hooks/useApprovedLeaves";
import { useMyRosterData } from "@/hooks/useMyRoster";
import CollapsibleCalendar from "@/components/calendar/CollapsibleCalendar";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt } from "@/lib/date";

async function copy(text: string | undefined) {
  if (!text) return;
  try {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") Alert.alert("Copied", "Value copied to clipboard");
  } catch {}
}

const Tab = createMaterialTopTabNavigator();

export default function ProfileScreen() {
  console.log('🔍 ProfileScreen - Component loaded');
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: false,
        tabBarIndicatorStyle: { backgroundColor: COLOR.brand, height: sy(3), borderRadius: sy(2) },
        tabBarActiveTintColor: COLOR.brand,
        tabBarInactiveTintColor: COLOR.label,
        tabBarLabelStyle: { fontSize: sx(12), fontWeight: "600", textTransform: "none" },
        tabBarStyle: {
          backgroundColor: COLOR.bg, height: sy(48),
          borderBottomColor: COLOR.divider, borderBottomWidth: StyleSheet.hairlineWidth,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
        },
      }}
    >
      <Tab.Screen name="About" component={AboutTab} />
      <Tab.Screen name="Schedule" component={ScheduleTab} />
    </Tab.Navigator>
  );
}

function AboutTab() {
  console.log('🔍 AboutTab - Component loaded');
  
  // Connected to backend - using real user data from database
  const {
    displayName,
    initials,
    email,
    designation,
    accreditation,
    phone,
    ical,
    loading,
    error,
    refresh,
  } = useCurrentUser({ mock: false });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLOR.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        {/* 头像 + 名字 */}
        {loading ? (
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <View style={[styles.avatar, { backgroundColor: COLOR.skeleton }]} />
            <View style={styles.skelName} />
            <View style={styles.skelTitle} />
          </View>
        ) : (
          <>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "??"}</Text>
            </View>
            <Text style={styles.name}>{displayName || "—"}</Text>
            {!!designation && <Text style={styles.title}>{designation}</Text>}
          </>
        )}

        {/* 错误提示 */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText} numberOfLines={2}>
              {error}
            </Text>
            <Pressable onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <Item
          icon="call-outline"
          label="Phone Number"
          value={loading ? "" : phone || "—"}
          onCopy={() => copy(phone)}
          disabled={!phone}
        />
        <Divider />
        <Item
          icon="mail-outline"
          label="Email Address"
          value={loading ? "" : email || "—"}
          onCopy={() => copy(email)}
          disabled={!email}
        />
        <Divider />
        <Item
          icon="person-outline"
          label="Designation"
          value={loading ? "" : designation || "—"}
          onCopy={() => copy(designation)}
          disabled={!designation}
        />
        <Divider />
        <Item
          icon="ribbon-outline"
          label="Accreditation"
          value={loading ? "" : accreditation || "—"}
          onCopy={() => copy(accreditation)}
          disabled={!accreditation}
        />
        <Divider />
        <Item
          icon="calendar-outline"
          label="iCalendar Feed"
          value={loading ? "" : ical || "—"}
          subtitle="Sync this calendar with your personal calendar"
          onCopy={() => copy(ical)}
          disabled={!ical}
        />
      </View>
    </ScrollView>
  );
}

function ScheduleTab() {
  console.log('🔍 ScheduleTab - Component loaded');
  
  const [date, setDate] = useState(new Date());
  const { leaveMap, loading: leavesLoading, error: leavesError } = useApprovedLeaves();
  const { shiftMap, loading, error } = useMyRosterData(date);

  // Debug logging for Profile Schedule
  console.log('🔍 Profile Schedule - leaveMap:', leaveMap);
  console.log('🔍 Profile Schedule - date:', date.toDateString());
  console.log('🔍 Profile Schedule - leavesLoading:', leavesLoading);
  console.log('🔍 Profile Schedule - leavesError:', leavesError);

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <CollapsibleCalendar
        value={date}
        onChange={setDate}
        shiftMap={shiftMap}
        leaveMap={leaveMap}
        title={fmt(date, { day: "2-digit", month: "long", year: "numeric" })}
        leftAction={{ icon: "chevron-back", onPress: () => {
          const prevMonth = new Date(date);
          prevMonth.setMonth(date.getMonth() - 1);
          setDate(prevMonth);
        }}}
        rightAction={{ icon: "chevron-forward", onPress: () => {
          const nextMonth = new Date(date);
          nextMonth.setMonth(date.getMonth() + 1);
          setDate(nextMonth);
        }}}
      />
      
      {error && (
        <View style={{ padding: 16, backgroundColor: '#ffebee', margin: 16, borderRadius: 8 }}>
          <Text style={{ color: '#c62828', textAlign: 'center' }}>
            Error loading schedule: {error}
          </Text>
        </View>
      )}
    </View>
  );
}

function Item({
  icon,
  label,
  value,
  subtitle,
  onCopy,
  disabled,
}: {
  icon: any;
  label: string;
  value: string;
  subtitle?: string;
  onCopy?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ paddingVertical: 14, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={18} color={COLOR.brand} />
        <Text style={{ marginLeft: 8, color: COLOR.text, fontWeight: "600" }}>{label}</Text>
      </View>
      {!!subtitle && <Text style={{ marginLeft: 26, color: COLOR.label, fontSize: 12 }}>{subtitle}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 26 }}>
        {value ? (
          <Text style={{ color: COLOR.ink }}>{value}</Text>
        ) : (
          <View style={{ height: 12, width: 120, backgroundColor: COLOR.skeleton, borderRadius: 6 }} />
        )}
        <Pressable onPress={onCopy} disabled={disabled} hitSlop={8} accessibilityRole="button">
          <Ionicons name="copy-outline" size={18} color={disabled ? COLOR.divider : COLOR.label} />
        </Pressable>
      </View>
    </View>
  );
}

const Divider = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider }} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOR.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: COLOR.bg, fontWeight: "700" },
  name: { alignSelf: "center", fontSize: 18, fontWeight: "700", color: COLOR.text },
  title: { alignSelf: "center", color: COLOR.label, marginBottom: 8 },

  // 骨架
  skelName: {
    height: 16,
    width: 120,
    backgroundColor: COLOR.skeleton,
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 8,
  },
  skelTitle: {
    height: 12,
    width: 80,
    backgroundColor: COLOR.skeleton,
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 6,
  },

  // 错误提示
  errorBanner: {
    backgroundColor: COLOR.warnBg,
    borderColor: COLOR.warn,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: { color: COLOR.warn, fontSize: 12, marginRight: 12, flex: 1 },
  retryBtn: { backgroundColor: COLOR.warn, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  retryText: { color: COLOR.bg, fontSize: 12 },
});
