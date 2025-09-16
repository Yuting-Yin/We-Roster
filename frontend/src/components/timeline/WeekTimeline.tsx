import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { fmt } from "@/lib/date";
import { EventItem } from "@/types/roster";

type Slot = { start: string; end: string };
const AM: Slot = { start: "08:00", end: "13:00" };
const PM: Slot = { start: "13:00", end: "18:00" };

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const overlap = (aS: string, aE: string, bS: string, bE: string) =>
  toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);

const dayAt = (d0: Date, i: number) => { const d = new Date(d0); d.setDate(d0.getDate() + i); return d; };

// 宽松读取 fakeData 字段（有则用，没有走默认）
function extractInfo(ev?: EventItem) {
  const e: any = ev ?? {};
  const site = e.site ?? e.hospital ?? e.facility ?? e.campus ?? e.location ?? (ev ? "PMCC" : "Unallocated");
  const role = e.role ?? e.position ?? e.job ?? (ev ? "Anaes Coordinator" : "—");
  // coworkers: 既兼容数字也兼容数组
  const coworkersCount =
    typeof e.coworkers === "number" ? e.coworkers :
    Array.isArray(e.coworkers) ? e.coworkers.length :
    typeof e.workingWith === "number" ? e.workingWith :
    Array.isArray(e.workingWith) ? e.workingWith.length :
    e.coworkersCount ?? (ev ? 3 : undefined);

  return { site, role, coworkersCount };
}

export default function WeekTimeline({
  weekStart,
  getEventsFor,
  onOpenDetails,
  onOpenRequest,
}: {
  weekStart: Date;
  getEventsFor: (day: Date) => EventItem[];
  onOpenDetails: (ev: EventItem) => void;
  onOpenRequest: (day: Date, slot: Slot) => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: sy(16) }}
      showsVerticalScrollIndicator={false}
    >
      {Array.from({ length: 7 }).map((_, i) => {
        const day = dayAt(weekStart, i);
        const events = getEventsFor(day);
        const pick = (slot: Slot) => events.find(ev => overlap(ev.start, ev.end, slot.start, slot.end));

        return (
          <View key={i} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>
              {fmt(day, { weekday: "short" })} {fmt(day, { day: "2-digit", month: "short" })}
            </Text>

            {[AM, PM].map((slot, idx) => {
              const ev = pick(slot);
              const has = !!ev;
              const { site, role, coworkersCount } = extractInfo(ev || undefined);

              return (
                <Pressable
                  key={idx}
                  onPress={() => (has ? onOpenDetails(ev!) : onOpenRequest(day, slot))}
                  style={[styles.row, has ? styles.rowOn : styles.rowOff]}
                >
                  {/* 左侧 AM/PM 徽标 */}
                  <View style={styles.badge}>
                    <Ionicons
                      name={idx === 0 ? "sunny-outline" : "moon-outline"}
                      size={sx(16)} color={COLOR.ink}
                    />
                    <Text style={styles.badgeTxt}>{idx === 0 ? "AM" : "PM"}</Text>
                  </View>

                  {/* 中部信息 */}
                  <View style={{ flex: 1 }}>
                    {/* 时间（有排班用真实 start/end，未排班用 AM/PM 预设） */}
                    <View style={styles.line}>
                      <Ionicons name="time-outline" size={sx(14)} color={COLOR.ink} style={styles.ic} />
                      <Text style={styles.mainText}>
                        {has ? `${ev!.start} - ${ev!.end}` : `${slot.start} - ${slot.end}`}
                      </Text>
                    </View>
                    {/* 地点 */}
                    <View style={styles.line}>
                      <Ionicons name="business-outline" size={sx(14)} color={COLOR.ink} style={styles.ic} />
                      <Text style={styles.subText}>{site}</Text>
                    </View>
                    {/* 岗位 */}
                    <View style={styles.line}>
                      <Ionicons name="medkit-outline" size={sx(14)} color={COLOR.ink} style={styles.ic} />
                      <Text style={styles.subText}>{role}</Text>
                    </View>
                    {/* 同事 */}
                    <View style={styles.line}>
                      <Ionicons name="people-outline" size={sx(14)} color={COLOR.ink} style={styles.ic} />
                      <Text style={styles.subText}>
                        {has && typeof coworkersCount === "number" ? `Working with ${coworkersCount} others` : " "}
                      </Text>
                    </View>

                    {/* AM/PM 之间的分隔线（模仿 hifi） */}
                    {idx === 0 && <View style={styles.sep} />}
                  </View>

                  {/* 右侧动作 */}
                  <Ionicons
                    name={has ? "arrow-forward-circle" : "add-circle"}
                    size={sx(24)}
                    color={COLOR.brand}
                  />
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dayBlock: { paddingHorizontal: sx(16), paddingTop: sy(10) },
  dayTitle: { color: COLOR.ink, fontSize: sx(12), fontWeight: "700", marginBottom: sy(8) },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: sx(12),
    borderRadius: sx(12),
    borderWidth: 1,
    marginBottom: sy(10),
  },
  rowOn: { backgroundColor: "#F6FAFF", borderColor: "#DCE9F9" },
  rowOff: { backgroundColor: "#F8FBFF", borderColor: "#E6EEF8" },

  badge: {
    width: sx(44),
    height: sy(52),
    borderRadius: sx(10),
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(10),
  },
  badgeTxt: { color: COLOR.ink, fontSize: sx(12), fontWeight: "700", marginTop: sy(2) },

  line: { flexDirection: "row", alignItems: "center", marginTop: sy(2) },
  ic: { marginRight: sx(6) },
  mainText: { color: COLOR.ink, fontSize: sx(14), fontWeight: "700" },
  subText: { color: COLOR.ink, fontSize: sx(12) },

  sep: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider, marginTop: sy(8) },
});
