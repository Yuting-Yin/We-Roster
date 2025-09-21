import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { hoursBetween, fmt } from "@/lib/date";
import Chip from "@/components/common/Chip";
import Avatar from "@/components/common/Avatar";
import { EventItem } from "@/types/roster";

export default function ShiftDetails({
  visible, onClose, onPressPlus, date, event,
}: {
  visible: boolean;
  onClose: () => void;
  onPressPlus: (anchor: { x: number; y: number }) => void;
  date: Date;
  event?: EventItem;
}) {
  const plusRef = React.useRef<View>(null);
  if (!visible || !event) return null;

  const duration = `${hoursBetween(event.start, event.end)} hours`;
  const measurePlus = () => {
    console.log("[ShiftDetails] + pressed"); 
    plusRef.current?.measureInWindow((px, py, w, h) => {
      console.log("[ShiftDetails] measured", px, py);
      onPressPlus({ x: px + w, y: py + h + sy(4) });
    });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable ref={plusRef} onPress={measurePlus} hitSlop={10}>
          <Ionicons name="add-outline" size={sx(24)} color={COLOR.ink} />
        </Pressable>
        <Text style={styles.title}>Shift Details</Text>
        <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close-outline" size={sx(28)} color={COLOR.ink} /></Pressable>
      </View>
      <View style={styles.divider} />

      <View style={{ flexDirection: "row", paddingHorizontal: sx(16), paddingVertical: sy(12) }}>
        <Chip icon={<Ionicons name="sunny-outline" size={sx(16)} color={COLOR.ink} />}>
          {fmt(date, { weekday: "short" })}, {fmt(date, { day: "2-digit", month: "short" })}
        </Chip>
        <View style={{ width: sx(12) }} />
        <Chip>{event.start} - {event.end}</Chip>
        <View style={{ width: sx(12) }} />
        <Chip>{duration}</Chip>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ paddingBottom: sy(24) }}>
        <View style={{ marginHorizontal: sx(16), marginTop: sy(12), marginBottom: sy(8) }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="business-outline" size={sx(20)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
            <Text style={{ color: "#000", fontSize: sx(14) }}>PMCC</Text>
          </View>
          <Text style={{ color: "#004578", fontSize: sx(12), marginLeft: sx(26), marginTop: sy(2) }}>
            305 Grattan St, Melbourne VIC 3000, Australia
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: sx(16), marginBottom: sy(6) }}>
          <Ionicons name="medkit-outline" size={sx(16)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
          <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>Anaes Coordinator</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: sx(16) }}>
          <Ionicons name="pin-outline" size={sx(20)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
          <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>Theatre 1</Text>
        </View>

        <View style={styles.sectionDivider} />

        <View style={{ marginHorizontal: sx(16), marginTop: sy(6) }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: sy(10) }}>
            <Ionicons name="people-outline" size={sx(18)} color={COLOR.ink} style={{ marginRight: sx(8) }} />
            <Text style={{ color: COLOR.ink, fontSize: sx(16), fontWeight: "600" }}>Working with</Text>
          </View>

          {["Thu Vo", "Pristine R.", "Jill C."].map((n, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: sy(10) }}>
              <Avatar initials={["TV","PR","JC"][i]} />
              <Text style={{ marginLeft: sx(10), color: COLOR.ink, fontSize: sx(14) }}>{n}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionDivider} />

        <View style={{ marginHorizontal: sx(16), marginTop: sy(6) }}>
          <Text style={{ color: COLOR.ink, fontSize: sx(16), fontWeight: "600", marginBottom: sy(8) }}>Notes</Text>
          <View style={styles.notesBox}>
            <Text style={{ color: "#8FA7BF", fontSize: sx(16) }}>Note content</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLOR.divider,
    zIndex: 30, elevation: 8,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: sx(16), paddingVertical: sy(12) },
  title: { color: "#000", fontSize: sx(16), fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider },
  sectionDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider, marginTop: sy(14), marginBottom: sy(8) },
  notesBox: { minHeight: sy(120), borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(16), padding: sx(14), justifyContent: "center" },
});
