import React from "react";
import { View, ScrollView, Text, TextInput, Pressable, Animated, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt as fmtDate, dayKey } from "@/lib/date";
import { checkLeaveRequestDuplicate, getDuplicateRequestErrorMessage } from "@/lib/duplicateRequestValidation";
import { useDashboardData } from "@/hooks/useDashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createLeaveRequest } from "@/api/leave";
import SuccessToast from "@/components/overlays/SuccessToast";
import { useNotificationContext } from "@/contexts/NotificationContext";
import FailToast from "@/components/overlays/FailToast";
import WarningToast from "@/components/overlays/WarningToast";

export default function NewLeaveRequest({
  visible, onCancel, onSubmitted,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: () => void;
}) {
  const { user, loading, error } = useCurrentUser({ mock: false });
  const { refreshUnreadCount } = useNotificationContext();
  const { leaves: existingLeaves } = useDashboardData();
  
  const [leaveType, setLeaveType] = React.useState<string | null>("Day Leave"); // Default to Day Leave
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  
  // Date states
  const [fromDate, setFromDate] = React.useState<Date>(new Date());
  const [toDate, setToDate] = React.useState<Date>(new Date());
  
  // Dropdown state
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = React.useState(false);
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = React.useState(false);
  const [showToDatePicker, setShowToDatePicker] = React.useState(false);
  
  // Toast state
  const [successToast, setSuccessToast] = React.useState(false);
  const [failToast, setFailToast] = React.useState(false);
  const [warningToast, setWarningToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  
  const showSuccessToast = (message: string) => { 
    setToastMessage(message); 
    setSuccessToast(true); 
    setTimeout(() => setSuccessToast(false), 1800); 
  };
  
  const showFailToast = (message: string) => { 
    setToastMessage(message); 
    setFailToast(true); 
    setTimeout(() => setFailToast(false), 1800); 
  };
  
  const showWarningToast = (message: string) => { 
    setToastMessage(message); 
    setWarningToast(true); 
    setTimeout(() => setWarningToast(false), 1800); 
  };

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  // Function to calculate end date based on leave type
  const calculateEndDate = (startDate: Date, leaveTypeValue: string) => {
    const leaveTypes = [
      { value: "Day Leave", label: "Day Leave", duration: 1 },
      { value: "Week Leave", label: "Week Leave", duration: 7 },
      { value: "Month Leave", label: "Month Leave", duration: 30 },
      { value: "Annual Leave", label: "Annual Leave", duration: 365 },
    ];
    
    const selectedLeaveType = leaveTypes.find(t => t.value === leaveTypeValue);
    if (!selectedLeaveType) return startDate;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + selectedLeaveType.duration - 1); // -1 because it's inclusive
    return endDate;
  };

  // Initialize toDate based on default leave type
  React.useEffect(() => {
    if (leaveType) {
      const calculatedEndDate = calculateEndDate(fromDate, leaveType);
      setToDate(calculatedEndDate);
    }
  }, []); // Only run on mount

  // Keyboard handling
  const [kbHeight, setKbHeight] = React.useState(0);
  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (!visible) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  const leaveTypes = [
    { value: "Day Leave", label: "Day Leave", duration: 1 },
    { value: "Week Leave", label: "Week Leave", duration: 7 },
    { value: "Month Leave", label: "Month Leave", duration: 30 },
    { value: "Annual Leave", label: "Annual Leave", duration: 365 },
  ];

  const submit = async () => {
    if (submitting || !leaveType) return;
    
    // Check for duplicate requests (only APPROVED and AWAITING are considered duplicates)
    const duplicateCheck = checkLeaveRequestDuplicate(existingLeaves, fromDate, leaveType);
    if (duplicateCheck.isDuplicate) {
      const errorMessage = getDuplicateRequestErrorMessage(duplicateCheck.duplicateInfo!);
      showWarningToast(errorMessage);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Calculate if it's all day based on leave type
      const isAllDay = true; // All new leave requests are full day
      
      const payload = {
        requestType: leaveType,
        allDay: isAllDay,
        date: dayKey(fromDate),
        start: null, // Full day leave
        end: null,   // Full day leave
        reason: reason?.trim() || undefined,
        createdBy: { id: user?.id ?? "u_unknown", name: user?.name ?? undefined, email: user?.email ?? undefined },
        createdAt: new Date().toISOString(),
        shiftId: undefined, // No specific shift for new leave requests
      };
      
      const result = await createLeaveRequest(payload);
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success === false) {
          // Handle duplicate or other errors
          if ('duplicate' in result && result.duplicate === true) {
            // Show the specific error message from backend
            const errorMessage = (result as any).error || 'A leave request for this day already exists. Please check your existing requests.';
            showWarningToast(errorMessage);
            return; // Don't call onSubmitted for duplicates
          } else {
            const errorResult = result as { success: boolean; error?: string; duplicate?: boolean };
            showFailToast(`Failed to submit: ${errorResult.error || 'Unknown error'}`);
            return; // Don't call onSubmitted for errors
          }
        } else {
          showSuccessToast('Successfully submitted');
        }
      } else {
        showSuccessToast('Successfully submitted');
      }
      
      // Refresh notification count after successful submission
      refreshUnreadCount();
      onSubmitted?.();
    } catch (e: any) {
      console.error('🔍 New Leave Request - Error:', e);
      showFailToast('Failed to submit: Network error or server issue');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  };


  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      // Auto-calculate toDate based on leave type
      if (leaveType) {
        const calculatedEndDate = calculateEndDate(selectedDate, leaveType);
        setToDate(calculatedEndDate);
      }
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 45 }]} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onCancel}>
              <Ionicons name="close" size={sx(24)} color={COLOR.ink} />
            </Pressable>
            <Text style={styles.hTitle}>New Leave Request</Text>
            <View style={{ width: sx(24) }} />
          </View>
          <View style={styles.divider} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: sy(500) }}
            contentContainerStyle={{ paddingBottom: sy(18) + (Platform.OS === "ios" ? kbHeight : 0) }}
          >
            {/* Select Leave Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Leave Type</Text>
              <Pressable 
                style={styles.dropdown}
                onPress={() => setShowLeaveTypeDropdown(!showLeaveTypeDropdown)}
              >
                <Text style={[styles.dropdownText, !leaveType && styles.placeholderText]}>
                  {leaveType ? leaveTypes.find(t => t.value === leaveType)?.label : "Leave Type"}
                </Text>
                <Ionicons name="chevron-down" size={sx(20)} color={COLOR.label} />
              </Pressable>
              
            </View>

            {/* Select Date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>From</Text>
                  <Pressable style={styles.dateInput} onPress={() => setShowFromDatePicker(true)}>
                    <Text style={styles.dateInputText}>{formatDate(fromDate)}</Text>
                    <Ionicons name="calendar-outline" size={sx(20)} color={COLOR.label} />
                  </Pressable>
                </View>
                
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>To</Text>
                  <View style={[styles.dateInput, styles.dateInputReadOnly]}>
                    <Text style={styles.dateInputText}>{formatDate(toDate)}</Text>
                    <Ionicons name="calendar-outline" size={sx(20)} color="#CCCCCC" />
                  </View>
                </View>
              </View>
            </View>

            {/* Reason For Leave */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Reason For Leave</Text>
              <View style={styles.reasonBox}>
                <TextInput
                  placeholder="Type your reason here"
                  placeholderTextColor="#8FA7BF"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  textAlignVertical="top"
                  style={styles.reasonInput}
                />
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Pressable 
              style={[styles.submitButton, (!leaveType || submitting) && styles.submitButtonDisabled]} 
              onPress={submit}
              disabled={!leaveType || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
      
      {/* Dropdown Options - Positioned at sheet level */}
      {showLeaveTypeDropdown && (
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownOptions}>
            {leaveTypes.map((type) => (
              <Pressable
                key={type.value}
                style={styles.dropdownOption}
                onPress={() => {
                  setLeaveType(type.value);
                  setShowLeaveTypeDropdown(false);
                  // Recalculate toDate based on new leave type
                  const calculatedEndDate = calculateEndDate(fromDate, type.value);
                  setToDate(calculatedEndDate);
                }}
              >
                <Text style={styles.dropdownOptionText}>{type.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      
      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={handleFromDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={handleToDateChange}
          minimumDate={fromDate}
        />
      )}
      
      {/* Toast notifications */}
      <SuccessToast visible={successToast} text={toastMessage} />
      <FailToast visible={failToast} text={toastMessage} />
      <WarningToast visible={warningToast} text={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  sheet: {
    position: "absolute", 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: "#fff",
    borderTopLeftRadius: sx(16), 
    borderTopRightRadius: sx(16),
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: COLOR.divider,
    paddingBottom: sy(8), 
    zIndex: 52, 
    elevation: 16,
    maxHeight: '90%',
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: sx(16), 
    paddingVertical: sy(20) 
  },
  hTitle: { 
    color: "#000", 
    fontSize: sx(18), 
    fontWeight: "600" 
  },
  divider: { 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: COLOR.divider,
    marginHorizontal: sx(16),
  },
  section: {
    paddingHorizontal: sx(16),
    paddingVertical: sy(16),
    position: "relative",
  },
  sectionLabel: {
    color: COLOR.ink,
    fontSize: sx(16),
    fontWeight: "600",
    marginBottom: sy(12),
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: sx(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
  },
  dropdownText: {
    color: COLOR.ink,
    fontSize: sx(16),
  },
  placeholderText: {
    color: "#8FA7BF",
  },
  dropdownOverlay: {
    position: "absolute",
    top: sy(273), // Position directly below the leave type input field
    left: sx(16),
    right: sx(16),
    zIndex: 9999,
    elevation: 20,
  },
  dropdownOptions: {
    backgroundColor: "#fff",
    borderRadius: sx(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxHeight: sy(200), // Limit height to prevent overflow
  },
  dropdownOption: {
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  dropdownOptionText: {
    color: COLOR.ink,
    fontSize: sx(16),
  },
  dateRow: {
    flexDirection: "row",
    gap: sx(12),
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    color: COLOR.ink,
    fontSize: sx(14),
    marginBottom: sy(8),
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: sx(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
  },
  dateInputText: {
    color: COLOR.ink,
    fontSize: sx(16),
  },
  dateInputReadOnly: {
    backgroundColor: "#F8F8F8",
    opacity: 0.7,
  },
  reasonBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: sx(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
  },
  reasonInput: {
    color: COLOR.ink,
    fontSize: sx(16),
    minHeight: sy(100),
  },
  submitContainer: {
    paddingHorizontal: sx(16),
    paddingVertical: sy(16),
  },
  submitButton: {
    backgroundColor: COLOR.brand,
    borderRadius: sx(12),
    paddingVertical: sy(16),
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#E4EAF1",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: sx(16),
    fontWeight: "600",
  },
});
