import React from "react";
import { View, ScrollView, Text, TextInput, Pressable, Animated, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt as fmtDate, dayKey } from "@/lib/date";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createLeaveRequest } from "@/api/leave";
import SuccessToast from "@/components/overlays/SuccessToast";
import { useNotificationContext } from "@/contexts/NotificationContext";
import FailToast from "@/components/overlays/FailToast";
import WarningToast from "@/components/overlays/WarningToast";

// Helper function to format date for mobile display
const formatDate = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }
  return date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

export default function NewLeaveRequest({
  visible, onCancel, onSubmitted,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: () => void;
}) {
  const { user, loading, error } = useCurrentUser({ mock: false });
  const { refreshUnreadCount } = useNotificationContext();
  
  const [leaveType, setLeaveType] = React.useState<string | null>("Day Leave"); // Default to Day Leave
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  
  // Date states
  const [fromDate, setFromDate] = React.useState<Date>(new Date());
  const [toDate, setToDate] = React.useState<Date>(new Date());
  
  // Dropdown state
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = React.useRef<View>(null);
  const reasonInputRef = React.useRef<TextInput>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Keyboard handling and precise scroll control (similar to RequestLeave.tsx)
  const [kbHeight, setKbHeight] = React.useState(0);
  const [headerH, setHeaderH] = React.useState(0);
  const [reasonY, setReasonY] = React.useState<number | null>(null);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderH(e.nativeEvent.layout.height);
  };

  const onReasonLayout = (e: LayoutChangeEvent) => {
    setReasonY(e.nativeEvent.layout.y);
  };

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
      // Scroll reason section into view when keyboard appears
      setTimeout(() => {
        if (reasonY !== null) {
          const margin = sy(8);
          const targetY = Math.max(0, reasonY - headerH - margin);
          scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
        }
      }, 60);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKbHeight(0);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, [reasonY, headerH]);
  
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

  // Function to measure dropdown position
  const measureDropdownPosition = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: y + height, // Position below the selection box
          left: x, // Align with left edge of selection box
          width: width, // Match width of selection box
        });
      });
    }
  };

  // Handle dropdown toggle with position measurement
  const toggleDropdown = () => {
    if (!showLeaveTypeDropdown) {
      measureDropdownPosition();
    }
    setShowLeaveTypeDropdown(!showLeaveTypeDropdown);
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
    if (selectedDate && !isNaN(selectedDate.getTime())) {
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
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setToDate(selectedDate);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 45 }]} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerH : 30}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View onLayout={onHeaderLayout}>
            <View style={styles.header}>
            <Pressable onPress={onCancel}>
              <Ionicons name="close" size={sx(24)} color={COLOR.ink} />
            </Pressable>
            <Text style={styles.hTitle}>New Leave Request</Text>
            <View style={{ width: sx(24) }} />
          </View>
            <View style={styles.divider} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingBottom: sy(18) + (Platform.OS === "ios" ? kbHeight : 0)
            }}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={true}
            scrollsToTop={false}
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
          >
            {/* Select Leave Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Leave Type</Text>
              <Pressable 
                ref={dropdownRef}
                style={styles.dropdown}
                onPress={toggleDropdown}
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
                  <Pressable 
                    style={styles.dateInput} 
                    onPress={() => setShowFromDatePicker(true)}
                  >
                    <Text style={styles.dateInputText}>{formatDate(fromDate)}</Text>
                    <Ionicons name="calendar-outline" size={sx(20)} color={COLOR.label} />
                  </Pressable>
                </View>
                
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>To</Text>
                  <Pressable 
                    style={[styles.dateInput, styles.dateInputReadOnly]} 
                    onPress={() => setShowToDatePicker(true)}
                  >
                    <Text style={styles.dateInputText}>{formatDate(toDate)}</Text>
                    <Ionicons name="calendar-outline" size={sx(20)} color="#CCCCCC" />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Reason For Leave */}
            <View style={[styles.section, { marginBottom: sy(20) }]} onLayout={onReasonLayout}>
              <Text style={styles.sectionLabel}>Reason For Leave</Text>
              <View style={styles.reasonBox}>
                <TextInput
                  ref={reasonInputRef}
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

            {/* Submit Button - Now inside ScrollView */}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
      
      {/* Dropdown Options - Positioned dynamically */}
      {showLeaveTypeDropdown && (
        <View style={styles.dropdownOverlay}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowLeaveTypeDropdown(false)}
          />
          <View style={[
            styles.dropdownOptions,
            {
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }
          ]}>
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
        <View style={styles.webDatePickerOverlay}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowFromDatePicker(false)}
          />
          <View style={styles.webDatePickerContainer}>
            <Text style={styles.webDatePickerTitle}>Select Start Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fromDate && !isNaN(fromDate.getTime()) ? fromDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (!isNaN(selectedDate.getTime())) {
                    handleFromDateChange(null, selectedDate);
                  }
                }}
                style={styles.webDateInput}
              />
            ) : (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={handleFromDateChange}
                minimumDate={new Date()}
              />
            )}
            <View style={styles.webDatePickerButtons}>
              <Pressable 
                style={styles.webDatePickerButton}
                onPress={() => setShowFromDatePicker(false)}
              >
                <Text style={styles.webDatePickerButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      
      {showToDatePicker && (
        <View style={styles.webDatePickerOverlay}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowToDatePicker(false)}
          />
          <View style={styles.webDatePickerContainer}>
            <Text style={styles.webDatePickerTitle}>Select End Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={toDate && !isNaN(toDate.getTime()) ? toDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                min={fromDate && !isNaN(fromDate.getTime()) ? fromDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (!isNaN(selectedDate.getTime())) {
                    handleToDateChange(null, selectedDate);
                  }
                }}
                style={styles.webDateInput}
              />
            ) : (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={handleToDateChange}
                minimumDate={fromDate}
              />
            )}
            <View style={styles.webDatePickerButtons}>
              <Pressable 
                style={styles.webDatePickerButton}
                onPress={() => setShowToDatePicker(false)}
              >
                <Text style={styles.webDatePickerButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    maxHeight: '85%', // Reduced to ensure it doesn't overlap with bottom navigation
    minHeight: '70%',
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 20,
    alignItems: "flex-start", // Prevent centering
    justifyContent: "flex-start", // Prevent centering
  },
  dropdownOptions: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: sx(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxHeight: sy(200), // Limit height to prevent overflow
    alignSelf: "flex-start", // Ensure no centering
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
    paddingVertical: sy(12), // Reduced vertical padding to move button up
    paddingBottom: sy(16), // Reduced bottom padding
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
  // Date picker styles (applied on all platforms)
  webDatePickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  webDatePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: sx(12),
    padding: sx(20),
    marginHorizontal: sx(20),
    minWidth: sx(300),
    maxWidth: sx(400),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  webDatePickerTitle: {
    fontSize: sx(18),
    fontWeight: "600",
    color: COLOR.ink,
    marginBottom: sy(16),
    textAlign: "center",
  },
  webDateInput: {
    width: "90%",
    padding: sx(12),
    borderWidth: 1,
    borderColor: COLOR.divider,
    borderRadius: sx(8),
    fontSize: sx(16),
    marginBottom: sy(16),
    backgroundColor: "#fff",
  },
  webDatePickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: sx(12),
  },
  webDatePickerButton: {
    paddingHorizontal: sx(16),
    paddingVertical: sy(8),
    borderRadius: sx(8),
    backgroundColor: COLOR.brand,
  },
  webDatePickerButtonText: {
    color: "#fff",
    fontSize: sx(14),
    fontWeight: "600",
  },
  mobileDatePickerContainer: {
    width: "100%",
  },
});
