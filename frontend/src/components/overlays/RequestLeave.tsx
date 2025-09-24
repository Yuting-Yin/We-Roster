import React from "react";
import { View, ScrollView, Text, TextInput, Pressable, Animated, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, LayoutChangeEvent, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt as fmtDate } from "@/lib/date";
import Chip from "@/components/common/Chip";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createLeaveRequest } from "@/api/leave";

export default function RequestLeave({
  visible, onCancel, onSubmitted, date, slot,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: () => void;
  date: Date;
  slot?: { start: string; end: string };
}) {
  const { user } = useCurrentUser({ mock: true });

  const [leaveType] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  // Keyboard handling and precise scroll control
  const [kbHeight, setKbHeight] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [headerH, setHeaderH] = React.useState(0);
  const [reasonY, setReasonY] = React.useState<number | null>(null);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderH(e.nativeEvent.layout.height);
  };

  const onReasonLayout = (e: LayoutChangeEvent) => {
    setReasonY(e.nativeEvent.layout.y);
  };

  const scrollReasonIntoView = React.useCallback(() => {
    if (reasonY === null) return;
    const margin = sy(8);
    const targetY = Math.max(0, reasonY - headerH - margin);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [reasonY, headerH]);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
      setTimeout(scrollReasonIntoView, 60);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, [scrollReasonIntoView]);

  if (!visible) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  const submit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const payload = {
        requestType: leaveType,
        allDay,
        date: fmtDate(date, { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-") as unknown as string,
        start: allDay ? null : (slot?.start ?? null),
        end: allDay ? null : (slot?.end ?? null),
        reason: reason?.trim() || undefined,
        createdBy: { id: user?.id ?? "u_unknown", name: user?.name ?? undefined, email: user?.email ?? undefined },
        createdAt: new Date().toISOString(),
        shiftId: undefined, // TODO: pass actual shift id when available from context
      };
      await createLeaveRequest(payload);
      onSubmitted?.();
    } catch (e) {
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 45 }]} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={headerH}>
          {/* Measure header+divider height as the top region to clear when scrolling */}
          <View onLayout={onHeaderLayout}>
            <View style={styles.header}>
              <Pressable onPress={onCancel}><Text style={styles.hLeft}>Cancel</Text></Pressable>
              <Text style={styles.hTitle}>LEAVE REQUEST</Text>
              <Pressable onPress={submit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color={COLOR.brand} />
                ) : (
                  <Text style={styles.hRight}>Submit</Text>
                )}
              </Pressable>
            </View>
            <View style={styles.divider} />
          </View>

          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: sy(420) }}
            contentContainerStyle={{ paddingBottom: sy(18) + (Platform.OS === "ios" ? kbHeight : 0) }}
          >
            {/* All Day toggle */}
            <View style={styles.toggleRow}>
              <Text style={{ color: COLOR.ink, fontSize: sx(14) }}>All Day</Text>
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
              <Chip>{fmtDate(date, { day: "2-digit", month: "short" })}</Chip>
              {!allDay && (<><View style={{ width: sx(8) }} /><Chip>{slot?.start ?? "08:00"}</Chip></>)}
            </View>} />
            <Row label="End" right={<View style={{ flexDirection: "row" }}>
              <Chip>{fmtDate(date, { day: "2-digit", month: "short" })}</Chip>
              {!allDay && (<><View style={{ width: sx(8) }} /><Chip>{slot?.end ?? "13:00"}</Chip></>)}
            </View>} />

            {/* Reason */}
            <View style={{ marginHorizontal: sx(16), marginTop: sy(14) }} onLayout={(e) => setReasonY(e.nativeEvent.layout.y)}>
              <View style={styles.noteBox}>
                <TextInput
                  placeholder="Type leave reason here ..."
                  placeholderTextColor="#8FA7BF"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  textAlignVertical="top"
                  onFocus={() => setTimeout(scrollReasonIntoView, 60)}
                  style={{ color: COLOR.ink, fontSize: sx(16), minHeight: sy(120) }}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: sx(16), 
    paddingVertical: sy(20) 
  },
  hLeft: { color: COLOR.ink, fontSize: sx(16) },
  hTitle: { color: "#000", fontSize: sx(16), fontWeight: "600" },
  hRight: { color: COLOR.brand, fontSize: sx(16), fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider },
  roundInput: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(22), paddingVertical: sy(10), paddingHorizontal: sx(14) },
  toggleRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginHorizontal: sx(16), 
    marginTop: sy(14),
    marginBottom: sy(14),
   },
  row: { paddingHorizontal: sx(16), paddingVertical: sy(12), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: COLOR.ink, fontSize: sx(16) },
  noteBox: { borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(16), paddingHorizontal: sx(12), paddingVertical: sy(8) },
});
