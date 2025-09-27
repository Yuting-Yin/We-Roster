// src/components/roster/Filter.tsx
import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

export type ShiftType = "AM" | "PM" | "NIGHT";
export type SortBy = "time" | "location" | "role";

export type RosterFilterValue = {
  locations: string[];     // Allow multiple selections
  roles: string[];         // Allow multiple selections
  shiftTypes: ShiftType[]; // Allow multiple selections
  date?: string;           // YYYY-MM-DD (This is just a placeholder, the actual value is assigned by the date picker)
  sortBy: SortBy;          // single selection
};

type Props = {
  value: RosterFilterValue;
  onChange: (next: RosterFilterValue) => void;
  // Optional: Provide alternatives (backend/local)
  locationOptions?: string[];
  roleOptions?: string[];
  style?: any;
};

const defLocations = ["ED", "Ward A", "Ward B", "ICU"];
const defRoles = ["RN", "EN", "ANUM", "NUM", "Intern", "HMO"];

function toggleList(list: string[], item: string) {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}
function toggleShift(list: ShiftType[], item: ShiftType) {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

const Chip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    android_ripple={{ color: "#ddd" }}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

const Filter: React.FC<Props> = memo(({ value, onChange, locationOptions, roleOptions, style }) => {
  const locs = locationOptions ?? defLocations;
  const roles = roleOptions ?? defRoles;

  return (
    <View style={[styles.wrap, style]}>
      {/* top tool bar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Ionicons name="funnel-outline" size={sx(18)} color={COLOR.label ?? "#8FA7BF"} />
          <Text style={styles.toolbarTitle}>Filters</Text>
        </View>

        <View style={styles.toolbarRight}>
          <Pressable
            onPress={() =>
              onChange({ locations: [], roles: [], shiftTypes: [], date: undefined, sortBy: "time" })
            }
            hitSlop={10}
          >
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {/* Location */}
        <Group title="Location">
          <View style={styles.rowChips}>
            {locs.map(loc => (
              <Chip
                key={loc}
                label={loc}
                selected={value.locations.includes(loc)}
                onPress={() => onChange({ ...value, locations: toggleList(value.locations, loc) })}
              />
            ))}
          </View>
        </Group>

        {/* Role */}
        <Group title="Role">
          <View style={styles.rowChips}>
            {roles.map(r => (
              <Chip
                key={r}
                label={r}
                selected={value.roles.includes(r)}
                onPress={() => onChange({ ...value, roles: toggleList(value.roles, r) })}
              />
            ))}
          </View>
        </Group>

        {/* Shift Type */}
        <Group title="Shift">
          <View style={styles.rowChips}>
            {(["AM", "PM", "NIGHT"] as ShiftType[]).map(s => (
              <Chip
                key={s}
                label={s}
                selected={value.shiftTypes.includes(s)}
                onPress={() => onChange({ ...value, shiftTypes: toggleShift(value.shiftTypes, s) })}
              />
            ))}
          </View>
        </Group>

        {/* Date (Placeholder trigger button) */}
        <Group title="Date">
          <Pressable
            onPress={() => {
              // Leave an interface here, connect the date picker,
              // and update the selection result to value.date
              // for example: onChange({ ...value, date: "2025-09-16" })
            }}
            style={styles.dateBtn}
            android_ripple={{ color: "#ddd" }}
          >
            <Ionicons name="calendar-outline" size={sx(16)} color={COLOR.ink} />
            <Text style={styles.dateText}>{value.date ?? "Pick a date"}</Text>
          </Pressable>
        </Group>

        {/* Sort */}
        <Group title="Sort">
          <View style={styles.rowChips}>
            {(["time", "location", "role"] as SortBy[]).map(k => (
              <Chip
                key={k}
                label={k}
                selected={value.sortBy === k}
                onPress={() => onChange({ ...value, sortBy: k })}
              />
            ))}
          </View>
        </Group>
      </ScrollView>
    </View>
  );
});

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    paddingVertical: sy(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider ?? "#E6E6E6",
  },
  toolbar: {
    paddingHorizontal: sx(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: sy(6),
  },
  toolbarLeft: { flexDirection: "row", alignItems: "center" },
  toolbarRight: { flexDirection: "row", alignItems: "center" },
  toolbarTitle: {
    marginLeft: sx(6),
    color: COLOR.label ?? "#8FA7BF",
    fontSize: sx(12),
  },
  clear: {
    color: COLOR.brand ?? "#0078D4",
    fontSize: sx(12),
  },
  row: { paddingHorizontal: sx(8), paddingBottom: sy(2) },
  group: { marginRight: sx(16) },
  groupTitle: {
    color: COLOR.label ?? "#8FA7BF",
    fontSize: sx(11),
    marginBottom: sy(6),
  },
  rowChips: { flexDirection: "row", flexWrap: "nowrap" },
  chip: {
    paddingHorizontal: sx(10),
    paddingVertical: sy(6),
    borderWidth: 1,
    borderColor: COLOR.divider ?? "#E6E6E6",
    borderRadius: sx(999),
    marginRight: sx(8),
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: (COLOR.brand ?? "#0078D4") + "15", // light background color
    borderColor: COLOR.brand ?? "#0078D4",
  },
  chipText: { color: COLOR.ink ?? "#212121", fontSize: sx(12) },
  chipTextSelected: { color: COLOR.brand ?? "#0078D4", fontWeight: "600" },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(6),
    paddingHorizontal: sx(12),
    paddingVertical: sy(8),
    borderWidth: 1,
    borderColor: COLOR.divider ?? "#E6E6E6",
    borderRadius: sx(10),
    backgroundColor: "#fff",
  },
  dateText: { color: COLOR.ink ?? "#212121", fontSize: sx(12) },
});

export default Filter;
