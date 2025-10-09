import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestCardData } from "@/types/request";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigation } from "@react-navigation/native";
import Avatar from "@/components/common/Avatar";
import { getShiftDetails } from "@/api/myroster";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '@/lib/api';
import { useOverlayContext } from "@/contexts/OverlayContext";

interface RequestDetailProps {
  visible: boolean;
  onClose: () => void;
  request: RequestCardData | null;
  workingStaff?: Array<{
    id: string;
    name: string;
    initials: string;
    designation: string;
  }>;
}

export default function RequestDetail({
  visible,
  onClose,
  request,
  workingStaff = [],
}: RequestDetailProps) {
  const { user } = useCurrentUser({ mock: false });
  const navigation = useNavigation<any>();
  const { requestTeamMemberNav, teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  
  // State for shift details
  const [shiftDetails, setShiftDetails] = React.useState<any>(null);
  const [loadingShift, setLoadingShift] = React.useState(false);
  const [shiftError, setShiftError] = React.useState<string | null>(null);

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  // Test authentication endpoint
  const testAuth = async () => {
    try {
      console.log("🧪 Testing authentication endpoint...");
      const response = await fetch(`${API_BASE}/api/v1/myroster/test-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      console.log("🧪 Auth test result:", data);
    } catch (error) {
      console.error("🧪 Auth test error:", error);
    }
  };

  // Fetch shift details when request changes and has a shift ID
  React.useEffect(() => {
    if (request?.shiftId && visible) {
      // Test auth first
      testAuth();
      
      setLoadingShift(true);
      setShiftError(null);
      
      getShiftDetails(parseInt(request.shiftId))
        .then(details => {
          setShiftDetails(details);
          setLoadingShift(false);
        })
        .catch(error => {
          console.error("Error fetching shift details:", error);
          setShiftError("Failed to load shift details");
          setLoadingShift(false);
        });
    } else {
      setShiftDetails(null);
      setShiftError(null);
    }
  }, [request?.shiftId, visible]);

  // Handle returning from staff details overlay
  React.useEffect(() => {
    if (teamMemberNavRequest?.returnToTab === "My Request" && 
        teamMemberNavRequest?.overlayState?.type === 'request-details' &&
        teamMemberNavRequest?.overlayState?.request?.id === request?.id) {
      // Staff details overlay was closed, we should restore this request detail overlay
      // The overlay should already be visible, but we ensure it stays open
      if (!visible && request) {
        // If somehow the overlay was closed while viewing staff details, we could restore it here
        // But typically the overlay stays open in the background
      }
      clearTeamMemberNavRequest();
    }
  }, [teamMemberNavRequest, request, visible, clearTeamMemberNavRequest]);

  const handleStaffPress = (staffId: string, staffName: string, initials: string) => {
    // Request team member navigation to show staff profile overlay
    // This will navigate to My Team tab, show the staff details overlay, and return to current tab when closed
    requestTeamMemberNav(
      parseInt(staffId), 
      staffName, 
      initials, 
      "My Request", // return to My Request tab when staff details overlay closes
      {
        type: 'request-details',
        request: request,
        timestamp: Date.now()
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AWAITING":
        return COLOR.warn;
      case "APPROVED":
        return COLOR.success;
      case "DECLINED":
        return COLOR.red;
      default:
        return COLOR.label;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "AWAITING":
        return COLOR.warnBg;
      case "APPROVED":
        return COLOR.successBg;
      case "DECLINED":
        return "#FFE6E6";
      default:
        return "#F5F5F5";
    }
  };

  if (!visible || !request) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const isIncomingSwap = request.isIncomingSwap || request.requestSubType === "Incoming Swap Request";

  const handleDecline = () => {
    console.log("Decline swap request:", request.id);
    // TODO: Implement decline functionality
  };

  const handleAccept = () => {
    console.log("Accept swap request:", request.id);
    // TODO: Implement accept functionality
  };

  const handleCancelRequest = () => {
    if (!request) return;
    
    console.log("Cancel request:", request.id, "Status:", request.status);
    
    // Check if request can be cancelled
    const canCancel = request.status === "AWAITING";
    
    if (!canCancel) {
      // Show warning toast for non-cancellable requests
      Alert.alert(
        "Cannot Cancel Request",
        `This request has already been ${request.status.toLowerCase()} and cannot be cancelled.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Show confirmation dialog for cancellable requests
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request? This action cannot be undone.",
      [
        {
          text: "Keep Request",
          style: "cancel"
        },
        {
          text: "Cancel Request",
          style: "destructive",
          onPress: () => confirmCancelRequest()
        }
      ]
    );
  };

  const confirmCancelRequest = async () => {
    if (!request) return;
    
    try {
      console.log("Confirming cancellation of request:", request.id);
      
      // Call API to cancel/delete the request
      const response = await fetch(`${API_BASE}/api/v1/requests/${request.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log("Request cancelled successfully");
        // Close the overlay and refresh the parent component
        onClose();
        // TODO: Trigger parent component refresh to update the request list
      } else {
        throw new Error(`Failed to cancel request: ${response.status}`);
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      Alert.alert(
        "Error",
        "Failed to cancel the request. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Generate dynamic title based on request type and subtype
  const getRequestTitle = () => {
    if (!request) return "Request";
    
    switch (request.requestType) {
      case "Leave Request":
        return "Leave Request";
      case "Swap Request":
        return request.requestSubType || "Swap Request";
      case "Open Shift Request":
        return "Open Shift Request";
      default:
        return "Request";
    }
  };

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: sx(24) }} />
          <Text style={styles.title}>{getRequestTitle()}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close-outline" size={sx(28)} color={COLOR.ink} />
          </Pressable>
        </View>
        <View style={styles.divider} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Request Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={sx(20)} color={COLOR.ink} />
              <Text style={styles.sectionTitle}>Request details</Text>
            </View>

            <View style={styles.detailsGrid}>
              <DetailRow label="Request by" value={`${user?.name || "Unknown User"} (You)`} />
              <DetailRow label="Designation" value={user?.designation || "Unknown Designation"} />
              <DetailRow label="Date" value={request.date} />
              <DetailRow label="Time" value={request.timeRange || ""} />
              <DetailRow label="Address" value={request.address || ""} />
              <DetailRow label="Location" value={request.location || shiftDetails?.location?.name || ""} />
              <DetailRow 
                label="Status" 
                value={request.status}
                valueStyle={[styles.statusTag, { backgroundColor: getStatusBgColor(request.status) }]}
                valueTextStyle={{ color: getStatusColor(request.status) }}
              />
            </View>
          </View>

          {/* Always show "Working with" section for shift-related requests */}
          {request?.shiftId && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="people-outline" size={sx(20)} color={COLOR.ink} />
                  <Text style={styles.sectionTitle}>Working with</Text>
                </View>

                {loadingShift ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLOR.brand} />
                    <Text style={styles.loadingText}>Loading staff...</Text>
                  </View>
                ) : shiftError ? (
                  <Text style={styles.errorText}>{shiftError}</Text>
                ) : (
                  <View style={styles.staffList}>
                    {/* Filter out current user and combine all staff */}
                    {(() => {
                      // Combine staff from workingStaff prop and shift details
                      const allStaff = [
                        ...workingStaff.map(staff => ({
                          id: staff.id,
                          name: staff.name,
                          initials: staff.initials,
                          source: 'workingStaff' as const
                        })),
                        ...(shiftDetails?.coworkers || []).map((coworker: any) => ({
                          id: coworker.id.toString(),
                          name: coworker.name,
                          initials: coworker.initials,
                          source: 'shiftDetails' as const
                        }))
                      ];

                      // Filter out current user (by name matching)
                      const otherStaff = allStaff.filter(staff => 
                        staff.name !== user?.name && 
                        staff.name !== `${user?.firstName} ${user?.lastName}` &&
                        staff.name !== user?.firstName &&
                        staff.name !== user?.lastName
                      );

                      // Remove duplicates (same person from different sources)
                      const uniqueStaff = otherStaff.filter((staff, index, self) => 
                        index === self.findIndex(s => s.name === staff.name)
                      );

                      return uniqueStaff.length > 0 ? (
                        uniqueStaff.map((staff) => (
                          <Pressable
                            key={`${staff.source}-${staff.id}`}
                            style={styles.staffItem}
                            onPress={() => handleStaffPress(staff.id, staff.name, staff.initials)}
                          >
                            <Avatar initials={staff.initials} />
                            <View style={styles.staffInfo}>
                              <Text style={styles.staffName}>{staff.name}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={sx(20)} color={COLOR.label} />
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.noStaffText}>No other staff assigned to this shift</Text>
                      );
                    })()}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isIncomingSwap ? (
            <View style={styles.swapButtonRow}>
              <Pressable style={styles.declineButton} onPress={handleDecline}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </Pressable>
              <Pressable style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable 
              style={[
                styles.cancelButton, 
                request?.status !== "AWAITING" && styles.cancelButtonDisabled
              ]} 
              onPress={handleCancelRequest}
            >
              <Text style={[
                styles.cancelButtonText,
                request?.status !== "AWAITING" && styles.cancelButtonTextDisabled
              ]}>
                Cancel Request
              </Text>
            </Pressable>
          )}
        </View>
    </Animated.View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  valueStyle?: any;
  valueTextStyle?: any;
}

function DetailRow({ label, value, valueStyle, valueTextStyle }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueTextStyle]} numberOfLines={2}>
        {value || "-"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.divider,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingVertical: sy(16),
  },
  title: {
    color: "#000",
    fontSize: sx(18),
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLOR.divider,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#F8F9FA",
    borderRadius: sx(12),
    padding: sx(16),
    marginHorizontal: sx(16),
    marginBottom: sy(16),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sy(16),
  },
  sectionTitle: {
    color: COLOR.ink,
    fontSize: sx(16),
    fontWeight: "600",
    marginLeft: sx(8),
  },
  detailsGrid: {
    gap: sy(12),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    color: COLOR.label,
    fontSize: sx(14),
    flex: 1,
  },
  detailValue: {
    color: COLOR.ink,
    fontSize: sx(14),
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  statusTag: {
    paddingHorizontal: sx(8),
    paddingVertical: sy(4),
    borderRadius: sx(12),
    alignSelf: "flex-end",
  },
  staffList: {
    gap: sy(12),
  },
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: sy(8),
  },
  staffInfo: {
    flex: 1,
    marginLeft: sx(12),
  },
  staffName: {
    color: COLOR.ink,
    fontSize: sx(14),
    fontWeight: "600",
  },
  buttonContainer: {
    paddingHorizontal: sx(16),
    paddingVertical: sx(16),
  },
  cancelButton: {
    backgroundColor: COLOR.brand,
    borderRadius: sx(12),
    paddingVertical: sy(16),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: sx(16),
    fontWeight: "600",
  },
  cancelButtonDisabled: {
    backgroundColor: COLOR.brand + "40", // Lower saturation
    opacity: 0.6,
  },
  cancelButtonTextDisabled: {
    color: "#fff" + "80", // Lower opacity text
  },
  swapButtonRow: {
    flexDirection: "row",
    gap: sx(12),
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(12),
    paddingVertical: sy(16),
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: COLOR.brand,
    fontSize: sx(16),
    fontWeight: "600",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLOR.brand,
    borderRadius: sx(12),
    paddingVertical: sy(16),
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: sx(16),
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: sy(20),
  },
  loadingText: {
    color: COLOR.label,
    fontSize: sx(14),
    marginLeft: sx(8),
  },
  errorText: {
    color: COLOR.red,
    fontSize: sx(14),
    textAlign: "center",
    paddingVertical: sy(20),
  },
  noStaffText: {
    color: COLOR.label,
    fontSize: sx(14),
    textAlign: "center",
    paddingVertical: sy(20),
    fontStyle: "italic",
  },
});
