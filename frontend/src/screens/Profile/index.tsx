import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type User = {
  initials: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  accreditation?: string;
  ical?: string;
};

const currentUser: User = {
  initials: "AT",
  name: "Amy T.",
  title: "Trainee",
  phone: "(+61) 123-456-789",
  email: "thuvo@austinana.au",
  accreditation: "Accreditation",
  ical: "URL link",
};

export default function ProfileScreen({ navigation }: any) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      {/* 顶部蓝条可由全局 AppBar 控制；这里仅示意 */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{currentUser.initials}</Text>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.title}>{currentUser.title}</Text>

        <Item icon="call-outline" label="Phone Number" value={currentUser.phone} />
        <Divider />
        <Item icon="mail-outline" label="Email Address" value={currentUser.email} />
        <Divider />
        <Item icon="heart-outline" label="Preference" value="Preferences" />
        <Divider />
        <Item icon="ribbon-outline" label="Accreditation" value={currentUser.accreditation || ""} />
        <Divider />
        <Item icon="calendar-outline" label="iCalendar Feed" value={currentUser.ical || ""} subtitle="Sync this calendar with your personal calendar" />
      </View>
    </ScrollView>
  );
}

function Item({ icon, label, value, subtitle }: { icon: any; label: string; value: string; subtitle?: string }) {
  return (
    <View style={{ paddingVertical: 14, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={18} color="#1976D2" />
        <Text style={{ marginLeft: 8, color: "#1F2937", fontWeight: "600" }}>{label}</Text>
      </View>
      {!!subtitle && <Text style={{ marginLeft: 26, color: "#6B7280", fontSize: 12 }}>{subtitle}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 26 }}>
        <Text style={{ color: "#374151" }}>{value}</Text>
        <Ionicons name="copy-outline" size={18} color="#9CA3AF" />
      </View>
    </View>
  );
}
const Divider = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB" }} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    alignSelf: "center",
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#1976D2",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  name: { alignSelf: "center", fontSize: 18, fontWeight: "700", color: "#111827" },
  title: { alignSelf: "center", color: "#6B7280", marginBottom: 8 },
  editBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 28, paddingVertical: 12,
    backgroundColor: "#1976D2",
    borderRadius: 24,
    elevation: 2,
  },
});
