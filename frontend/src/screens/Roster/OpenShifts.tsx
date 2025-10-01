// src/screens/Roster/OpenShifts.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useOpenShiftsData, useOpenShiftDetails, useOpenShiftApplication } from "@/hooks/useOpenShifts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fmt } from "@/lib/date";
import type { OpenShiftDto } from "@/api/openshift";

import OpenShiftsFilter, { FilterValue, Session } from "@/components/overlays/OpenShiftsFilter";
import OpenShiftDetails, { OpenShiftDetail, Coworker } from "@/components/overlays/OpenShiftDetails";
import SuccessToast from "@/components/overlays/SuccessToast";
import WarningToast from "@/components/overlays/WarningToast";

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

/* ================= Types ================= */
type Item = {
  id: string;
  date: string;          // YYYY-MM-DD
  session: Session;      // "AM" | "PM" | "AH" | "ON_CALL"
  start: string;         // "08:00"
  end: string;           // "13:00"
  location: string;      // e.g. "PMCC"
  designation: string;   // e.g. "Anaes Coordinator"
  payment?: string;      // e.g. "$500"
  urgent?: boolean;      // Urgent flag
  status?: string;       // AVAILABLE, READY_TO_RUN, etc.
};

/* ================= Component ================= */
export default function OpenShifts() {
  /* ---- Week navigation ---- */
  const today = new Date();
  const currentWeek = startOfWeekMon(today);
  const [weekStart, setWeekStart] = useState<Date>(currentWeek);
  const maxWeekStart = addMonths(currentWeek, 2);

  const canGoPrev = weekStart.getTime() > currentWeek.getTime();
  const canGoNext = weekStart.getTime() < maxWeekStart.getTime();
  
  /* ---- Load data from API ---- */
  const { user } = useCurrentUser();
  const { openShifts, loading, error, refresh } = useOpenShiftsData(weekStart);

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
  const [warningToast, setWarningToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Successfully submitted");
  const showToast = (msg = "Successfully submitted") => { 
    setToastMessage(msg);
    setToast(true); 
    setTimeout(() => setToast(false), 1800); 
  };
  const showWarning = (msg: string) => {
    setToastMessage(msg);
    setWarningToast(true);
    setTimeout(() => setWarningToast(false), 2500);
  };

  // Register overlays with context for auto-close functionality
  const { registerOverlay, unregisterOverlay } = useOverlayContext();
  
  React.useEffect(() => {
    registerOverlay('openshifts-filter', () => setFilterVisible(false));
    registerOverlay('openshifts-detail', () => setDetailVisible(false));
    registerOverlay('openshifts-toast', () => setToast(false));
    registerOverlay('openshifts-warning', () => setWarningToast(false));
    
    return () => {
      unregisterOverlay('openshifts-filter');
      unregisterOverlay('openshifts-detail');
      unregisterOverlay('openshifts-toast');
      unregisterOverlay('openshifts-warning');
    };
  }, [registerOverlay, unregisterOverlay]);

  // Auto-close overlays when navigating to other tabs
  useAutoCloseOverlays([
    () => setFilterVisible(false),
    () => setDetailVisible(false),
    () => setToast(false),
    () => setWarningToast(false)
  ]);

  /* ---- Convert API data to Item format and apply filters ---- */
  const filtered = useMemo(() => {
    // Convert OpenShiftDto to Item format
    const allItems: Item[] = [];
    Object.entries(openShifts).forEach(([date, shifts]) => {
      shifts.forEach(shift => {
        allItems.push({
          id: shift.id.toString(),
          date: shift.date,
          session: shift.session,
          start: shift.start,
          end: shift.end,
          location: shift.locationName || "Unknown",
          designation: shift.designationRequirements.length > 0 
            ? shift.designationRequirements.map(r => r.designationName).join(", ")
            : "Any",
          payment: shift.formattedPayment,
          urgent: shift.urgentFlag,
          status: shift.status,
        });
      });
    });

    // Apply filters
    let arr = allItems;
    if (filter.sessions.length) arr = arr.filter(i => filter.sessions.includes(i.session));
    if (filter.locations.length) arr = arr.filter(i => filter.locations.includes(i.location));
    if (filter.designations.length) arr = arr.filter(i => filter.designations.some(d => i.designation.includes(d)));

    arr.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    return arr;
  }, [openShifts, filter]);

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
  const { applyForShift, submitting } = useOpenShiftApplication();
  
  const openDetailsFor = (it: Item) => {
    // For now, use the data we already have from the list
    // In a full implementation, you'd fetch full details from API
    const detail: OpenShiftDetail = {
      id: it.id,
      date: it.date,
      start: it.start,
      end: it.end,
      session: it.session,
      location: it.location,
      address: "305 Grattan St, Melbourne VIC 3000, Australia", // TODO: Get from backend
      designation: it.designation,
      theatre: it.location,
      pay: it.payment ? parseFloat(it.payment.replace('$', '')) : 0,
      urgent: it.urgent,
      status: it.status,
      // TODO: Fetch these from API when detail modal opens
      canApply: true,
      assignedStaff: [],
    };
    setDetailShift(detail);
    setDetailVisible(true);
  };
  
  /* ---- Apply for open shift ---- */
  const handleApply = async (openShiftId: string, message?: string) => {
    if (!user?.email) return;
    
    const result = await applyForShift({ openShiftId: parseInt(openShiftId), message });
    
    if (result.success) {
      showToast();
      setDetailVisible(false);
      refresh(); // Refresh the list
    } else if (result.error) {
      // Handle validation errors with friendly warnings (don't log to console)
      const errorMsg = result.error.toLowerCase();
      if (errorMsg.includes("already applied") || errorMsg.includes("duplicate")) {
        showWarning("You have already applied for this shift");
        setDetailVisible(false);
      } else if (errorMsg.includes("already assigned")) {
        showWarning("You are already assigned to this shift");
        setDetailVisible(false);
      } else if (errorMsg.includes("locked") || errorMsg.includes("approved")) {
        showWarning("This shift is no longer accepting applications");
        setDetailVisible(false);
      } else if (errorMsg.includes("designation") || errorMsg.includes("required")) {
        showWarning("Your designation doesn't match the requirements");
        setDetailVisible(false);
      } else {
        // Show generic warning for other validation errors
        showWarning(result.error);
        setDetailVisible(false);
      }
    }
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
      <Pressable style={styles.iconBtn} onPress={refresh} android_ripple={{ color: "#eaeaea" }}>
        {loading ? (
          <ActivityIndicator size="small" color={COLOR.brand} />
        ) : (
          <Ionicons name="refresh" size={sx(18)} color={COLOR.ink} />
        )}
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
                    <View style={styles.row}>
                      <Text style={styles.time}>{it.start} - {it.end}</Text>
                      {it.urgent && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.row}>
                      <Ionicons name="business-outline" size={sx(14)} color={COLOR.label} />
                      <Text style={styles.meta}>{it.location}</Text>
                    </View>
                    <View style={styles.row}>
                      <Ionicons name="person-outline" size={sx(14)} color={COLOR.label} />
                      <Text style={styles.meta}>{it.designation}</Text>
                    </View>
                    {it.payment && (
                      <View style={styles.row}>
                        <Ionicons name="cash-outline" size={sx(14)} color={COLOR.success} />
                        <Text style={[styles.meta, { color: COLOR.success, fontWeight: "600" }]}>{it.payment}</Text>
                      </View>
                    )}
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
          <View style={{ padding: sx(16), alignItems: "center", marginTop: sy(40) }}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={COLOR.brand} />
                <Text style={{ color: COLOR.label, marginTop: sy(12) }}>Loading open shifts...</Text>
              </>
            ) : error ? (
              <>
                <Ionicons name="alert-circle-outline" size={sx(48)} color={COLOR.warn} />
                <Text style={{ color: COLOR.label, marginTop: sy(12) }}>{error}</Text>
                <Pressable onPress={refresh} style={{ marginTop: sy(12), padding: sx(8) }}>
                  <Text style={{ color: COLOR.brand }}>Retry</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={sx(48)} color={COLOR.label} />
                <Text style={{ color: COLOR.label, marginTop: sy(12) }}>No open shifts in this week.</Text>
              </>
            )}
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
        coworkers={detailShift?.assignedStaff || []}
        onClose={() => setDetailVisible(false)}
        onApply={() => {
          if (detailShift) {
            handleApply(detailShift.id);
          }
        }}
      />

      {/* Toast */}
      <SuccessToast visible={toast} text={toastMessage} />
      
      {/* Warning Toast */}
      <WarningToast visible={warningToast} text={toastMessage} />
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
  urgentBadge: {
    backgroundColor: COLOR.warnBg,
    paddingHorizontal: sx(6),
    paddingVertical: sy(2),
    borderRadius: sx(4),
    marginLeft: sx(8),
  },
  urgentText: {
    color: COLOR.warn,
    fontSize: sx(10),
    fontWeight: "700",
  },

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
