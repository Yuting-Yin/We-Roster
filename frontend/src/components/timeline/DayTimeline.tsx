// day view for My roster page

import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventItem } from "@/types/roster";
import { sx, sy, W } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";

const HOUR_START = 8, HOUR_END = 21, HOUR_HEIGHT = sy(72), TIME_GUTTER = sx(52);
const toMinutes = (t: string) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const yFromTime = (t: string) => ((toMinutes(t)-HOUR_START*60)/60)*HOUR_HEIGHT;
const hFromRange = (s: string, e: string) => ((toMinutes(e)-toMinutes(s))/60)*HOUR_HEIGHT;

export default function DayTimeline({
  events,
  onOpenDetails,
  onOpenRequest,
}: {
  events: EventItem[];
  onOpenDetails: (ev: EventItem) => void;
  onOpenRequest: (ev: EventItem) => void;
}) {
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: sy(80) }}>
      <View style={[styles.wrap, { height: totalHeight }]}>
        {Array.from({ length: HOUR_END - HOUR_START + 1 }).map((_, i) => {
          const hour = HOUR_START + i, top = i * HOUR_HEIGHT, label = `${String(hour).padStart(2,"0")}:00`;
          return (
            <View key={hour} style={[styles.hourRow, { top }]}>
              <Text style={styles.hourText}>{label}</Text>
              <View style={styles.hourLine} />
            </View>
          );
        })}

        {events.map((ev) => {
          const top = yFromTime(ev.start), height = hFromRange(ev.start, ev.end);
          return (
            <View
              key={ev.id}
              style={[
                styles.card,
                {
                  top,
                  left: TIME_GUTTER + sx(8),
                  height,
                  width: W - TIME_GUTTER - sx(16),
                  borderTopColor: ev.color ?? COLOR.brand,
                },
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={styles.infoColumn}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={sx(14)} color={COLOR.ink} style={styles.infoIcon} />
                    <Text style={styles.timeText}>{`${ev.start} - ${ev.end}`}</Text>
                  </View>
                  {ev.location ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="pin-outline" size={sx(14)} color={COLOR.ink} style={styles.infoIcon} />
                      <Text style={styles.meta}>{ev.location}</Text>
                    </View>
                  ) : null}
                  {ev.role ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="briefcase-outline" size={sx(14)} color={COLOR.ink} style={styles.infoIcon} />
                      <Text style={styles.meta}>{ev.role}</Text>
                    </View>
                  ) : null}
                  {ev.teammates ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={sx(14)} color={COLOR.ink} style={styles.infoIcon} />
                      <Text style={styles.meta}>{ev.teammates}</Text>
                    </View>
                  ) : null}
                </View>

                {ev.action === "arrow" ? (
                  <Pressable onPress={() => onOpenDetails(ev)} hitSlop={10}>
                    <Ionicons name="arrow-forward-circle" size={sx(36)} color={COLOR.brand} />
                  </Pressable>
                ) : (
                  <Pressable onPress={() => onOpenRequest(ev)} hitSlop={10}>
                    <Ionicons name="add-circle" size={sx(36)} color={COLOR.brand} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", backgroundColor: "#fff", marginTop: sx(32) },
  hourRow: { position: "absolute", left: 0, right: 0, height: 1 },
  hourText: { position: "absolute", left: sx(8), top: -sy(8), width: sx(44), color: COLOR.label, fontSize: sx(10) },
  hourLine: { position: "absolute", left: sx(52), right: 0, top: 0, height: 1, backgroundColor: COLOR.line },
  card: {
    position: "absolute", backgroundColor: `${COLOR.card}80`,
    borderTopWidth: sx(3), borderRadius: sx(8), padding: sx(12),
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoColumn: { flex: 1, paddingRight: sx(8), gap: sy(4) },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: sx(6) },
  timeText: { color: COLOR.ink, fontSize: sx(12), fontWeight: "700" },
  meta: { color: COLOR.ink, fontSize: sx(12) },
});
