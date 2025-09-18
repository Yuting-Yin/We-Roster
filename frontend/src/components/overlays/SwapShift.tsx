import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import Avatar from "@/components/common/Avatar";
import { fmt } from "@/lib/date";

type User = { id: string; name: string; initials: string };

type SwapShiftProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: (payload?: { message: string; targetUserId?: string }) => void;
  date: Date;
  slot?: { start: string; end: string };
  availableUsers: User[];
  loading?: boolean;                  // optional
  error?: string | null;              // optional
};

export default function SwapShift({
  visible, onCancel, onSubmitted, date, slot,
  availableUsers, loading, error,
}: SwapShiftProps) {
  // ---- hooks (Must be at the top level & fixed in order) ----
  const [message, setMessage] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string | undefined>();

  // candidates = all avaliable users for swap
  const candidates = availableUsers;

  // searching users (case insensitive)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(u => u.name.toLowerCase().includes(q));
  }, [candidates, query]);

  if (!visible) return null;

  const submit = () => onSubmitted({ message, targetUserId: selected });

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onCancel}><Text style={styles.hLeft}>Cancel</Text></Pressable>
        <Text style={styles.hTitle}>SWAP SHIFT</Text>
        <Pressable onPress={submit} disabled={!selected}>
          <Text style={[styles.hRight, !selected && { opacity: 0.4 }]}>Submit</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ paddingBottom: sy(24) }}>
        {/* Message */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(12) }}>
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
        <View style={{ marginHorizontal: sx(16), marginTop: sy(16) }}>
          <Text style={styles.secTitle}>Requested by</Text>
          <View style={{ flexDirection: "row" }}>
            <Avatar initials="TV" />
            <View style={{ marginLeft: sx(10), flex: 1 }}>
              <Text style={{ color: COLOR.ink, fontSize: sx(14), fontWeight: "700" }}>Thu Vo (You)</Text>
              <Text style={{ color: COLOR.ink, fontSize: sx(12), marginTop: sy(2) }}>
                {fmt(date, { weekday: "short" })}, {fmt(date, { day: "2-digit", month: "short", year: "numeric" })}{"  "}
                {slot ? `${slot.start}-${slot.end}` : "08:00-13:00"}
              </Text>
              <Text style={styles.dim}>Department/Campus</Text>
              <Text style={styles.dim}>Location</Text>
            </View>
          </View>
        </View>

        {/* Swap with (searching + avaliable users) */}
        <View style={{ marginHorizontal: sx(16), marginTop: sy(16) }}>
          <Text style={styles.secTitle}>Swap with</Text>

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
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelected(p.id)}
                    style={[styles.card, active && { backgroundColor: "#EEF5FF", borderColor: COLOR.brand }]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons
                        name={active ? "radio-button-on" : "radio-button-off"}
                        size={sx(18)}
                        color={active ? COLOR.brand : COLOR.label}
                      />
                      <Avatar initials={p.initials} />
                      <View style={{ marginLeft: sx(10) }}>
                        <Text style={{ color: COLOR.ink, fontSize: sx(14), fontWeight: "600" }}>{p.name}</Text>
                        <Text style={{ color: COLOR.brandAlt, fontSize: sx(12) }}>
                          {fmt(date, { weekday: "short" })}, {fmt(date, { day: "2-digit", month: "short", year: "numeric" })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )
          )}
        </View>
      </ScrollView>
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
  noteBox: { borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(16), paddingHorizontal: sx(12), paddingVertical: sy(8) },
  secTitle: { color: COLOR.ink, fontSize: sx(14), fontWeight: "700", marginBottom: sy(8) },
  dim: { color: COLOR.ink, fontSize: sx(12) },
  searchBox: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(20), paddingVertical: sy(8), paddingHorizontal: sx(12), flexDirection: "row", alignItems: "center" },
  card: { borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(10), padding: sx(12), marginTop: sy(12) },
});
