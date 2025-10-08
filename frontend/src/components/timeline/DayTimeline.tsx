// day view for My roster page

import React, { useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventItem } from "@/types/roster";
import { sx, sy, W } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { isDateInPast } from "@/lib/dateValidation";

const HOUR_START = 0, HOUR_END = 24, HOUR_HEIGHT = sy(72), TIME_GUTTER = sx(52);
const OVERLAP_OFFSET = sx(8); // Horizontal offset for overlapping cards
const toMinutes = (t: string) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const yFromTime = (t: string) => ((toMinutes(t)-HOUR_START*60)/60)*HOUR_HEIGHT;
const hFromRange = (s: string, e: string) => {
  const startMinutes = toMinutes(s);
  const endMinutes = toMinutes(e);
  // Handle overnight shifts (e.g., 22:00-06:00)
  const duration = endMinutes < startMinutes ? (24*60 - startMinutes + endMinutes) : (endMinutes - startMinutes);
  return (duration/60)*HOUR_HEIGHT;
};

// Detect if two events overlap in time
const eventsOverlap = (ev1: EventItem, ev2: EventItem): boolean => {
  const start1 = toMinutes(ev1.start);
  const end1 = toMinutes(ev1.end);
  const start2 = toMinutes(ev2.start);
  const end2 = toMinutes(ev2.end);
  
  // Handle overnight shifts
  const duration1 = end1 < start1 ? (24*60 - start1 + end1) : (end1 - start1);
  const duration2 = end2 < start2 ? (24*60 - start2 + end2) : (end2 - start2);
  const actualEnd1 = start1 + duration1;
  const actualEnd2 = start2 + duration2;
  
  return start1 < actualEnd2 && actualEnd1 > start2;
};

// Calculate stagger offset for overlapping events
const calculateStaggerOffset = (events: EventItem[], currentIndex: number): number => {
  const currentEvent = events[currentIndex];
  let offset = 0;
  
  // Count how many previous events this one overlaps with
  for (let i = 0; i < currentIndex; i++) {
    if (eventsOverlap(events[i], currentEvent)) {
      offset += OVERLAP_OFFSET;
    }
  }
  
  return offset;
};


export default function DayTimeline({
  events,
  onOpenDetails,
  onOpenRequest,
  onViewMoreOpenShifts,
}: {
  events: EventItem[];
  onOpenDetails: (ev: EventItem) => void;
  onOpenRequest: (ev: EventItem) => void;
  onViewMoreOpenShifts?: (dateStr: string) => void;
}) {
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to first event when events change
  useEffect(() => {
    if (events.length > 0 && scrollViewRef.current) {
      // Find the earliest event start time
      const earliestEvent = events.reduce((earliest, current) => {
        const earliestTime = toMinutes(earliest.start);
        const currentTime = toMinutes(current.start);
        return currentTime < earliestTime ? current : earliest;
      });

      // Calculate scroll position to show the first event
      const firstEventTop = yFromTime(earliestEvent.start);
      const scrollPosition = Math.max(0, firstEventTop - sy(100)); // Offset by 100px to show some context above

      // Scroll to the first event with smooth animation
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [events]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: sy(80) }}
      showsVerticalScrollIndicator={true}
    >
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

        {events.map((ev, index) => {
          const startMinutes = toMinutes(ev.start);
          const endMinutes = toMinutes(ev.end);
          const isOvernight = endMinutes < startMinutes;
          const isOpenShift = ev.action === 'plus';
          const isPastEvent = isDateInPast(ev.date);
          
          // For overnight shifts, we'll show them as two separate visual elements
          // or adjust the rendering to handle the midnight crossover
          const top = yFromTime(ev.start);
          const height = hFromRange(ev.start, ev.end);
          
          // Calculate horizontal offset for overlapping cards
          const staggerOffset = calculateStaggerOffset(events, index);
          const maxOffset = OVERLAP_OFFSET * 2; // Limit maximum stagger to prevent overflow
          const appliedOffset = Math.min(staggerOffset, maxOffset);
          
          return (
            <View
              key={ev.id}
              style={[
                styles.card,
                isOpenShift && styles.openShiftCard,
                isPastEvent && styles.pastEventCard,
                {
                  top,
                  left: TIME_GUTTER + sx(8) + appliedOffset,
                  height: Math.min(height, totalHeight - top), // Ensure card doesn't extend beyond timeline
                  width: W - TIME_GUTTER - sx(16) - appliedOffset, // Reduce width to maintain right edge
                  borderTopColor: ev.color ?? COLOR.brand,
                  // Add visual indicator for overnight shifts
                  borderLeftWidth: isOvernight ? sx(4) : 0,
                  borderLeftColor: isOvernight ? COLOR.warn : 'transparent',
                  // Increase z-index based on array index so later events appear on top
                  zIndex: index,
                },
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={styles.infoColumn}>
                  {/* Show "taken" badge for assigned shifts that have matching open shift */}
                  {ev.action === 'arrow' && (ev as any).hasOpenShift && (
                    <View style={styles.takenBadge}>
                      <Text style={styles.takenBadgeText}>taken</Text>
                    </View>
                  )}
                  {/* Show "OPEN SHIFT" badge for standalone open shifts */}
                  {isOpenShift && !(ev as any).hasOpenShift && (
                    <View style={styles.openShiftBadge}>
                      <Ionicons name="megaphone-outline" size={sx(10)} color={COLOR.success} style={{ marginRight: sx(4) }} />
                      <Text style={styles.openShiftBadgeText}>OPEN SHIFT</Text>
                    </View>
                  )}
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
                  
                  {/* Show open shift info if this is a merged event */}
                  {(ev as any).hasOpenShift && (ev as any).openShiftInfo && (
                    <>
                      <View style={styles.dividerLine} />
                      <View style={styles.openShiftBadge}>
                        <Ionicons name="megaphone-outline" size={sx(10)} color={COLOR.success} style={{ marginRight: sx(4) }} />
                        <Text style={styles.openShiftBadgeText}>OPEN SHIFT AVAILABLE</Text>
                      </View>
                      {(ev as any).openShiftInfo.location && (
                        <View style={styles.infoRow}>
                          <Ionicons name="pin-outline" size={sx(14)} color={COLOR.success} style={styles.infoIcon} />
                          <Text style={[styles.meta, { color: COLOR.success }]}>{(ev as any).openShiftInfo.location}</Text>
                        </View>
                      )}
                      {(ev as any).openShiftInfo.role && (
                        <View style={styles.infoRow}>
                          <Ionicons name="briefcase-outline" size={sx(14)} color={COLOR.success} style={styles.infoIcon} />
                          <Text style={[styles.meta, { color: COLOR.success }]}>{(ev as any).openShiftInfo.role}</Text>
                        </View>
                      )}
                      {(ev as any).openShiftInfo.teammates && (
                        <View style={styles.infoRow}>
                          <Ionicons name="people-outline" size={sx(14)} color={COLOR.success} style={styles.infoIcon} />
                          <Text style={[styles.meta, { color: COLOR.success }]}>{(ev as any).openShiftInfo.teammates}</Text>
                        </View>
                      )}
                    </>
                  )}
                  
                  {/* Show "view more" link for standalone open shifts when there are multiple */}
                  {!((ev as any).hasOpenShift) && (ev as any).multipleOpenShifts > 1 && (
                    <Pressable 
                      onPress={() => onViewMoreOpenShifts?.((ev as any).openShiftDate)}
                      style={styles.viewMoreRow}
                    >
                      <Text style={styles.viewMoreText}>
                        View {(ev as any).multipleOpenShifts - 1} more open shift{(ev as any).multipleOpenShifts > 2 ? 's' : ''} at this time
                      </Text>
                      <Ionicons name="arrow-forward" size={sx(14)} color={COLOR.brand} />
                    </Pressable>
                  )}
                  
                  {/* Show "view more" link for merged events when there are multiple open shifts */}
                  {(ev as any).hasOpenShift && (ev as any).multipleOpenShifts > 1 && (
                    <Pressable 
                      onPress={() => onViewMoreOpenShifts?.((ev as any).openShiftDate)}
                      style={styles.viewMoreRow}
                    >
                      <Text style={styles.viewMoreText}>
                        View {(ev as any).multipleOpenShifts - 1} more open shift{(ev as any).multipleOpenShifts > 2 ? 's' : ''} at this time
                      </Text>
                      <Ionicons name="arrow-forward" size={sx(14)} color={COLOR.brand} />
                    </Pressable>
                  )}
                </View>

                {/* Show dual action buttons if merged event */}
                {(ev as any).hasDualAction ? (
                  <View style={{ gap: sy(8) }}>
                    <Pressable onPress={() => onOpenDetails(ev)} hitSlop={10}>
                      <Ionicons name="arrow-forward-circle" size={sx(32)} color={COLOR.brand} />
                    </Pressable>
                    <Pressable 
                      onPress={() => {
                        if (isPastEvent) return; // Disable for past events
                        // Click plus to open open shift details
                        if ((ev as any).originalOpenShift) {
                          const openShiftEvent = { ...ev, action: 'plus' as const };
                          onOpenDetails(openShiftEvent);
                        }
                      }} 
                      hitSlop={10}
                      disabled={isPastEvent}
                    >
                      <Ionicons 
                        name="add-circle" 
                        size={sx(32)} 
                        color={isPastEvent ? COLOR.label : COLOR.success} 
                      />
                    </Pressable>
                  </View>
                ) : ev.action === "arrow" ? (
                  <Pressable onPress={() => onOpenDetails(ev)} hitSlop={10}>
                    <Ionicons name="arrow-forward-circle" size={sx(36)} color={COLOR.brand} />
                  </Pressable>
                ) : ev.action === "plus" ? (
                  <Pressable 
                    onPress={() => {
                      if (isPastEvent) return; // Disable for past events
                      onOpenDetails(ev);
                    }} 
                    hitSlop={10}
                    disabled={isPastEvent}
                  >
                    <Ionicons 
                      name="add-circle" 
                      size={sx(36)} 
                      color={isPastEvent ? COLOR.label : COLOR.success} 
                    />
                  </Pressable>
                ) : (
                  <Pressable 
                    onPress={() => {
                      if (isPastEvent) return; // Disable for past events
                      onOpenRequest(ev);
                    }} 
                    hitSlop={10}
                    disabled={isPastEvent}
                  >
                    <Ionicons 
                      name="add-circle" 
                      size={sx(36)} 
                      color={isPastEvent ? COLOR.label : COLOR.brand} 
                    />
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
    position: "absolute", 
    backgroundColor: 'rgba(247, 250, 255, 0.85)', // Very light blue with 85% opacity
    borderTopWidth: sx(3), 
    borderWidth: 1,
    borderColor: 'rgba(0, 120, 212, 0.1)', // Very subtle border
    borderRadius: sx(8), 
    padding: sx(12),
    // Shadow removed to allow proper visual overlap blending
  },
  openShiftCard: {
    backgroundColor: 'rgba(232, 245, 233, 0.85)', // Very light green with 85% opacity
    borderColor: 'rgba(76, 175, 80, 0.15)', // Subtle green border
  },
  pastEventCard: {
    opacity: 0.6, // Make past events appear dimmed
  },
  takenBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 120, 212, 0.08)',
    paddingHorizontal: sx(8),
    paddingVertical: sy(2),
    borderRadius: sx(4),
    marginBottom: sy(6),
  },
  takenBadgeText: {
    color: COLOR.brand,
    fontSize: sx(10),
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  openShiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: sx(6),
    paddingVertical: sy(2),
    borderRadius: sx(4),
    marginBottom: sy(6),
  },
  openShiftBadgeText: {
    color: COLOR.success,
    fontSize: sx(9),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLOR.divider,
    marginVertical: sy(8),
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sy(6),
    paddingHorizontal: sx(8),
    backgroundColor: 'rgba(0, 120, 212, 0.05)',
    borderRadius: sx(6),
    marginTop: sy(6),
    gap: sx(6),
  },
  viewMoreText: {
    color: COLOR.brand,
    fontSize: sx(11),
    fontWeight: '600',
    flex: 1,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoColumn: { flex: 1, paddingRight: sx(8), gap: sy(4) },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: sx(6) },
  timeText: { color: COLOR.ink, fontSize: sx(12), fontWeight: "700" },
  meta: { color: COLOR.ink, fontSize: sx(12) },
});
