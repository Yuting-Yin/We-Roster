// src/components/overlays/StaffDetails.tsx
import React, { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform, Linking, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { ShiftType } from "@/types/roster";
import { useOverlayContext } from "@/contexts/OverlayContext";
import ExpandedCalendar from "@/components/calendar/ExpandedCalendar";
import { useStaffLeaves } from "@/hooks/useStaffLeaves";

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

export default function StaffDetails({ visible, staff, shiftMap, onClose, returnToTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [date, setDate] = useState(new Date());
  const navigation = useNavigation<any>();
  const { teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  const { leaveMap } = useStaffLeaves(staff?.id || 0);

  // Reset tab to "about" when staff changes
  useEffect(() => {
    if (staff) {
      setActiveTab("about");
    }
  }, [staff?.id]);

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
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={false}
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
              <ExpandedCalendar
                value={date}
                onChange={setDate}
                shiftMap={shiftMap}
                leaveMap={leaveMap}
              />
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
    backgroundColor: "rgba(232, 238, 246, 0.98)",
  },

  header: {
    height: sy(56),
    paddingHorizontal: sx(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(232, 238, 246, 0.98)",
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
    backgroundColor: "rgba(232, 238, 246, 0.98)",
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
    backgroundColor: "rgba(232, 238, 246, 0.98)",
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
});

