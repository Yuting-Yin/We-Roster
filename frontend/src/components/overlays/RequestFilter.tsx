import React, { memo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestFilterValue } from "@/types/request";

interface Props {
  visible: boolean;
  value: RequestFilterValue;
  onChange: (value: RequestFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

const toggle = <T extends string>(arr: T[], k: T) => (arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);

const Chip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSel]} android_ripple={{ color: "#eaeaea" }}>
    <Text style={[styles.chipText, selected && styles.chipTextSel]}>{label}</Text>
  </Pressable>
);

const Section: React.FC<{ icon?: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
    <View style={styles.divider} />
  </View>
);

const RequestFilter: React.FC<Props> = memo(({ visible, value, onChange, onApply, onClear, onClose }) => {
  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Pressable style={styles.mask} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          {/* Top bar */}
          <View style={styles.topbar}>
            <Pressable onPress={onClear} hitSlop={10}><Text style={styles.clear}>Clear all</Text></Pressable>
            <Text style={styles.title}>FILTER</Text>
            <Pressable onPress={onApply} hitSlop={10}><Text style={styles.apply}>Apply</Text></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Leave Request Types */}
            <Section title="Leave Request" icon={<Ionicons name="calendar-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                {["Shift Leave", "Day Leave", "Week Leave", "Month Leave", "Annual Leave"].map(leaveType => (
                  <Chip
                    key={leaveType}
                    label={leaveType}
                    selected={value.leaveTypes.includes(leaveType)}
                    onPress={() => onChange({ ...value, leaveTypes: toggle(value.leaveTypes, leaveType) })}
                  />
                ))}
              </View>
            </Section>

            {/* Swap Request Types */}
            <Section title="Swap Request" icon={<Ionicons name="swap-horizontal-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                {["My Swap", "Incoming Swap"].map(swapType => (
                  <Chip
                    key={swapType}
                    label={swapType}
                    selected={value.swapTypes.includes(swapType)}
                    onPress={() => onChange({ ...value, swapTypes: toggle(value.swapTypes, swapType) })}
                  />
                ))}
              </View>
            </Section>

            {/* Open Shift Request */}
            <Section title="Open Shift Request" icon={<Ionicons name="briefcase-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                <Chip
                  label="Open Shift Request"
                  selected={value.openShiftRequest}
                  onPress={() => onChange({ ...value, openShiftRequest: !value.openShiftRequest })}
                />
              </View>
            </Section>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  mask: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0005", justifyContent: "flex-end" },
  panel: { backgroundColor: "#fff", borderTopLeftRadius: sx(16), borderTopRightRadius: sx(16), maxHeight: "80%" },
  topbar: {
    height: sy(48), paddingHorizontal: sx(16), flexDirection: "row",
    alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider
  },
  title: { fontSize: sx(14), color: COLOR.ink, fontWeight: "700", letterSpacing: 1 },
  clear: { color: COLOR.ink, opacity: 0.6 },
  apply: { color: COLOR.brand, fontWeight: "600" },
  body: { paddingVertical: sy(8) },
  section: { paddingHorizontal: sx(16), paddingVertical: sy(8) },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: sx(6), marginBottom: sy(8) },
  sectionTitle: { color: COLOR.ink, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: sx(8) },
  chip: {
    paddingHorizontal: sx(12), paddingVertical: sy(8),
    borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(999), backgroundColor: "#fff"
  },
  chipSel: { borderColor: COLOR.brand, backgroundColor: (COLOR.brand ?? "#0078D4") + "15" },
  chipText: { color: COLOR.ink, fontSize: sx(12) },
  chipTextSel: { color: COLOR.brand, fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider, marginTop: sy(12) }
});

export default RequestFilter;
