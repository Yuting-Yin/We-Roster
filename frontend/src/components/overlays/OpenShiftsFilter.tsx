// src/components/overlays/OpenShiftsFilter.tsx
import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import OpenShiftDetails, { OpenShiftDetail, Coworker } from "@/components/overlays/OpenShiftDetails";
import SuccessToast from "@/components/overlays/SuccessToast";

export type Session = "AM" | "PM" | "AH" | "ON_CALL";
export type FilterValue = {
  sessions: Session[];
  locations: string[];
  designations: string[];
};

type Props = {
  visible: boolean;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  locationOptions?: string[];
  designationOptions?: string[];
};

// Default empty arrays - actual data comes from props
const defLocations: string[] = [];
const defDesignations: string[] = [];

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


export default memo(function OpenShiftsFilter({
  visible, value, onChange, onApply, onClear, onClose, locationOptions, designationOptions
}: Props) {

  const toggle = <T extends string>(arr: T[], k: T) => (arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.mask}>
        <View style={styles.panel}>
          {/* 顶部栏 */}
          <View style={styles.topbar}>
            <Pressable onPress={onClear} hitSlop={10}><Text style={styles.clear}>Clear all</Text></Pressable>
            <Text style={styles.title}>FILTER</Text>
            <Pressable onPress={onApply} hitSlop={10}><Text style={styles.apply}>Apply</Text></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Session */}
            <Section title="Session" icon={<Ionicons name="time-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                {(["AM", "PM", "AH", "ON_CALL"] as const).map(s => (
                  <Chip key={s}
                    label={s === "ON_CALL" ? "On Call" : s}
                    selected={value.sessions.includes(s)}
                    onPress={() => onChange({ ...value, sessions: toggle(value.sessions, s) })}
                  />
                ))}
              </View>
            </Section>

            {/* Location */}
            <Section title="Location" icon={<Ionicons name="business-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                {(locationOptions ?? defLocations).map(loc => (
                  <Chip key={loc}
                    label={loc}
                    selected={value.locations.includes(loc)}
                    onPress={() => onChange({ ...value, locations: toggle(value.locations, loc) })}
                  />
                ))}
              </View>
            </Section>

            {/* Designation */}
            <Section title="Designation" icon={<Ionicons name="person-outline" size={sx(16)} color={COLOR.label} />}>
              <View style={styles.row}>
                {(designationOptions ?? defDesignations).map(d => (
                  <Chip key={d}
                    label={d}
                    selected={value.designations.includes(d)}
                    onPress={() => onChange({ ...value, designations: toggle(value.designations, d) })}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>
        </View>
      </View>
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
