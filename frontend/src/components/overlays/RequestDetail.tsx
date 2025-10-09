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
import { API_BASE, fetchJson } from '@/lib/api';
import { useOverlayContext } from "@/contexts/OverlayContext";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import WarningToast from "@/components/overlays/WarningToast";
import { acceptSwapRequest, declineSwapRequest } from "@/api/swap";

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
  onRefresh?: () => void; // Callback to refresh request data
}

export default function RequestDetail({
  visible,
  onClose,
  request,
  workingStaff = [],
  onRefresh,
}: RequestDetailProps) {
  const { user } = useCurrentUser({ mock: false });
  const navigation = useNavigation<any>();
  const { requestTeamMemberNav, teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  
  // State for shift details
  const [shiftDetails, setShiftDetails] = React.useState<any>(null);
  const [loadingShift, setLoadingShift] = React.useState(false);
  const [shiftError, setShiftError] = React.useState<string | null>(null);
  
  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showWarningDialog, setShowWarningDialog] = React.useState(false);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  
  // State for swap response confirmation dialogs
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = React.useState(false);
  
  // State for warning toast
  const [showWarningToast, setShowWarningToast] = React.useState(false);
  const [warningToastMessage, setWarningToastMessage] = React.useState("");

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  // Helper function to show warning toast
  const showWarningToastMessage = (message: string) => {
    setWarningToastMessage(message);
    setShowWarningToast(true);
    setTimeout(() => setShowWarningToast(false), 3000);
  };

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
  // Check if user has already responded by looking at needsResponse field
  const hasAlreadyResponded = request.status === "APPROVED" || request.status === "DECLINED" || 
                              (isIncomingSwap && !request.needsResponse);
  
  console.log("🔍 RequestDetail - isIncomingSwap:", isIncomingSwap);
  console.log("🔍 RequestDetail - request.isIncomingSwap:", request.isIncomingSwap);
  console.log("🔍 RequestDetail - request.requestSubType:", request.requestSubType);
  console.log("🔍 RequestDetail - request.needsResponse:", request.needsResponse);
  console.log("🔍 RequestDetail - hasAlreadyResponded:", hasAlreadyResponded);

  const handleDecline = () => {
    console.log("🔍 HandleDecline - Button clicked for swap request:", request?.id);
    
    if (!request) {
      console.log("🔍 HandleDecline - No request data available");
      return;
    }
    
    // Check if request has already been processed
    if (request.status === "APPROVED" || request.status === "DECLINED") {
      console.log("🔍 HandleDecline - Request already processed, showing warning toast");
      showWarningToastMessage("You have already responded to this swap request. You can only respond once.");
      return;
    }
    
    // Show confirmation dialog
    setShowDeclineDialog(true);
  };

  const handleAccept = () => {
    console.log("🔍 HandleAccept - Button clicked for swap request:", request?.id);
    
    if (!request) {
      console.log("🔍 HandleAccept - No request data available");
      return;
    }
    
    // Check if request has already been processed
    if (request.status === "APPROVED" || request.status === "DECLINED") {
      console.log("🔍 HandleAccept - Request already processed, showing warning toast");
      showWarningToastMessage("You have already responded to this swap request. You can only respond once.");
      return;
    }
    
    // Show confirmation dialog
    setShowAcceptDialog(true);
  };

  const handleCancelRequest = () => {
    console.log("🔍 HandleCancelRequest - Button clicked!");
    
    if (!request) {
      console.log("🔍 HandleCancelRequest - No request data available");
      return;
    }
    
    console.log("🔍 HandleCancelRequest - Request ID:", request.id);
    console.log("🔍 HandleCancelRequest - Request Status:", request.status);
    console.log("🔍 HandleCancelRequest - Request Type:", request.requestType);
    
    // Check if request can be cancelled
    const canCancel = request.status === "AWAITING";
    console.log("🔍 HandleCancelRequest - Can cancel:", canCancel);
    
    if (!canCancel) {
      // Show warning dialog for non-cancellable requests
      console.log("🔍 HandleCancelRequest - Showing warning dialog");
      setShowWarningDialog(true);
      return;
    }
    
    // Show confirmation dialog for cancellable requests
    console.log("🔍 HandleCancelRequest - Showing confirmation dialog");
    setShowConfirmDialog(true);
  };

  const confirmCancelRequest = async () => {
    if (!request) return;
    
    try {
      console.log("🔍 ConfirmCancelRequest - Starting cancellation for request:", request.id);
      console.log("🔍 ConfirmCancelRequest - Request type:", request.requestType);
      console.log("🔍 ConfirmCancelRequest - Request status:", request.status);
      
      // Call API to cancel/delete the request using centralized fetchJson
      const response = await fetchJson(`/api/v1/requests/${request.id}`, {
        method: 'DELETE',
      });
      
      console.log("🔍 ConfirmCancelRequest - API response:", response);
      
      if (response.success) {
        console.log("🔍 ConfirmCancelRequest - Request cancelled successfully:", response.message);
        setShowConfirmDialog(false);
        
        // Automatically close overlay and refresh the screen
        onClose();
        onRefresh?.();
      } else {
        throw new Error(response.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("🔍 ConfirmCancelRequest - Error cancelling request:", error);
      setShowConfirmDialog(false);
      
      // Parse error message to show user-friendly message
      let errorMessage = "Failed to cancel the request. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Cannot delete request with status")) {
          errorMessage = "This request cannot be cancelled because it has already been processed. Please refresh the page to see the current status.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMessage(errorMessage);
      setShowErrorDialog(true);
    }
  };

  // Handle accepting swap request
  const confirmAcceptSwap = async () => {
    if (!request) return;
    
    try {
      console.log("🔍 ConfirmAcceptSwap - Starting accept for swap request:", request.id);
      
      const response = await acceptSwapRequest(request.id);
      
      if (response.success) {
        console.log("🔍 ConfirmAcceptSwap - Swap request accepted successfully:", response.message);
        setShowAcceptDialog(false);
        
        // Automatically close overlay and refresh the screen
        onClose();
        onRefresh?.();
      } else {
        throw new Error(response.message || "Failed to accept swap request");
      }
    } catch (error) {
      console.error("🔍 ConfirmAcceptSwap - Error accepting swap request:", error);
      setShowAcceptDialog(false);
      
      let errorMessage = "Failed to accept the swap request. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setShowErrorDialog(true);
    }
  };

  // Handle declining swap request
  const confirmDeclineSwap = async () => {
    if (!request) return;
    
    try {
      console.log("🔍 ConfirmDeclineSwap - Starting decline for swap request:", request.id);
      
      const response = await declineSwapRequest(request.id);
      
      if (response.success) {
        console.log("🔍 ConfirmDeclineSwap - Swap request declined successfully:", response.message);
        setShowDeclineDialog(false);
        
        // Automatically close overlay and refresh the screen
        onClose();
        onRefresh?.();
      } else {
        throw new Error(response.message || "Failed to decline swap request");
      }
    } catch (error) {
      console.error("🔍 ConfirmDeclineSwap - Error declining swap request:", error);
      setShowDeclineDialog(false);
      
      let errorMessage = "Failed to decline the swap request. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setShowErrorDialog(true);
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
          {(() => {
            console.log("🔍 RequestDetail - Rendering buttons, isIncomingSwap:", isIncomingSwap);
            return isIncomingSwap;
          })() ? (
            <View style={styles.swapButtonRow}>
              <Pressable 
                style={[
                  styles.declineButton, 
                  hasAlreadyResponded && styles.disabledButton
                ]} 
                onPress={handleDecline}
                disabled={hasAlreadyResponded}
              >
                <Text style={[
                  styles.declineButtonText,
                  hasAlreadyResponded && styles.disabledButtonText
                ]}>Decline</Text>
              </Pressable>
              <Pressable 
                style={[
                  styles.acceptButton,
                  hasAlreadyResponded && styles.disabledButton
                ]} 
                onPress={handleAccept}
                disabled={hasAlreadyResponded}
              >
                <Text style={[
                  styles.acceptButtonText,
                  hasAlreadyResponded && styles.disabledButtonText
                ]}>Accept</Text>
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
        
        {/* Custom Confirmation Dialog */}
        <ConfirmationDialog
          visible={showConfirmDialog}
          title="Cancel Request"
          message="Are you sure you want to cancel this request? This action cannot be undone."
          confirmText="Cancel Request"
          cancelText="Keep Request"
          confirmStyle="destructive"
          onConfirm={() => {
            console.log("🔍 HandleCancelRequest - User confirmed cancellation");
            confirmCancelRequest();
          }}
          onCancel={() => {
            console.log("🔍 HandleCancelRequest - User cancelled");
            setShowConfirmDialog(false);
          }}
        />
        
        {/* Custom Warning Dialog */}
        <ConfirmationDialog
          visible={showWarningDialog}
          title="Request Already Processed"
          message={isIncomingSwap 
            ? `This swap request has already been ${request?.status.toLowerCase()}. You can only respond once to each request.`
            : `This request has already been ${request?.status.toLowerCase()} and cannot be cancelled.`
          }
          confirmText="OK"
          confirmStyle="default"
          onConfirm={() => setShowWarningDialog(false)}
          onCancel={() => setShowWarningDialog(false)}
        />
        
        {/* Custom Error Dialog */}
        <ConfirmationDialog
          visible={showErrorDialog}
          title="Cannot Cancel Request"
          message={errorMessage}
          confirmText="OK"
          cancelText={onRefresh ? "Refresh Data" : undefined}
          confirmStyle="default"
          onConfirm={() => setShowErrorDialog(false)}
          onCancel={() => {
            if (onRefresh) {
              onRefresh();
              onClose();
            }
            setShowErrorDialog(false);
          }}
        />
        
        {/* Swap Accept Confirmation Dialog */}
        <ConfirmationDialog
          visible={showAcceptDialog}
          title="Accept Swap Request"
          message="Are you sure you want to accept this swap request? You can only respond once to each request."
          confirmText="Accept"
          cancelText="Cancel"
          confirmStyle="default"
          onConfirm={() => {
            confirmAcceptSwap();
          }}
          onCancel={() => {
            setShowAcceptDialog(false);
          }}
        />
        
        {/* Swap Decline Confirmation Dialog */}
        <ConfirmationDialog
          visible={showDeclineDialog}
          title="Decline Swap Request"
          message="Are you sure you want to decline this swap request? You can only respond once to each request."
          confirmText="Decline"
          cancelText="Cancel"
          confirmStyle="destructive"
          onConfirm={() => {
            confirmDeclineSwap();
          }}
          onCancel={() => {
            setShowDeclineDialog(false);
          }}
        />
        
        {/* Warning Toast */}
        <WarningToast 
          visible={showWarningToast} 
          text={warningToastMessage} 
        />
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
  disabledButton: {
    opacity: 0.4,
    backgroundColor: "#E0E0E0", // Gray background for disabled state
  },
  disabledButtonText: {
    opacity: 0.6,
    color: "#9E9E9E", // Gray text for disabled state
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
