// src/screens/Roster/OpenShifts.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt } from "@/lib/date";

import OpenShiftsFilter, { FilterValue, Session } from "@/components/overlays/OpenShiftsFilter";
import OpenShiftDetails, { OpenShiftDetail, Coworker } from "@/components/overlays/OpenShiftDetails";
import SuccessToast from "@/components/overlays/SuccessToast";

/* ================= Helpers ================= */
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeekMon = (d: Date) => {
  const r = new Date(d);
  const day = r.getDay(); // 0..6 (Sun..Sat)
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
};
const addMonths = (d: Date, n: number) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  r.setHours(0, 0, 0, 0);
  return startOfWeekMon(r);
};
const weekLabel = (ws: Date) => {
  const we = addDays(ws, 6);
  const left = fmt(ws, { day: "2-digit", month: "short" });
  const right = fmt(we, { day: "2-digit", month: "short", year: "numeric" });
  return `${left} - ${right}`;
};

/* ================= Types & Mock ================= */
type Item = {
  id: string;
  date: string;          // YYYY-MM-DD
  session: Session;      // "AM" | "PM" | "AH" | "ON_CALL"
  start: string;         // "08:00"
  end: string;           // "13:00"
  location: string;      // e.g. "PMCC"
  designation: string;   // e.g. "Anaes Coordinator"
};

const MOCK: Item[] = [
  { id: "1", date: "2025-09-16", session: "AM", start: "08:00", end: "13:00", location: "PMCC", designation: "Anaes Coordinator" },
  { id: "2", date: "2025-09-18", session: "PM", start: "13:00", end: "18:00", location: "PMCC", designation: "Anaes Coordinator" },
  { id: "3", date: "2025-09-19", session: "AM", start: "08:00", end: "13:00", location: "PMCC", designation: "Anaes Coordinator" },
  { id: "4", date: "2025-09-19", session: "PM", start: "13:00", end: "18:00", location: "PMCC", designation: "Anaes Coordinator" },
  { id: "5", date: "2025-10-14", session: "AM", start: "08:00", end: "13:00", location: "PMCC", designation: "Anaes Coordinator" },
  { id: "6", date: "2025-10-14", session: "PM", start: "13:00", end: "18:00", location: "PMCC", designation: "Anaes Coordinator" },
];

/* ================= Component ================= */
export default function OpenShifts() {
  /* ---- Week navigation ---- */
  const today = new Date();
  const currentWeek = startOfWeekMon(today);
  const [weekStart, setWeekStart] = useState<Date>(currentWeek);
  const maxWeekStart = addMonths(currentWeek, 2);

  const canGoPrev = weekStart.getTime() > currentWeek.getTime();
  const canGoNext = weekStart.getTime() < maxWeekStart.getTime();

  /* ---- Filter overlay ---- */
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<FilterValue>({
    preset: "Preset",
    sessions: [],
    locations: [],
    designations: [],
  });

  /* ---- Detail overlay & toast ---- */
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailShift, setDetailShift] = useState<OpenShiftDetail | undefined>(undefined);

  const [toast, setToast] = useState(false);
  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 1800); };

  const coworkers: Coworker[] = [
    { id: "u_tv", name: "Thu Vo", initials: "TV" },
    { id: "u_pr", name: "Pristine R.", initials: "PR" },
    { id: "u_jc", name: "Jill C.", initials: "JC" },
  ];

  /* ---- Data: by week + filter ---- */
  const filtered = useMemo(() => {
    const ws = weekStart;
    const we = addDays(ws, 6);
    let arr = MOCK.filter(i => {
      const d = new Date(i.date);
      return d >= ws && d <= we;
    });

    if (filter.sessions.length) arr = arr.filter(i => filter.sessions.includes(i.session));
    if (filter.locations.length) arr = arr.filter(i => filter.locations.includes(i.location));
    if (filter.designations.length) arr = arr.filter(i => filter.designations.includes(i.designation));

    arr.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    return arr;
  }, [weekStart, filter]);

  /* ---- Group by day ---- */
  const sections = useMemo(() => {
    const m = new Map<string, Item[]>();
    filtered.forEach(it => {
      if (!m.has(it.date)) m.set(it.date, []);
      m.get(it.date)!.push(it);
    });
    const ordered = [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
    return ordered.map(([date, items]) => ({ date, items }));
  }, [filtered]);

  /* ---- Day collapse ---- */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleDay = (k: string) => setCollapsed(s => ({ ...s, [k]: !s[k] }));

  /* ---- Card action: open details ---- */
  const openDetailsFor = (it: Item) => {
    const detail: OpenShiftDetail = {
      id: it.id,
      date: it.date,
      start: it.start,
      end: it.end,
      session: it.session,
      location: it.location,
      address: "305 Grattan St, Melbourne VIC 3000, Australia",
      designation: it.designation,
      theatre: "Theatre 1",
      pay: 500,
    };
    setDetailShift(detail);
    setDetailVisible(true);
  };

  /* ---- Toolbar ---- */
  const Toolbar = () => (
    <View style={styles.toolbar}>
      {/* Filter */}
      <Pressable style={styles.iconBtn} onPress={() => setFilterVisible(true)} android_ripple={{ color: "#eaeaea" }}>
        <Ionicons name="options-outline" size={sx(18)} color={COLOR.ink} />
      </Pressable>

      {/* Week range with arrows */}
      <View style={styles.center}>
        <Pressable
          style={[styles.arrowBtn, !canGoPrev && styles.disabled]}
          disabled={!canGoPrev}
          onPress={() => setWeekStart(addDays(weekStart, -7))}
          android_ripple={{ color: "#eaeaea" }}
        >
          <Ionicons name="chevron-back" size={sx(18)} color={COLOR.ink} />
        </Pressable>

        <Text style={styles.weekText}>{weekLabel(weekStart)}</Text>

        <Pressable
          style={[styles.arrowBtn, !canGoNext && styles.disabled]}
          disabled={!canGoNext}
          onPress={() => setWeekStart(addDays(weekStart, +7))}
          android_ripple={{ color: "#eaeaea" }}
        >
          <Ionicons name="chevron-forward" size={sx(18)} color={COLOR.ink} />
        </Pressable>
      </View>

      {/* Refresh */}
      <Pressable style={styles.iconBtn} onPress={() => { /* TODO: 拉取最新 open shifts */ }} android_ripple={{ color: "#eaeaea" }}>
        <Ionicons name="refresh" size={sx(18)} color={COLOR.ink} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Toolbar />

      <FlatList
        data={sections}
        keyExtractor={(s) => s.date}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const d = new Date(item.date);
          const dayName = fmt(d, { weekday: "short" }).toUpperCase(); // "MON"
          const dayStr = `${fmt(d, { day: "2-digit" })} ${fmt(d, { month: "long" }).slice(0, 3).toUpperCase()}`;
          const k = item.date;
          const isCol = !!collapsed[k];

          return (
            <View style={styles.dayBlock}>
              {/* Day header */}
              <Pressable style={styles.dayHeader} onPress={() => toggleDay(k)} android_ripple={{ color: "#eaeaea" }}>
                <Ionicons name={isCol ? "chevron-forward" : "chevron-down"} size={sx(16)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
                <Text style={styles.dayName}>{dayName}, {dayStr}</Text>
              </Pressable>

              {/* Cards */}
              {!isCol && item.items.map(it => (
                <View key={it.id} style={styles.card}>
                  {/* Session badge (left) */}
                  <View style={styles.sessionCol}>
                    <View style={[styles.sessionBadge]}>
                      <Ionicons
                        name={it.session === "AM" ? "sunny-outline" : it.session === "PM" ? "moon-outline" : "time-outline"}
                        size={sx(14)}
                        color={COLOR.brand}
                        style={{ marginBottom: sy(2) }}
                      />
                      <Text style={styles.sessionText}>{it.session === "ON_CALL" ? "On\nCall" : it.session}</Text>
                    </View>
                  </View>

                  {/* Main info */}
                  <View style={styles.mainCol}>
                    <View style={styles.row}><Text style={styles.time}>{it.start} - {it.end}</Text></View>
                    <View style={styles.row}>
                      <Ionicons name="business-outline" size={sx(14)} color={COLOR.label} />
                      <Text style={styles.meta}>{it.location}</Text>
                    </View>
                    <View style={styles.row}>
                      <Ionicons name="person-outline" size={sx(14)} color={COLOR.label} />
                      <Text style={styles.meta}>{it.designation}</Text>
                    </View>
                  </View>

                  {/* Action */}
                  <View style={styles.actionCol}>
                    <Pressable
                      style={styles.roundBtn}
                      onPress={() => openDetailsFor(it)}
                      android_ripple={{ color: "#e6f0fb", borderless: true }}
                    >
                      <Ionicons name="arrow-forward" size={sx(18)} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: sx(16), alignItems: "center" }}>
            <Text style={{ color: COLOR.label }}>No open shifts in this week.</Text>
          </View>
        }
      />

      {/* Filter Overlay */}
      <OpenShiftsFilter
        visible={filterVisible}
        value={filter}
        onChange={setFilter}
        onApply={() => setFilterVisible(false)}
        onClear={() => setFilter({ preset: "Preset", sessions: [], locations: [], designations: [] })}
        onClose={() => setFilterVisible(false)}
      />

      {/* Details Overlay */}
      <OpenShiftDetails
        visible={detailVisible}
        shift={detailShift}
        coworkers={coworkers}
        onClose={() => setDetailVisible(false)}
        onApply={() => {
          // TODO: 调接口提交申请
          setDetailVisible(false);
          showToast();
        }}
      />

      {/* Toast */}
      <SuccessToast visible={toast} text="Successfully submitted" />
    </View>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // toolbar
  toolbar: {
    height: sy(48),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(10),
  },
  iconBtn: { width: sx(36), height: sy(36), borderRadius: sx(8), alignItems: "center", justifyContent: "center" },
  center: { flexDirection: "row", alignItems: "center", gap: sx(8) },
  weekText: { color: COLOR.ink, fontWeight: "600" },
  arrowBtn: { width: sx(32), height: sy(32), alignItems: "center", justifyContent: "center", borderRadius: sx(6) },
  disabled: { opacity: 0.35 },

  // list group
  list: { padding: sx(12) },
  dayBlock: { marginBottom: sy(12) },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: sy(6),
    paddingHorizontal: sx(6),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  dayName: { color: COLOR.ink, fontWeight: "600" },

  // card
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLOR.divider,
    borderRadius: sx(12),
    padding: sx(12),
    marginTop: sy(10),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sessionCol: { width: sx(52), marginRight: sx(10) },
  sessionBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: sx(52),
    height: sy(52),
    borderRadius: sx(12),
    backgroundColor: (COLOR.brand ?? "#0078D4") + "15",
    borderWidth: 1,
    borderColor: (COLOR.brand ?? "#0078D4") + "55",
  },
  sessionText: { color: COLOR.brand, fontWeight: "700", fontSize: sx(11), textAlign: "center", lineHeight: sy(14) },

  mainCol: { flex: 1, gap: sy(6) },
  row: { flexDirection: "row", alignItems: "center", gap: sx(6) },
  time: { color: COLOR.ink, fontWeight: "700" },
  meta: { color: COLOR.ink },

  actionCol: { justifyContent: "center" },
  roundBtn: {
    width: sx(40),
    height: sy(40),
    borderRadius: sx(20),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
});
