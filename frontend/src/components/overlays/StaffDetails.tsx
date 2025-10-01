// src/components/overlays/StaffDetails.tsx
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform, Linking, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { ShiftType } from "@/types/roster";
import { useRosterPeriod } from "@/hooks/useRosterPeriod";
import { useOverlayContext } from "@/contexts/OverlayContext";

export type StaffMember = {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone?: string;
  designation?: string;
  accreditation?: string;
};

type Props = {
  visible: boolean;
  staff?: StaffMember;
  shiftMap?: Record<string, ShiftType | ShiftType[]>; // YYYY-MM-DD -> shift type(s)
  onClose: () => void;
  returnToTab?: string; // Tab to return to when closing
};

type TabType = "about" | "schedule";

const COL_W_PCT = 100 / 7; // 7 columns (Mon-Sun)
const DOT_SIZE = sx(4);

/* =================== Helpers =================== */
const dayKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

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
      title: new Intl.DateTimeFormat("en-US", { month: "long" }).format(first),
      first,
      firstWeekdayMon0,
      days,
    };
  });
}

/** Get shift type(s) for a date */
function getShiftTypeForDate(d: Date, shiftMap?: Record<string, ShiftType | ShiftType[]>): ShiftType | ShiftType[] | undefined {
  const key = dayKey(d);
  return shiftMap?.[key];
}

/**
 * Combine multiple shift types into a single visual representation
 */
function visualOf(types: ShiftType | ShiftType[] | undefined) {
  const typeArray = types ? (Array.isArray(types) ? types : [types]) : [];
  
  if (typeArray.length === 0) {
    return { dots: ["hollow", "hollow"] as const, labels: [] };
  }
  
  const hasAH = typeArray.includes("AH");
  const hasPM = typeArray.includes("PM");
  const hasAM = typeArray.includes("AM");
  const hasOnCall = typeArray.includes("ON_CALL");
  
  const leftDot = (hasAM || hasAH) ? "filled" : "hollow";
  const rightDot = hasPM ? "filled" : "hollow";
  
  const labels: string[] = [];
  if (hasAH) labels.push("AH");
  if (hasOnCall) labels.push("On Call");
  
  return { 
    dots: [leftDot, rightDot] as const, 
    labels 
  };
}

const TwoDots = ({ left, right }: { left: "filled" | "hollow"; right: "filled" | "hollow" }) => (
  <View style={{ height: sx(6), flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
    <View style={left === "filled" ? dotStyles.filled : dotStyles.hollow} />
    <View style={{ width: sx(3) }} />
    <View style={right === "filled" ? dotStyles.filled : dotStyles.hollow} />
  </View>
);

const dotStyles = StyleSheet.create({
  filled: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: "#000" },
  hollow: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 1.5, borderColor: "#BDBDBD", backgroundColor: "transparent" },
});

export default function StaffDetails({ visible, staff, shiftMap, onClose, returnToTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const today = useMemo(() => new Date(), []);
  const { months: rosterMonths } = useRosterPeriod(today);
  const navigation = useNavigation<any>();
  const { teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  
  const months = useMemo(() => {
    if (rosterMonths.length > 0) {
      return rosterMonths;
    }
    return buildMonths(today, 2);
  }, [rosterMonths, today]);

  const todayKey = dayKey(today);

  const handlePhonePress = () => {
    if (staff?.phone) {
      Linking.openURL(`tel:${staff.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (staff?.email) {
      Linking.openURL(`mailto:${staff.email}`);
    }
  };

  const handleClose = () => {
    onClose();
    
    // If we have a returnToTab from the navigation request, navigate back to it
    const tabToReturnTo = returnToTab || teamMemberNavRequest?.returnToTab;
    if (tabToReturnTo) {
      navigation.navigate(tabToReturnTo);
    }
    
    // Clear the navigation request after handling the close
    clearTeamMemberNavRequest();
  };

  if (!staff) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header with Back button */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={sx(24)} color={COLOR.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: sx(24) }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{staff.initials}</Text>
          </View>
          <Text style={styles.staffName}>{staff.name}</Text>
          {staff.designation && (
            <Text style={styles.staffDesignation}>{staff.designation}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionBtn} onPress={handlePhonePress}>
              <Ionicons name="chatbubble-outline" size={sx(24)} color={COLOR.ink} />
              <Text style={styles.actionBtnLabel}>Message</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={sx(24)} color={COLOR.ink} />
              <Text style={styles.actionBtnLabel}>Call</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={sx(24)} color={COLOR.ink} />
              <Text style={styles.actionBtnLabel}>Email</Text>
            </Pressable>
          </View>

          {/* Tabs - Segmented Control Style */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsWrapper}>
              <Pressable
                style={[styles.tab, activeTab === "about" && styles.tabActive]}
                onPress={() => setActiveTab("about")}
              >
                <Text style={[styles.tabText, activeTab === "about" && styles.tabTextActive]}>
                  About
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "schedule" && styles.tabActive]}
                onPress={() => setActiveTab("schedule")}
              >
                <Text style={[styles.tabText, activeTab === "schedule" && styles.tabTextActive]}>
                  Schedule
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tab Content */}
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {activeTab === "about" ? (
            <View style={styles.aboutContent}>
              {/* Phone Number */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call-outline" size={sx(20)} color={COLOR.brand} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{staff.phone || "Not provided"}</Text>
                </View>
                <Pressable onPress={handlePhonePress} hitSlop={8}>
                  <Ionicons name="copy-outline" size={sx(20)} color={COLOR.brand} />
                </Pressable>
              </View>

              <View style={styles.divider} />

              {/* Email Address */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail-outline" size={sx(20)} color={COLOR.brand} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{staff.email}</Text>
                </View>
                <Pressable onPress={handleEmailPress} hitSlop={8}>
                  <Ionicons name="copy-outline" size={sx(20)} color={COLOR.brand} />
                </Pressable>
              </View>

              <View style={styles.divider} />

              {/* Accreditation */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="ribbon-outline" size={sx(20)} color={COLOR.brand} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Accreditation</Text>
                  <Text style={styles.infoValue}>{staff.accreditation || "Accreditation"}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.scheduleWrapper}>
              <View style={styles.scheduleContent}>
                {/* Day labels */}
                <View style={styles.dayLabelsContainer}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                    <View key={d} style={styles.dayLabelContainer}>
                      <Text style={[styles.dayLabel, i >= 5 && styles.weekend]}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Months */}
                {months.map((m, idx) => (
                  <View key={`${m.title}-${idx}`} style={styles.monthBlock}>
                    {/* Month Title */}
                    <View style={styles.monthTitleRow}>
                      <Text style={styles.monthTitleText}>{m.title}</Text>
                    </View>

                    {/* Grid */}
                    <View style={styles.gridWrap}>
                      {/* Spacer cells for alignment */}
                      {Array.from({ length: m.firstWeekdayMon0 }).map((_, i) => (
                        <View key={`spacer-${i}`} style={styles.gridCellSpacer} />
                      ))}

                      {/* Date cells */}
                      {m.days.map((d, i) => {
                        const isToday = dayKey(d) === todayKey;
                        const t = getShiftTypeForDate(d, shiftMap);
                        const v = visualOf(t);
                        return (
                          <View key={`${dayKey(d)}-${i}`} style={styles.gridCell}>
                            <View
                              style={[
                                styles.gridCellContent,
                                isToday && { borderWidth: 1, borderColor: COLOR.brand },
                              ]}
                            >
                              {v.labels.length > 0 && (
                                <View style={styles.labelsContainer}>
                                  {v.labels.map((label, idx) => (
                                    <Text key={idx} style={styles.shiftLabel}>{label}</Text>
                                  ))}
                                </View>
                              )}
                              <Text style={[styles.gridText, isToday && styles.gridTextToday]}>
                                {d.getDate()}
                              </Text>
                              <TwoDots left={v.dots[0]} right={v.dots[1]} />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EEF6",
  },

  header: {
    height: sy(56),
    paddingHorizontal: sx(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8EEF6",
  },
  headerTitle: { 
    color: COLOR.ink, 
    fontWeight: "600", 
    fontSize: sx(18),
    textAlign: "center",
    flex: 1,
  },
  backBtn: { 
    width: sx(24),
    alignItems: "flex-start",
  },

  profileSection: {
    backgroundColor: "#E8EEF6",
    alignItems: "center",
    paddingBottom: sy(24),
  },
  avatarLarge: {
    width: sx(96),
    height: sx(96),
    borderRadius: sx(48),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: sy(16),
  },
  avatarLargeText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: sx(36),
  },
  staffName: { 
    color: COLOR.ink, 
    fontWeight: "600", 
    fontSize: sx(20),
    marginBottom: sy(4),
  },
  staffDesignation: { 
    color: COLOR.label, 
    fontSize: sx(14),
    marginBottom: sy(20),
  },

  actionButtons: {
    flexDirection: "row",
    gap: sx(81),
    marginBottom: sy(24),
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: sy(6),
  },
  actionBtnLabel: {
    color: COLOR.ink,
    fontSize: sx(13),
  },

  tabsContainer: {
    paddingHorizontal: sx(48),
    width: "100%",
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#D4DEE8",
    borderRadius: sx(20),
    padding: sx(4),
  },
  tab: {
    flex: 1,
    paddingVertical: sy(8),
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: sx(16),
  },
  tabActive: {
    backgroundColor: "#FFF",
  },
  tabText: {
    color: COLOR.ink,
    fontSize: sx(14),
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLOR.brand,
    fontWeight: "600",
  },

  contentContainer: {
    flexGrow: 1,
    backgroundColor: "#E8EEF6",
    paddingTop: sy(20),
    paddingBottom: sy(20),
  },

  // About Tab Content
  aboutContent: {
    backgroundColor: "#FFF",
    marginHorizontal: sx(16),
    borderRadius: sx(12),
    padding: sx(16),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: sy(12),
  },
  infoIconContainer: {
    width: sx(40),
    height: sx(40),
    borderRadius: sx(20),
    backgroundColor: COLOR.brand + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(12),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: COLOR.brand,
    fontSize: sx(12),
    fontWeight: "600",
    marginBottom: sy(2),
  },
  infoValue: {
    color: COLOR.ink,
    fontSize: sx(14),
  },
  divider: { 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: COLOR.divider, 
    marginVertical: sy(4),
  },

  // Schedule Tab Content
  scheduleWrapper: {
    marginHorizontal: sx(16),
  },
  scheduleContent: {
    backgroundColor: "#FFF",
    borderRadius: sx(12),
    padding: sx(16),
  },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: sy(12),
    paddingHorizontal: sx(2),
  },
  dayLabelContainer: { 
    width: `${COL_W_PCT}%`, 
    alignItems: "center",
  },
  dayLabel: { 
    color: COLOR.ink, 
    fontSize: sx(12),
    fontWeight: "500",
  },
  weekend: { color: COLOR.brand },

  monthBlock: { 
    marginBottom: sy(20),
  },
  monthTitleRow: {
    marginBottom: sy(12),
    paddingHorizontal: sx(2),
  },
  monthTitleText: {
    fontSize: sx(16),
    fontWeight: "700",
    color: COLOR.ink,
  },

  gridWrap: { 
    flexDirection: "row", 
    flexWrap: "wrap",
  },
  gridCellSpacer: {
    width: `${COL_W_PCT}%`,
    height: sx(52),
  },
  gridCell: {
    width: `${COL_W_PCT}%`,
    height: sx(52),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: sy(2),
  },
  gridCellContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: sx(2),
    width: sx(40),
    height: sx(48),
    borderRadius: sx(8),
    position: "relative",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
  },
  gridText: { 
    fontSize: sx(14), 
    color: COLOR.ink,
  },
  gridTextToday: {
    color: COLOR.brand,
    fontWeight: "700",
  },
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
});

