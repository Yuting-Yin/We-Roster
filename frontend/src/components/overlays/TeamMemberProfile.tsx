import React from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import Avatar from "@/components/common/Avatar";

interface TeamMemberProfileProps {
  visible: boolean;
  onClose: () => void;
  member: {
    staffId: string;
    staffName: string;
    staffInitials: string;
    staffDesignation: string;
    shiftId: string;
    shiftDate: string;
    shiftTime: string;
    locationName: string;
    hospitalName: string;
  } | null;
}

export default function TeamMemberProfile({ visible, onClose, member }: TeamMemberProfileProps) {
  if (!member) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Team Member Profile</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={sx(24)} color={COLOR.ink} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar and Name */}
            <View style={styles.profileSection}>
              <Avatar initials={member.staffInitials} size={sx(80)} />
              <Text style={styles.name}>{member.staffName}</Text>
              <Text style={styles.designation}>{member.staffDesignation}</Text>
            </View>

            {/* Current Assignment */}
            <View style={styles.assignmentSection}>
              <Text style={styles.sectionTitle}>Today's Assignment</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={sx(20)} color={COLOR.brand} />
                <Text style={styles.infoText}>{member.shiftDate}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={sx(20)} color={COLOR.brand} />
                <Text style={styles.infoText}>{member.shiftTime}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={sx(20)} color={COLOR.brand} />
                <Text style={styles.infoText}>{member.locationName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={sx(20)} color={COLOR.brand} />
                <Text style={styles.infoText}>{member.hospitalName}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: sx(16),
    width: "90%",
    maxWidth: sx(400),
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
  },
  title: {
    fontSize: sx(18),
    fontWeight: "600",
    color: COLOR.ink,
  },
  closeButton: {
    padding: sx(4),
  },
  divider: {
    height: 1,
    backgroundColor: COLOR.divider,
    marginHorizontal: sx(20),
  },
  content: {
    padding: sx(20),
  },
  profileSection: {
    alignItems: "center",
    marginBottom: sy(24),
  },
  name: {
    fontSize: sx(20),
    fontWeight: "600",
    color: COLOR.ink,
    marginTop: sy(12),
  },
  designation: {
    fontSize: sx(14),
    color: COLOR.label,
    marginTop: sy(4),
  },
  assignmentSection: {
    marginTop: sy(16),
  },
  sectionTitle: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
    marginBottom: sy(16),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sy(12),
  },
  infoText: {
    fontSize: sx(14),
    color: COLOR.ink,
    marginLeft: sx(12),
    flex: 1,
  },
});
