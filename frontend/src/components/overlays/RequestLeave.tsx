import React from "react";
import { View, ScrollView, Text, TextInput, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt } from "@/lib/date";
import Chip from "@/components/common/Chip";

export default function RequestLeave({
  visible, onCancel, onSubmitted, date, slot,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: () => void;
  date: Date;
  slot?: { start: string; end: string };
}) {
  const [leaveType] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  if (!visible) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 45 }]} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel}><Text style={styles.hLeft}>Cancel</Text></Pressable>
          <Text style={styles.hTitle}>LEAVE REQUEST</Text>
          <Pressable onPress={onSubmitted}><Text style={styles.hRight}>Submit</Text></Pressable>
        </View>
        <View style={styles.divider} />

        <ScrollView style={{ maxHeight: sy(420) }} contentContainerStyle={{ paddingBottom: sy(18) }}>
          {/* Leave Type */}
          <View style={{ marginHorizontal: sx(16), marginTop: sy(12) }}>
            <View style={[styles.roundInput]}>
              <Text style={{ color: "#8FA7BF", fontSize: sx(16) }}>{leaveType ?? "Leave Type"}</Text>
              <Ionicons name="chevron-down" size={sx(18)} color={COLOR.ink} style={{ position: "absolute", right: sx(12), top: sy(12) }} />
            </View>
          </View>

          {/* All Day toggle */}
          <View style={styles.toggleRow}>
            <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>All Date</Text>
            <Pressable
              onPress={() => setAllDay(!allDay)}
              style={{ width: sx(44), height: sy(26), borderRadius: sy(13), backgroundColor: allDay ? COLOR.brand : "#E4EAF1", justifyContent: "center", paddingHorizontal: sx(4) }}
            >
              <View style={{ width: sy(18), height: sy(18), borderRadius: sy(9), backgroundColor: "#fff", transform: [{ translateX: allDay ? sx(18) : 0 }] }} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Start & End */}
          <Row label="Start" right={<View style={{ flexDirection: "row" }}>
            <Chip>{fmt(date, { day: "2-digit", month: "long", year: "numeric" })}</Chip>
            {!allDay && (<><View style={{ width: sx(8) }} /><Chip>{slot?.start ?? "08:00"}</Chip></>)}
          </View>} />
          <Row label="End" right={<View style={{ flexDirection: "row" }}>
            <Chip>{fmt(date, { day: "2-digit", month: "long", year: "numeric" })}</Chip>
            {!allDay && (<><View style={{ width: sx(8) }} /><Chip>{slot?.end ?? "13:00"}</Chip></>)}
          </View>} />

          {/* Reason */}
          <View style={{ marginHorizontal: sx(16), marginTop: sy(14) }}>
            <View style={styles.noteBox}>
              <TextInput placeholder="Reason" placeholderTextColor="#8FA7BF" value={reason} onChangeText={setReason} multiline style={{ color: COLOR.ink, fontSize: sx(16), minHeight: sy(120) }} />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { fontWeight: "700" }]}>{label}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff",
    borderTopLeftRadius: sx(12), borderTopRightRadius: sx(12),
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLOR.divider,
    paddingBottom: sy(8), zIndex: 52, elevation: 16,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: sx(16), paddingVertical: sy(12) },
  hLeft: { color: COLOR.ink, fontSize: sx(16) },
  hTitle: { color: "#000", fontSize: sx(16), fontWeight: "600" },
  hRight: { color: COLOR.brand, fontSize: sx(16), fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider },
  roundInput: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(22), paddingVertical: sy(10), paddingHorizontal: sx(14) },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: sx(16), marginTop: sy(14) },
  row: { paddingHorizontal: sx(16), paddingVertical: sy(12), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: COLOR.ink, fontSize: sx(16) },
  noteBox: { borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(16), paddingHorizontal: sx(12), paddingVertical: sy(8) },
});
