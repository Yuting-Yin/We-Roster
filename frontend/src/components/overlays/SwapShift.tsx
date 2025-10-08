import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import Avatar from "@/components/common/Avatar";
import { fmt, dayKey } from "@/lib/date";
import { isDateInPast, getPastDateErrorMessage } from "@/lib/dateValidation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { EventItem } from "@/types/roster";
import { getMockShiftForUser } from "@/lib/fakeData";
import { createSwapRequest } from "@/api/swap";
import { useNotificationContext } from "@/contexts/NotificationContext";
import WarningToast from "@/components/overlays/WarningToast";

type User = { id: string; name: string; initials: string; title?: string };

type SwapShiftProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: (payload?: { message: string; targetUserId?: string }) => void;
  date: Date;
  slot?: { start: string; end: string };
  currentEvent?: EventItem;           // details of YOUR current shift (for campus/room)
  availableUsers: User[];
  loading?: boolean;                  // optional
  error?: string | null;              // optional
  getShiftForUser?: (userId: string, date: Date, slot?: { start: string; end: string }) => EventItem | null | undefined;
};

export default function SwapShift({
  visible, onCancel, onSubmitted, date, slot,
  currentEvent,
  availableUsers, loading, error,
  getShiftForUser,
}: SwapShiftProps) {
  const { user, displayName, initials, designation } = useCurrentUser({ mock: false });
  const { refreshUnreadCount } = useNotificationContext();
  const navigation = useNavigation();

  const [message, setMessage] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  
  // Toast state
  const [warningToast, setWarningToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  
  const showWarningToast = (message: string) => { 
    setToastMessage(message); 
    setWarningToast(true); 
    setTimeout(() => setWarningToast(false), 1800); 
  };

  // candidates = all available users for swap (excluding current user)
  const candidates = React.useMemo(() => {
    const currentUserId = user?.id;
    return availableUsers.filter(u => u.id !== currentUserId);
  }, [availableUsers, user?.id]);

  // searching users (case insensitive)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(u => u.name.toLowerCase().includes(q));
  }, [candidates, query]);

  if (!visible) return null;

  const submit = async () => {
    if (!selected || submitting) return;
    
    // Check if the date is in the past
    if (isDateInPast(date)) {
      showWarningToast(getPastDateErrorMessage(date));
      return;
    }
    
    try {
      setSubmitting(true);
      const requesterId = user?.id ?? "u_mock";
      const payload = {
        requesterId,
        targetUserId: selected,
        shiftId: currentEvent?.id,
        date: dayKey(date),
        start: slot?.start ?? "08:00",
        end: slot?.end ?? "13:00",
        message: message?.trim() || undefined,
        createdAt: new Date().toISOString(),
      } as const;
      await createSwapRequest(payload as any);
      
      // Refresh notification count after successful submission
      refreshUnreadCount();
      
      onSubmitted?.({ message, targetUserId: selected });
    } catch (e) {
      onSubmitted?.({ message, targetUserId: selected });
    } finally {
      setSubmitting(false);
    }
  };

  const timeLabel = slot ? `${slot.start}-${slot.end}` : "08:00-13:00";

  // Helpers to format campus/room with Unallocated fallback
  const campusOf = (ev?: EventItem | null) => (ev?.campus ?? "Unallocated");
  const roomOf = (ev?: EventItem | null) => (ev?.room ?? "Unallocated");

  const myCampus = campusOf(currentEvent);
  const myRoom = roomOf(currentEvent);

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onCancel}><Text style={styles.hLeft}>Cancel</Text></Pressable>
        <Text style={styles.hTitle}>SWAP SHIFT</Text>
        <Pressable onPress={submit} disabled={!selected || submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={COLOR.brand} />
          ) : (
            <Text style={[styles.hRight, (!selected || submitting) && { opacity: 0.4 }]}>Submit</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ paddingBottom: sy(24) }}>
        {/* Message */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(12) }}>
          <Text style={styles.sectionLabel}>Message</Text>
          <View style={[styles.noteBox, { borderColor: COLOR.divider }]}>
            <TextInput
              placeholder="Note content"
              placeholderTextColor="#8FA7BF"
              value={message} onChangeText={setMessage}
              multiline style={{ color: COLOR.ink, fontSize: sx(16), minHeight: sy(70) }}
            />
          </View>
        </View>

        {/* Requested by */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(18) }}>
          <Text style={styles.sectionLabel}>Requested by</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Avatar initials={initials} />
            <View style={{ marginLeft: sx(10), flex: 1 }}>
              <Text style={{ color: COLOR.ink, fontSize: sx(14), fontWeight: "700" }}>{displayName} (You)</Text>
              <Text style={{ color: COLOR.ink, fontSize: sx(12), marginTop: sy(2) }}>
                {timeLabel}
              </Text>
              {!!designation && <Text style={styles.dim}>{designation}</Text>}
              {currentEvent ? (
                <>
                  <Text style={styles.dimStrong}>{myCampus}</Text>
                  <Text style={styles.dim}>{myRoom}</Text>
                </>
              ) : (
                <Text style={styles.dimStrong}>Unallocated</Text>
              )}
            </View>
          </View>
        </View>

        {/* Swap with (searching + available users) */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(18) }}>
          <Text style={styles.sectionLabel}>Swap with</Text>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={sx(18)} color={COLOR.label} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={COLOR.label}
              value={query}
              onChangeText={setQuery}
              style={{ marginLeft: sx(8), color: COLOR.ink, fontSize: sx(14), flex: 1 }}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Placeholders & Errors */}
          {loading && (
            <Text style={{ color: COLOR.label, fontSize: sx(12), marginTop: sy(10) }}>
              Loading available staff...
            </Text>
          )}
          {!!error && !loading && (
            <Text style={{ color: "#C00", fontSize: sx(12), marginTop: sy(10) }}>
              {error}
            </Text>
          )}

          {/* Candidate List */}
          {!loading && !error && (
            filtered.length === 0 ? (
              <Text style={{ color: COLOR.label, fontSize: sx(12), marginTop: sy(10) }}>
                No available staff found for this time slot.
              </Text>
            ) : (
              filtered.map((p) => {
                const active = selected === p.id;
                const resolver = getShiftForUser ?? getMockShiftForUser;
                const otherShift = resolver(p.id, date, slot);
                const isUnallocated = !otherShift;
                
                // Get shift information for display
                const shiftTime = otherShift ? `${otherShift.start}-${otherShift.end}` : null;
                const shiftCampus = otherShift?.campus || null;
                const shiftRoom = otherShift?.room || null;
                
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelected((cur) => (cur === p.id ? undefined : p.id))}
                    style={[styles.card, active && styles.cardActive]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", height: "100%" }}>
                      <Ionicons
                        name={active ? "radio-button-on" : "radio-button-off"}
                        size={sx(18)}
                        color={active ? COLOR.brand : COLOR.label}
                        style={{ marginRight: sx(10) }}
                      />
                      <Avatar initials={p.initials} />
                      <View style={{ marginLeft: sx(10), flex: 1, justifyContent: "center" }}>
                        <Text style={{ color: COLOR.ink, fontSize: sx(14), fontWeight: "600" }}>{p.name}</Text>
                        {isUnallocated ? (
                          <Text style={{ color: COLOR.brandAlt, fontSize: sx(12), marginTop: sy(2) }}>
                            Unallocated
                          </Text>
                        ) : (
                          <>
                            {shiftTime && (
                              <Text style={{ color: COLOR.brandAlt, fontSize: sx(12), marginTop: sy(2) }}>
                                {shiftTime}
                              </Text>
                            )}
                            {!!p.title && <Text style={styles.dim}>{p.title}</Text>}
                            {shiftCampus && <Text style={styles.dimStrong}>{shiftCampus}</Text>}
                            {shiftRoom && <Text style={styles.dim}>{shiftRoom}</Text>}
                          </>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )
          )}
        </View>
      </ScrollView>
      
      <WarningToast visible={warningToast} text={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 56, elevation: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: sx(16), paddingVertical: sy(12) },
  hLeft: { color: COLOR.ink, fontSize: sx(16) },
  hTitle: { color: "#000", fontSize: sx(16), fontWeight: "600" },
  hRight: { color: COLOR.brand, fontSize: sx(16), fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider },
  sectionLabel: { color: COLOR.ink, fontSize: sx(14), fontWeight: "700", marginBottom: sy(8) },
  noteBox: { borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(12), paddingHorizontal: sx(12), paddingVertical: sy(10) },
  dim: { color: COLOR.ink, fontSize: sx(12) },
  dimStrong: { color: COLOR.ink, fontSize: sx(12), fontWeight: "600" },
  searchBox: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(20), paddingVertical: sy(8), paddingHorizontal: sx(12), flexDirection: "row", alignItems: "center" },
  card: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(10), paddingHorizontal: sx(12), paddingVertical: sy(10), marginTop: sy(12), height: sy(92) },
  cardActive: { backgroundColor: "#EEF5FF", borderColor: COLOR.brand },
});
