import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

export type TeamRosterFilterValue = {
  shiftTypes: string[];
  designations: string[];
};

interface TeamRosterFilterProps {
  visible: boolean;
  value: TeamRosterFilterValue;
  onChange: (value: TeamRosterFilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export default function TeamRosterFilter({
  visible,
  value,
  onChange,
  onApply,
  onClear,
  onClose,
}: TeamRosterFilterProps) {
  // Available filter options
  const shiftTypeOptions = [
    { key: "AM", label: "AM Shifts" },
    { key: "PM", label: "PM Shifts" },
    { key: "AH", label: "After Hours" },
    { key: "ON_CALL", label: "On Call" },
  ];

  const designationOptions = [
    { key: "Surgeon", label: "Surgeon" },
    { key: "Anesthetist", label: "Anesthetist" },
    { key: "Nurse", label: "Nurse" },
    { key: "Fellow", label: "Fellow" },
    { key: "Cardiologist", label: "Cardiologist" },
    { key: "Resident", label: "Resident" },
    { key: "Consultant", label: "Consultant" },
  ];

  const toggleShiftType = (shiftType: string) => {
    const newShiftTypes = value.shiftTypes.includes(shiftType)
      ? value.shiftTypes.filter(st => st !== shiftType)
      : [...value.shiftTypes, shiftType];
    
    onChange({ ...value, shiftTypes: newShiftTypes });
  };

  const toggleDesignation = (designation: string) => {
    const newDesignations = value.designations.includes(designation)
      ? value.designations.filter(d => d !== designation)
      : [...value.designations, designation];
    
    onChange({ ...value, designations: newDesignations });
  };

  const hasActiveFilters = useMemo(() => {
    return value.shiftTypes.length > 0 || value.designations.length > 0;
  }, [value]);

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {children}
      </View>
    </View>
  );

  const FilterChip = ({ 
    label, 
    isSelected, 
    onPress 
  }: { 
    label: string; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => (
    <Pressable
      style={[
        styles.filterChip,
        isSelected && styles.filterChipSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextSelected
      ]}>
        {label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={sx(16)} color={COLOR.brand} />
      )}
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Team Roster</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={sx(24)} color={COLOR.ink} />
            </Pressable>
          </View>

          {/* Filter Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <FilterSection title="Shift Types">
              {shiftTypeOptions.map(option => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  isSelected={value.shiftTypes.includes(option.key)}
                  onPress={() => toggleShiftType(option.key)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Staff Designations">
              {designationOptions.map(option => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  isSelected={value.designations.includes(option.key)}
                  onPress={() => toggleDesignation(option.key)}
                />
              ))}
            </FilterSection>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.clearButton]}
              onPress={onClear}
              disabled={!hasActiveFilters}
            >
              <Text style={[
                styles.clearButtonText,
                !hasActiveFilters && styles.clearButtonTextDisabled
              ]}>
                Clear All
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.applyButton]}
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
              {hasActiveFilters && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {value.shiftTypes.length + value.designations.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: sx(20),
    borderTopRightRadius: sx(20),
    maxHeight: "80%",
    minHeight: "60%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  
  title: {
    fontSize: sx(18),
    fontWeight: "700",
    color: COLOR.ink,
  },
  
  closeButton: {
    width: sx(32),
    height: sy(32),
    borderRadius: sx(16),
    alignItems: "center",
    justifyContent: "center",
  },
  
  content: {
    flex: 1,
    paddingHorizontal: sx(20),
  },
  
  section: {
    marginVertical: sy(16),
  },
  
  sectionTitle: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
    marginBottom: sy(12),
  },
  
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: sx(8),
  },
  
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sx(12),
    paddingVertical: sy(8),
    borderRadius: sx(20),
    borderWidth: 1,
    borderColor: COLOR.divider,
    backgroundColor: "#fff",
    gap: sx(6),
  },
  
  filterChipSelected: {
    borderColor: COLOR.brand,
    backgroundColor: COLOR.brand + "10",
  },
  
  filterChipText: {
    fontSize: sx(14),
    color: COLOR.label,
    fontWeight: "500",
  },
  
  filterChipTextSelected: {
    color: COLOR.brand,
    fontWeight: "600",
  },
  
  footer: {
    flexDirection: "row",
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    gap: sx(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.divider,
  },
  
  button: {
    flex: 1,
    paddingVertical: sy(12),
    borderRadius: sx(12),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: sx(8),
  },
  
  clearButton: {
    borderWidth: 1,
    borderColor: COLOR.divider,
    backgroundColor: "#fff",
  },
  
  clearButtonText: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.label,
  },
  
  clearButtonTextDisabled: {
    color: COLOR.label + "60",
  },
  
  applyButton: {
    backgroundColor: COLOR.brand,
  },
  
  applyButtonText: {
    fontSize: sx(16),
    fontWeight: "600",
    color: "#fff",
  },
  
  badge: {
    backgroundColor: "#fff",
    borderRadius: sx(10),
    minWidth: sx(20),
    height: sy(20),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sx(6),
  },
  
  badgeText: {
    fontSize: sx(12),
    fontWeight: "700",
    color: COLOR.brand,
  },
});
