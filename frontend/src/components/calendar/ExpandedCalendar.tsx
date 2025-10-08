// src/components/calendar/ExpandedCalendar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { H, sx } from "@/theme/metrics";
import { ShiftType } from "@/types/roster";
import { useRosterPeriod } from "@/hooks/useRosterPeriod";

/* ===== Sizes ===== */
const CALENDAR_W = sx(343);
const CELL_W = sx(40);
const CELL_H = sx(48);
const HEADER_H = sx(32);
const MONTH_H = sx(24);

/* ===== Helpers ===== */
const dayKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

function buildMonths(anchor: Date, count = 2) {
  return Array.from({ length: count }, (_, k) => {
    const first = startOfMonth(new Date(anchor.getFullYear(), anchor.getMonth() + k, 1));
    const last = endOfMonth(first);
    const firstWeekdayMon0 = (first.getDay() + 6) % 7; // 0..6 => Mon..Sun

    const days: Date[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(first.getFullYear(), first.getMonth(), d));
    }

    return {
      title: new Intl.DateTimeFormat("en-US", { month: "long" }).format(first),
      first,
      firstWeekdayMon0,
      days,
    };
  });
}

/** Get shift type(s) for a date */
function getShiftTypeForDate(d: Date, shiftMap?: Record<string, ShiftType | ShiftType[]>): ShiftType | ShiftType[] | undefined {
  const key = dayKey(d);
  return shiftMap?.[key];
}

/**
 * Combine multiple shift types into a single visual representation
 */
function visualOf(types: ShiftType | ShiftType[] | undefined) {
  const typeArray = types ? (Array.isArray(types) ? types : [types]) : [];
  
  if (typeArray.length === 0) {
    return { dots: ["hollow", "hollow"] as const, labels: [] };
  }
  
  const hasAH = typeArray.includes("AH");
  const hasPM = typeArray.includes("PM");
  const hasAM = typeArray.includes("AM");
  const hasOnCall = typeArray.includes("ON_CALL");
  
  const leftDot = (hasAM || hasAH) ? "filled" : "hollow";
  const rightDot = hasPM ? "filled" : "hollow";
  
  const labels: string[] = [];
  if (hasAH) labels.push("AH");
  if (hasOnCall) labels.push("On Call");
  
  return { 
    dots: [leftDot, rightDot] as const, 
    labels 
  };
}

const TwoDots = ({ left, right }: { left: "filled" | "hollow"; right: "filled" | "hollow" }) => (
  <View style={{ height: sx(6), flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
    <View style={left === "filled" ? dotStyles.filled : dotStyles.hollow} />
    <View style={{ width: sx(3) }} />
    <View style={right === "filled" ? dotStyles.filled : dotStyles.hollow} />
  </View>
);

const dotStyles = StyleSheet.create({
  filled: { width: sx(4), height: sx(4), borderRadius: sx(2), backgroundColor: "#000" },
  hollow: { width: sx(4), height: sx(4), borderRadius: sx(2), borderWidth: 1.5, borderColor: "#BDBDBD", backgroundColor: "transparent" },
});

/* ===== Props ===== */
interface Props {
  value: Date;
  onChange: (d: Date) => void;
  shiftMap?: Record<string, ShiftType | ShiftType[]>; // YYYY-MM-DD -> shift type(s)
  leaveMap?: Record<string, boolean>;                 // YYYY-MM-DD -> true if approved leave exists
  title?: string;
  leftAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
}

/* ===== Component ===== */
export default function ExpandedCalendar({
  value,
  onChange,
  shiftMap,
  leaveMap,
  title,
  leftAction,
  rightAction,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const { months: rosterMonths } = useRosterPeriod(today);
  
  const months = useMemo(() => {
    if (rosterMonths.length > 0) {
      return rosterMonths;
    }
    return buildMonths(today, 2);
  }, [rosterMonths, today]);

  const todayKey = dayKey(today);

  return (
    <View style={styles.container}>
      {/* Header with title and navigation */}
      {(title || leftAction || rightAction) && (
        <View style={styles.header}>
          {leftAction ? (
            <Pressable onPress={leftAction.onPress} hitSlop={10} style={styles.headerBtn}>
              <Ionicons name={leftAction.icon} size={sx(20)} color={COLOR.ink} />
            </Pressable>
          ) : (
            <View style={styles.headerBtn} />
          )}
          
          {title && <Text style={styles.headerTitle}>{title}</Text>}
          
          {rightAction ? (
            <Pressable onPress={rightAction.onPress} hitSlop={10} style={styles.headerBtn}>
              <Ionicons name={rightAction.icon} size={sx(20)} color={COLOR.ink} />
            </Pressable>
          ) : (
            <View style={styles.headerBtn} />
          )}
        </View>
      )}

      {/* Calendar Content */}
      <View style={styles.content}>
        {/* Day labels */}
        <View style={styles.dayLabelsContainer}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <View key={d} style={styles.dayLabelContainer}>
              <Text style={[styles.dayLabel, i >= 5 && styles.weekend]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Months */}
        {months.map((m, idx) => (
          <View key={`${m.title}-${idx}`} style={styles.monthBlock}>
            {/* Month Title */}
            <View style={styles.monthTitleRow}>
              <Text style={styles.monthTitleText}>{m.title}</Text>
            </View>

            {/* Grid */}
            <View style={styles.gridWrap}>
              {/* Spacer cells for alignment */}
              {Array.from({ length: m.firstWeekdayMon0 }).map((_, i) => (
                <View key={`spacer-${i}`} style={styles.gridCellSpacer} />
              ))}

              {/* Date cells */}
              {m.days.map((d, i) => {
                const isToday = dayKey(d) === todayKey;
                const selected = dayKey(d) === dayKey(value);
                const t = getShiftTypeForDate(d, shiftMap);
                const v = visualOf(t);
                const hasApprovedLeave = leaveMap?.[dayKey(d)] === true;
                
                let backgroundColor = "transparent";
                if (hasApprovedLeave) backgroundColor = "#E8F5E9"; // Light green for approved leave
                if (isToday) backgroundColor = COLOR.card;
                if (selected) backgroundColor = "#E9F4FF";
                
                return (
                  <Pressable
                    key={`${dayKey(d)}-${i}`}
                    style={styles.gridCell}
                    onPress={() => onChange(d)}
                  >
                    <View style={[
                      styles.gridCellContentExpanded, 
                      { backgroundColor, borderWidth: selected ? 1 : 0, borderColor: selected ? COLOR.brand : "transparent" }
                    ]}>
                      {v.labels.length > 0 && (
                        <View style={styles.labelsContainer}>
                          {v.labels.map((label, idx) => (
                            <Text key={idx} style={styles.shiftLabel}>{label}</Text>
                          ))}
                        </View>
                      )}
                      <Text style={[styles.gridText, selected && styles.gridTextSelected]}>
                        {d.getDate()}
                      </Text>
                      <TwoDots left={v.dots[0]} right={v.dots[1]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: sx(12),
    padding: sx(16),
  },

  header: {
    height: HEADER_H,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: sx(16),
  },
  headerBtn: {
    width: sx(32),
    height: sx(32),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
    textAlign: "center",
  },

  content: {
    gap: sx(16),
  },

  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: sx(12),
    paddingHorizontal: sx(2),
  },
  dayLabelContainer: { 
    width: `${100/7}%`, 
    alignItems: "center",
  },
  dayLabel: { 
    color: COLOR.ink, 
    fontSize: sx(12),
    fontWeight: "500",
  },
  weekend: { color: COLOR.brand },

  monthBlock: { 
    marginBottom: sx(20),
  },
  monthTitleRow: {
    marginBottom: sx(12),
    paddingHorizontal: sx(2),
  },
  monthTitleText: {
    fontSize: sx(16),
    fontWeight: "700",
    color: COLOR.ink,
  },

  gridWrap: { 
    flexDirection: "row", 
    flexWrap: "wrap",
  },
  gridCellSpacer: {
    width: `${100/7}%`,
    height: CELL_H,
  },
  gridCell: {
    width: `${100/7}%`,
    height: CELL_H,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: sx(2),
  },

  // Expanded: content centered with fixed visual size matching week cells
  gridCellContentExpanded: {
    alignItems: "center",
    justifyContent: "center",
    gap: sx(4),
    width: CELL_W,
    height: CELL_H,
    borderRadius: sx(8),
    position: "relative",
  },

  gridText: { fontSize: sx(14), color: COLOR.ink },
  gridTextSelected: { color: COLOR.brand, fontWeight: "700" },
  
  labelsContainer: {
    position: "absolute",
    top: sx(1),
    right: sx(1),
    alignItems: "flex-end",
    gap: sx(1),
  },
  shiftLabel: {
    fontSize: sx(9),
    fontWeight: "600",
    color: COLOR.brand,
    lineHeight: sx(10),
    textAlign: "right",
  },
});
