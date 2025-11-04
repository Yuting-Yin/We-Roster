import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { hoursBetween, fmt, dayKey } from "@/lib/date";
import { isDateInPast } from "@/lib/dateValidation";
import Chip from "@/components/common/Chip";
import Avatar from "@/components/common/Avatar";
import { EventItem } from "@/types/roster";
import { useApprovedLeaves } from "@/hooks/useApprovedLeaves";
import WarningToast from "@/components/overlays/WarningToast";

export default function ShiftDetails({
  visible, onClose, onPressPlus, onCoworkerPress, date, event,
}: {
  visible: boolean;
  onClose: () => void;
  onPressPlus: (anchor: { x: number; y: number }) => void;
  onCoworkerPress?: (coworker: { id: string; name: string; initials: string }) => void;
  date: Date;
  event?: EventItem;
}) {
  const plusRef = React.useRef<View>(null);
  const anim = React.useRef(new Animated.Value(0)).current; // 0 -> hidden, 1 -> visible
  const { leaveMap } = useApprovedLeaves();
  const [warningToast, setWarningToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  
  const showWarningToast = (message: string) => { 
    setToastMessage(message); 
    setWarningToast(true); 
    setTimeout(() => setWarningToast(false), 1800); 
  };

  React.useEffect(() => {
    if (visible && event) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, event, anim]);

  if (!visible || !event) return null;

  const duration = `${hoursBetween(event.start, event.end)} hours`;
  
  // Check if the date has an approved leave or is in the past
  const dateKey = dayKey(date);
  const hasApprovedLeave = leaveMap[dateKey] === true;
  const isPastDate = isDateInPast(date);
  const isDisabled = hasApprovedLeave || isPastDate;
  
  const measurePlus = () => {
    // Check if the date has an approved leave
    if (hasApprovedLeave) {
      showWarningToast("Cannot submit requests for dates with approved leave. You already have an approved leave request for this date.");
      return;
    }
    
    // Check if the date is in the past
    if (isPastDate) {
      const today = new Date();
      const todayStr = today.toLocaleDateString();
      const dateStr = date.toLocaleDateString();
      showWarningToast(`Cannot submit requests for past dates. Selected date: ${dateStr}, Today: ${todayStr}`);
      return;
    }
    
    console.log("[ShiftDetails] + pressed"); // TODO: Remove debug logging after hooking up real action.
    plusRef.current?.measureInWindow((px, py, w, h) => {
      console.log("[ShiftDetails] measured", px, py);
      onPressPlus({ x: px + w, y: py + h + sy(4) });
    });
  }

  const coworkerInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const campusLabel = event.campus ?? undefined;
  const campusAddress = event.campusAddress ?? undefined;
  const roomLabel = event.room ?? event.title; // fallback to title if room not provided

  const animatedStyle = {
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [sy(24), 0] }) }],
  } as const;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.header}>
        <Pressable ref={plusRef} onPress={measurePlus} hitSlop={10}>
          <Ionicons 
            name="add-outline" 
            size={sx(24)} 
            color={isDisabled ? COLOR.ink + "40" : COLOR.ink} 
          />
        </Pressable>
        <Text style={styles.title}>Shift Details</Text>
        <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close-outline" size={sx(28)} color={COLOR.ink} /></Pressable>
      </View>
      <View style={styles.divider} />

      <View style={{ flexDirection: "row", paddingHorizontal: sx(16), paddingVertical: sy(12), justifyContent: "space-between" }}>
        <Chip
          icon={<Ionicons name="calendar-outline" size={sx(16)} color={COLOR.ink} />}
        >
          {fmt(date, { weekday: "short" })}, {fmt(date, { day: "2-digit", month: "short" })}
        </Chip>
        <Chip
          icon={<Ionicons name="time-outline" size={sx(16)} color={COLOR.ink} />}
        >
          {event.start} - {event.end}
        </Chip>
        <Chip
          icon={<Ionicons name="hourglass-outline" size={sx(16)} color={COLOR.ink} />}
        >
          {duration}
        </Chip>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ paddingBottom: sy(24) }}>
        {/* Campus */}
        {campusLabel ? (
          <View style={{ marginHorizontal: sx(16), marginTop: sy(12), marginBottom: sy(8) }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="business-outline" size={sx(20)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
              <Text style={{ color: "#000", fontSize: sx(14) }}>{campusLabel}</Text>
            </View>
            {campusAddress ? (
              <Text style={{ color: "#004578", fontSize: sx(12), marginLeft: sx(26), marginTop: sy(2) }}>
                {campusAddress}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Role */}
        {event.role ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: sx(16), marginBottom: sy(6) }}>
            <Ionicons name="briefcase-outline" size={sx(16)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
            <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>{event.role}</Text>
          </View>
        ) : null}

        {/* Room */}
        {roomLabel ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: sx(16) }}>
            <Ionicons name="pin-outline" size={sx(20)} color={COLOR.ink} style={{ marginRight: sx(6) }} />
            <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>{roomLabel}</Text>
          </View>
        ) : null}

        {(campusLabel || event.role || roomLabel) ? (
          <View style={styles.sectionDivider} />
        ) : null}

        {/* Coworkers */}
        {event.coworkers && event.coworkers.length > 0 ? (
          <View style={{ marginHorizontal: sx(16), marginTop: sy(6) }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: sy(10) }}>
              <Ionicons name="people-outline" size={sx(18)} color={COLOR.ink} style={{ marginRight: sx(8) }} />
              <Text style={{ color: COLOR.ink, fontSize: sx(16), fontWeight: "600" }}>Working with</Text>
            </View>

            {event.coworkers.map((c, i) => (
              <Pressable 
                key={c.id ?? i} 
                style={{ flexDirection: "row", alignItems: "center", marginBottom: sy(10) }}
                onPress={() => onCoworkerPress?.({ 
                  id: c.id, 
                  name: c.name, 
                  initials: c.initials ?? coworkerInitials(c.name) 
                })}
                disabled={!onCoworkerPress}
              >
                <Avatar initials={c.initials ?? coworkerInitials(c.name)} />
                <Text style={{ marginLeft: sx(10), color: COLOR.ink, fontSize: sx(14) }}>{c.name}</Text>
                {onCoworkerPress && (
                  <Ionicons name="chevron-forward" size={sx(16)} color={COLOR.label} style={{ marginLeft: "auto" }} />
                )}
              </Pressable>
            ))}
          </View>
        ) : null}

        {event.coworkers && event.coworkers.length > 0 ? (
          <View style={styles.sectionDivider} />
        ) : null}

        {/* Notes placeholder - no notes field on EventItem yet */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(6) }}>
          <Text style={{ color: COLOR.ink, fontSize: sx(16), fontWeight: "600", marginBottom: sy(8) }}>Notes</Text>
          <View style={styles.notesBox}>
            <Text style={{ color: "#8FA7BF", fontSize: sx(16) }}>Note content</Text>
          </View>
        </View>
      </ScrollView>
      
      <WarningToast visible={warningToast} text={toastMessage} />
    </Animated.View>
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

