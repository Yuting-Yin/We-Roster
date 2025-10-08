import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { isDateStringInPast, getPastDateErrorMessage } from "@/lib/dateValidation";
import WarningToast from "@/components/overlays/WarningToast";

export type Coworker = { id: string; name: string; initials: string };

export type OpenShiftDetail = {
  id: string;
  date: string;              // YYYY-MM-DD
  start: string;             // "08:00"
  end: string;               // "13:00"
  session: "AM" | "PM" | "AH" | "ON_CALL";
  location: string;          // e.g. PMCC
  hospitalName?: string;     // hospital name
  address?: string;          // detial adress
  designation: string;       // role
  theatre?: string;          // e.g. "Theatre 1"
  pay?: number;              // optional
  urgent?: boolean;          // urgent flag
  status?: string;           // AVAILABLE, READY_TO_RUN, etc.
  canApply?: boolean;        // whether user can apply
  applicationStatus?: string; // PENDING, APPROVED, etc.
  assignedStaff?: any[];     // assigned staff list
  requirements?: any[];      // designation requirements
};

type Props = {
  visible: boolean;
  shift?: OpenShiftDetail;
  coworkers?: Coworker[];
  onClose: () => void;
  onApply: (shift: OpenShiftDetail) => void;
  onCoworkerPress?: (coworker: Coworker) => void;
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.pill}><Text style={styles.pillText}>{children}</Text></View>
);

export default memo(function OpenShiftDetails({ visible, shift, coworkers = [], onClose, onApply, onCoworkerPress }: Props) {
  const [warningToast, setWarningToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  
  const showWarningToast = (message: string) => { 
    setToastMessage(message); 
    setWarningToast(true); 
    setTimeout(() => setWarningToast(false), 1800); 
  };

  const handleApply = () => {
    if (!shift) return;
    
    // Check if the date is in the past
    if (isDateStringInPast(shift.date)) {
      const errorMessage = getPastDateErrorMessage(shift.date);
      console.log('🔍 OpenShiftDetails - Past date detected:', shift.date, 'Error message:', errorMessage);
      showWarningToast(errorMessage);
      return;
    }
    
    onApply(shift);
  };
  const durationHrs = useMemo(() => {
    if (!shift) return 0;
    const [sh, sm] = shift.start.split(":").map(Number);
    const [eh, em] = shift.end.split(":").map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  }, [shift]);

  if (!shift) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"                      // no animation
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "fullScreen" : "overFullScreen"}
    >
      <View style={styles.mask}>
        {/* Full screen width, bottom drawer, no shadow, only top rounded corners */}
        <View style={styles.panel}>
          {/* Top Title & Close */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shift Details</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={sx(20)} color={COLOR.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: sx(16) }}>
            {/* date + time + duration */}
            <View style={styles.rowPills}>
              <Pill>
                <Ionicons name="calendar-outline" size={sx(14)} color={COLOR.ink} />
                <Text style={styles.pillTextInner}>  {shift.date}</Text>
              </Pill>
              <Pill>{shift.start} - {shift.end}</Pill>
              <Pill>{durationHrs} hours</Pill>
            </View>

            {/* location / address / designation / Theatre */}
            <View style={styles.block}>
              <View style={styles.line}>
                <Ionicons name="business-outline" size={sx(16)} color={COLOR.label} />
                <Text style={styles.mainText}>  {shift.hospitalName || shift.location}</Text>
              </View>
              {!!shift.address && <Text style={styles.addrText}>{shift.address}</Text>}

              <View style={styles.line}>
                <Ionicons name="medkit-outline" size={sx(16)} color={COLOR.label} />
                <Text style={styles.subText}>  Designation Requirements</Text>
              </View>
              {shift.requirements && shift.requirements.length > 0 ? (
                shift.requirements.map((req, idx) => (
                  <View key={idx} style={[styles.line, { marginLeft: sx(22), marginTop: sy(4) }]}>
                    <Text style={styles.requirementText}>
                      • {req.designationName}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={[styles.line, { marginLeft: sx(22), marginTop: sy(4) }]}>
                  <Text style={styles.requirementText}>• Any designation</Text>
                </View>
              )}
              {!!shift.theatre && (
                <View style={styles.line}>
                  <Ionicons name="key-outline" size={sx(16)} color={COLOR.label} />
                  <Text style={styles.subText}>  {shift.theatre}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Working with */}
            <View style={styles.block}>
              <View style={[styles.line, { marginBottom: sy(8) }]}>
                <Ionicons name="people-outline" size={sx(16)} color={COLOR.label} />
                <Text style={styles.mainText}>  Working with</Text>
              </View>
              {coworkers.length === 0 ? (
                <Text style={styles.noStaffText}>Currently no staff allocated</Text>
              ) : (
                coworkers.map(cw => (
                  <Pressable 
                    key={cw.id} 
                    style={styles.cwRow}
                    onPress={() => onCoworkerPress?.(cw)}
                    disabled={!onCoworkerPress}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{cw.initials}</Text>
                    </View>
                    <Text style={styles.cwName}>{cw.name}</Text>
                    {onCoworkerPress && (
                      <Ionicons name="chevron-forward" size={sx(16)} color={COLOR.label} style={{ marginLeft: "auto" }} />
                    )}
                  </Pressable>
                ))
              )}
            </View>

            <View style={styles.divider} />

            {/* Pay card */}
            <View style={styles.payCard}>
              <Text style={styles.payTitle}>Total pay for this shift</Text>
              <Text style={styles.payAmount}>
                {typeof shift.pay === "number" ? `$${shift.pay}` : "-"}
              </Text>
              <Text style={styles.payNote}>Explain details here</Text>
            </View>
          </ScrollView>

          {/* Apply */}
          <Pressable
            style={styles.applyBtn}
            onPress={handleApply}
            android_ripple={{ color: "#e6f0fb", borderless: true }}
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </View>
      
      <WarningToast visible={warningToast} message={toastMessage} />
    </Modal>
  );
});

const styles = StyleSheet.create({
  // Translucent mask: can be retained, not considered a "shadow"
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0006",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },

  panel: {
    width: "100%",
    maxHeight: "86%",
    backgroundColor: "#fff",
    borderTopLeftRadius: sx(16),
    borderTopRightRadius: sx(16),
    overflow: "hidden",
  },

  header: {
    height: sy(48),
    paddingHorizontal: sx(16),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  headerTitle: { color: COLOR.ink, fontWeight: "700", fontSize: sx(14) },
  closeBtn: { padding: sx(6) },

  rowPills: { flexDirection: "row", flexWrap: "wrap", gap: sx(8), marginBottom: sy(12) },
  pill: {
    paddingHorizontal: sx(10), paddingVertical: sy(6),
    backgroundColor: (COLOR.brand ?? "#0078D4") + "12",
    borderRadius: sx(999), borderWidth: 1, borderColor: COLOR.divider,
  },
  pillText: { color: COLOR.ink, fontSize: sx(12) },
  pillTextInner: { color: COLOR.ink, fontSize: sx(12) },

  block: { marginBottom: sy(12) },
  line: { flexDirection: "row", alignItems: "center", marginBottom: sy(6) },
  mainText: { color: COLOR.ink, fontWeight: "600" },
  subText: { color: COLOR.ink },
  addrText: { color: COLOR.brand, marginLeft: sx(22), marginBottom: sy(6) },
  requirementText: { color: COLOR.ink, fontSize: sx(13) },
  requirementCount: { color: COLOR.label, fontSize: sx(12), fontStyle: "italic" },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider, marginVertical: sy(8) },

  cwRow: { flexDirection: "row", alignItems: "center", marginBottom: sy(6) },
  avatar: {
    width: sx(24), height: sy(24), borderRadius: sx(12),
    backgroundColor: (COLOR.brand ?? "#0078D4") + "25",
    alignItems: "center", justifyContent: "center", marginRight: sx(8)
  },
  avatarText: { color: COLOR.brand, fontWeight: "700", fontSize: sx(10) },
  cwName: { color: COLOR.ink },
  noStaffText: { color: COLOR.label, fontSize: sx(13), fontStyle: "italic" },

  payCard: {
    borderWidth: 1, borderColor: COLOR.divider, borderRadius: sx(12),
    paddingVertical: sy(16), alignItems: "center", backgroundColor: "#fff",
  },
  payTitle: { color: COLOR.brand, fontWeight: "600", marginBottom: sy(6) },
  payAmount: { color: COLOR.brand, fontWeight: "800", fontSize: sx(22), marginBottom: sy(4) },
  payNote: { color: COLOR.label, fontSize: sx(12) },

  applyBtn: {
    marginHorizontal: sx(16),
    marginBottom: Platform.OS === "ios" ? sy(12) : sy(8), // Avoid blocking the Home Indicator
    marginTop: sy(8),
    height: sy(44),
    borderRadius: sx(22),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { color: "#fff", fontWeight: "700" },
});
