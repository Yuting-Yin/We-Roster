// src/components/calendar/CollapsibleCalendar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { H, sx } from "@/theme/metrics";
import { ShiftType } from "@/types/roster";
import { useRosterPeriod } from "@/hooks/useRosterPeriod";

/* ===== Sizes ===== */
const CARET_SIZE = sx(28);
const CARET_ICON = sx(16);
const DOT_SIZE = sx(4);
const COL_W_PCT = 100 / 7; // 每列百分比宽度

/* =================== Helpers =================== */
const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opt).format(d);

const dayKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/* Weeks beginning on Monday */
function startOfWeekMon(d: Date) {
  const r = new Date(d);
  const day = r.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // Mon=0
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* Derive the 7 days of this week (starting with Monday) from the selected date */
function getWeekDays(value: Date): Date[] {
  const start = startOfWeekMon(value);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** 生成从 anchor 起连续 count 个月，仅包含当月天数；并提供第一天的列索引（Mon=0..Sun=6） */
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
      title: fmt(first, { month: "long" }), // 只显示月份名
      first,
      firstWeekdayMon0,
      days,
    };
  });
}

// Removed buildRosterPeriodMonths - now using centralized roster period system

/* =================== Types =================== */
// Use ShiftType for actual shifts, undefined for no shifts

type Action = { icon: "menu" | "refresh"; onPress: () => void };

type Props = {
  value: Date;                                        // Currently selected date (controlled)
  onChange: (d: Date) => void;                        // Selection change callback
  shiftMap?: Record<string, ShiftType | ShiftType[]>; // YYYY-MM-DD -> shift type(s) (undefined = no shifts)
  leaveMap?: Record<string, boolean>;                 // YYYY-MM-DD -> true if approved leave exists
  /** The title placed in the center of the header (default: "Mon, May 12, 2025") */
  title?: string;
  /** Icon button on the left side of the head (menu) */
  leftAction?: Action;
  /** Icon button on the right side of the head (refresh) */
  rightAction?: Action;
};

/* =================== Visual helpers =================== */
// Left dot filled: AM or AH   Right dot filled: PM   not-working/unallocated: ○○
const dotStyles = StyleSheet.create({
  filled: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: "#000" },
  hollow: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 1.5, borderColor: "#BDBDBD", backgroundColor: "transparent" },
});

/**
 * Combine multiple shift types into a single visual representation
 * Rules:
 * - Left dot: filled if has AM or AH shift
 * - Right dot: filled if has PM shift
 * - Labels: Show "AH" if has AH, "On Call" if has ON_CALL (can show both)
 */
function visualOf(types: ShiftType | ShiftType[] | undefined) {
  // Normalize to array
  const typeArray = types ? (Array.isArray(types) ? types : [types]) : [];
  
  // Debug log for ON_CALL shifts
  if (typeArray.includes("ON_CALL")) {
    console.log("🔍 Calendar: ON_CALL shift detected in types:", typeArray);
  }
  
  if (typeArray.length === 0) {
    return { dots: ["hollow", "hollow"] as const, labels: [] };
  }
  
  // Determine dots based on shift types present
  const hasAH = typeArray.includes("AH");
  const hasPM = typeArray.includes("PM");
  const hasAM = typeArray.includes("AM");
  const hasOnCall = typeArray.includes("ON_CALL");
  
  const leftDot = (hasAM || hasAH) ? "filled" : "hollow";
  const rightDot = hasPM ? "filled" : "hollow";
  
  // Determine labels to show
  const labels: string[] = [];
  if (hasAH) labels.push("AH");
  if (hasOnCall) labels.push("On Call");
  
  return { 
    dots: [leftDot, rightDot] as const, 
    labels 
  };
}

/** Get shift type(s) for a date, returns undefined if no shifts */
function getShiftTypeForDate(d: Date, shiftMap?: Props["shiftMap"]): ShiftType | ShiftType[] | undefined {
  const key = dayKey(d);
  const result = shiftMap?.[key];
  return result;
}

const iconFor = (name: Action["icon"]) => (name === "menu" ? "menu-outline" : "refresh");

/* =================== Component =================== */
export default function CollapsibleCalendar({
  value,
  onChange,
  shiftMap,
  leaveMap,
  title,
  leftAction,
  rightAction,
}: Props) {
  const selectedDate = value;
  const [expanded, setExpanded] = useState(false);
  
  // Debug: Log ON_CALL shifts in shiftMap
  useEffect(() => {
    if (shiftMap) {
      const onCallDays = Object.entries(shiftMap).filter(([_, type]) => {
        if (Array.isArray(type)) {
          return type.includes("ON_CALL");
        }
        return type === "ON_CALL";
      });
      if (onCallDays.length > 0) {
        console.log("🔍 Calendar: ON_CALL shifts found in shiftMap:", onCallDays);
      }
      
      // Also log days with multiple shift types
      const multiShiftDays = Object.entries(shiftMap).filter(([_, type]) => Array.isArray(type) && type.length > 1);
      if (multiShiftDays.length > 0) {
        console.log("🔍 Calendar: Days with multiple shift types:", multiShiftDays);
      }
    }
  }, [shiftMap]);

  // Lock the start month of the expansion window (set when expanding for the first time)
  const [expandBase, setExpandBase] = useState<Date | null>(null);

  const rotate = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  // Use roster period system to get the correct months
  const { months: rosterMonths } = useRosterPeriod(selectedDate);

  // Use expandBase (if present) as the base for the two-month window; otherwise, use roster period system.
  const months = useMemo(() => {
    if (expandBase) {
      return buildMonths(expandBase, 2);
    } else {
      // Use centralized roster period system to show the correct two-month period
      return rosterMonths;
    }
  }, [selectedDate, expandBase, rosterMonths]);

  // Week cell data (read shiftMap first)
  const weekCells = useMemo(() => {
    const days = getWeekDays(selectedDate);
    return days.map((d) => ({
      fullDate: d,
      date: d.getDate(),
      type: getShiftTypeForDate(d, shiftMap),
    }));
  }, [selectedDate, shiftMap]);

  const toggle = () => {
    const next = !expanded;
    if (next && !expandBase) {
      // Set expandBase to the first month of the roster period that will be shown
      if (rosterMonths.length > 0) {
        setExpandBase(rosterMonths[0].first);
      } else {
        setExpandBase(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      }
    }
    Animated.parallel([
      Animated.timing(rotate, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: true }),
      Animated.timing(heightAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
    setExpanded(next);
    // Reset expandBase when collapsing to allow recalculation on next expand
    if (!next) setExpandBase(null);
  };

  const iconRotate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  // Use flex: 1 to fill remaining screen space instead of fixed height
  const expandedH = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const todayKey = dayKey(new Date());

  return (
    <View style={styles.container}>
      {/* Header (title / leftAction / rightAction) */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {leftAction ? (
            <Pressable onPress={leftAction.onPress} hitSlop={10}>
              <Ionicons name={iconFor(leftAction.icon)} size={sx(22)} color={COLOR.ink} />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.headerTitle}>
          {title ?? `${fmt(selectedDate, { weekday: "short" })}, ${fmt(selectedDate, { day: "2-digit", month: "short", year: "numeric" })}`}
        </Text>

        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
          {rightAction ? (
            <Pressable onPress={rightAction.onPress} hitSlop={10}>
              <Ionicons name={iconFor(rightAction.icon)} size={sx(20)} color={COLOR.ink} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Closed */}
      {!expanded && (
        <View style={styles.calendarContent}>
          {/* Day labels */}
          <View style={styles.dayLabelsContainer}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <View key={d} style={styles.dayLabelContainer}>
                <Text style={[styles.dayLabel, i >= 5 && styles.weekend]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Week strip + down open arrow */}
          <View style={styles.weekCard}>
            <View style={styles.weekWrapper}>
              <View style={styles.weekRow}>
                {weekCells.map((item, idx) => {
                  const isSelected = dayKey(item.fullDate) === dayKey(selectedDate);
                  const isToday = dayKey(item.fullDate) === todayKey;
                  const hasApprovedLeave = leaveMap?.[dayKey(item.fullDate)] === true;
                  const v = visualOf(item.type);
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => onChange?.(item.fullDate)}
                      style={[
                        styles.dateContainer, 
                        isSelected && { borderColor: COLOR.brand, borderWidth: 1 }, 
                        isToday && { backgroundColor: COLOR.card },
                        hasApprovedLeave && { backgroundColor: '#E8F5E9' } // Light green for approved leave
                      ]}
                    >
                      {v.labels.length > 0 && (
                        <View style={styles.labelsContainer}>
                          {v.labels.map((label, i) => (
                            <Text key={i} style={styles.shiftLabel}>{label}</Text>
                          ))}
                        </View>
                      )}
                      <Text style={styles.dateText}>{item.date}</Text>
                      <TwoDots left={v.dots[0]} right={v.dots[1]} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Floating round arrow: positioned on the outer layer */}
            <View style={styles.weekFooter}>
              <Pressable onPress={toggle} style={styles.inlineCaret} hitSlop={10}>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <Ionicons name="chevron-down" size={CARET_ICON} color={COLOR.brand} />
                </Animated.View>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Expanded state */}
      <Animated.View style={[styles.expandedContainer, { flex: expandedH, overflow: "hidden" }]}>
        {expanded && (
          <>
            <View style={styles.expandCaretTop}>
              <Pressable onPress={toggle} style={styles.caretTopBtn} hitSlop={10}>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <Ionicons name="chevron-down" size={CARET_ICON} color={COLOR.brand} />
                </Animated.View>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: sx(12) }}>
              {months.map((m, idx) => (
                <View key={`${m.title}-${idx}`} style={styles.monthBlock}>
                  {/* 标题行：高度固定；x 根据当月第一天的列对齐 */}
                  <View style={styles.monthTitleRow}>
                    <View
                      style={[
                        styles.monthTitleCell,
                        { left: `${m.firstWeekdayMon0 * COL_W_PCT}%`, /* width: `${COL_W_PCT}%` */ },
                      ]}
                    >
                      <Text style={styles.monthTitleText}>{m.title}</Text>
                    </View>
                  </View>

                  {/* 网格：先渲染 offset 个透明占位，再渲染当月所有天 */}
                  <View style={styles.gridWrap}>
                    {/* 透明占位，保证列对齐（不显示非本月的日期） */}
                    {Array.from({ length: m.firstWeekdayMon0 }).map((_, i) => (
                      <View key={`spacer-${i}`} style={styles.gridCellSpacer} />
                    ))}

                    {m.days.map((d, i) => {
                      const selected = dayKey(d) === dayKey(selectedDate);
                      const isToday = dayKey(d) === todayKey;
                      const hasApprovedLeave = leaveMap?.[dayKey(d)] === true;
                      const t = getShiftTypeForDate(d, shiftMap);
                      const v = visualOf(t);
                      
                      // Determine background color priority: selected > today > approved leave
                      let backgroundColor = "transparent";
                      if (hasApprovedLeave) backgroundColor = "#E8F5E9"; // Light green for approved leave
                      if (isToday) backgroundColor = COLOR.card;
                      if (selected) backgroundColor = "#E9F4FF";
                      
                      return (
                        <Pressable
                          key={`${dayKey(d)}-${i}`}
                          style={styles.gridCell}
                          onPress={() => {
                            onChange?.(d);
                            toggle();
                          }}
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
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/* small two dots for day cell */
const TwoDots = ({ left, right }: { left: "filled" | "hollow"; right: "filled" | "hollow" }) => (
  <View style={{ height: sx(6), flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
    <View style={left === "filled" ? dotStyles.filled : dotStyles.hollow} />
    <View style={{ width: sx(3) }} />
    <View style={right === "filled" ? dotStyles.filled : dotStyles.hollow} />
  </View>
);

/* =================== Styles =================== */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 9.4,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingVertical: sx(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  headerSide: { width: sx(28), alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { color: COLOR.ink, fontSize: sx(14), fontWeight: "600" },

  /* 收起态 */
  calendarContent: { paddingBottom: 0 },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingTop: sx(8),
  },
  dayLabelContainer: { width: sx(40), height: sx(24), justifyContent: "center", alignItems: "center" },
  dayLabel: { color: COLOR.ink, fontSize: sx(12) },
  weekend: { color: COLOR.brand },

  // Outer positioning container (not clipped)
  weekCard: { position: "relative", overflow: "visible" },

  weekWrapper: {
    borderRadius: sx(12),
    backgroundColor: "#FFF",
    paddingHorizontal: sx(16),
    paddingTop: sx(8),
    paddingBottom: sx(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
    overflow: "visible",
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },

  dateContainer: {
    width: sx(40),
    height: sx(48),
    borderRadius: sx(8),
    justifyContent: "center",
    alignItems: "center",
    gap: sx(2),
    backgroundColor: "#FFF",
    borderWidth: 0,
    borderColor: "transparent",
    position: "relative",
  },
  dateText: { fontSize: sx(12), color: COLOR.ink },
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

  // Floating arrow: positioned on weekCard
  weekFooter: {
    position: "absolute",
    left: "50%",
    bottom: -CARET_SIZE / 2 - sx(10),
    transform: [{ translateX: -CARET_SIZE / 2 }],
    width: CARET_SIZE,
    height: CARET_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },

  inlineCaret: {
    width: CARET_SIZE,
    height: CARET_SIZE,
    borderRadius: CARET_SIZE / 2,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E3E3E3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  /* open status */
  expandedContainer: { backgroundColor: "#FFF", paddingHorizontal: sx(16), paddingTop: sx(8) },
  expandCaretTop: { alignItems: "center", marginBottom: sx(8) },
  caretTopBtn: {
    width: CARET_SIZE,
    height: CARET_SIZE,
    borderRadius: CARET_SIZE / 2,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E3E3E3",
  },

  /* ====== Month block ====== */
  monthBlock: { marginBottom: sx(10) },

  // 标题行占位，高度固定
  monthTitleRow: {
    position: "relative",
    height: sx(20), // 固定 y（标题所在的行高度）
    marginBottom: sx(4),
  },
  // 标题宽度为 1 列，x 通过 left 百分比定位；内部文本居中
  monthTitleCell: {
    position: "absolute",
    top: 0, // fixed y
    alignItems: "center",
    justifyContent: "flex-start",
  },
  monthTitleText: {
    fontSize: sx(14),
    fontWeight: "700",
    color: COLOR.ink,
  },

  /* ====== Grid ====== */
  gridWrap: { flexDirection: "row", flexWrap: "wrap" },

  gridCellSpacer: {
    width: `${COL_W_PCT}%`,
    height: sx(48),
  },

  gridCell: {
    width: `${COL_W_PCT}%`,
    height: sx(48),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: sx(2),
  },

  // Expanded: content centered with fixed visual size matching week cells
  gridCellContentExpanded: {
    alignItems: "center",
    justifyContent: "center",
    gap: sx(4),
    width: sx(40),
    height: sx(48),
    borderRadius: sx(8),
    position: "relative",
  },

  gridText: { fontSize: sx(14), color: COLOR.ink },
  gridTextSelected: { color: COLOR.brand, fontWeight: "700" },
});
