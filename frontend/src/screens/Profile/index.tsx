// src/screens/Profile/index.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { COLOR } from "@/theme/colors";

async function copy(text: string | undefined) {
  if (!text) return;
  try {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") Alert.alert("Copied", "Value copied to clipboard");
  } catch {}
}

export default function ProfileScreen() {
  // 如需连后端，把 mock: true 去掉即可；或用 .env 开关 EXPO_PUBLIC_MOCK_DASHBOARD=1
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
  } = useCurrentUser({ mock: true });

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
