import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestCardData, RequestStatus, RequestFilterValue } from "@/types/request";
import RequestCard from "@/components/overlays/RequestCard";
import { useRequestByStatus } from "@/hooks/useRequests";
import NewLeaveRequest from "@/components/overlays/NewLeaveRequest";
import RequestDetail from "@/components/overlays/RequestDetail";
import RequestFilter from "@/components/overlays/RequestFilter";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useRequestRefresh } from "@/contexts/RequestRefreshContext";

export default function InAction() {
  const route = useRoute<any>();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newLeaveRequestVisible, setNewLeaveRequestVisible] = useState(false);
  const [requestDetailVisible, setRequestDetailVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestCardData | null>(null);
  const [filterValue, setFilterValue] = useState<RequestFilterValue>({
    leaveTypes: [],
    swapTypes: [],
    openShiftRequest: false,
  });
  const [showFilter, setShowFilter] = useState(false);

  // Register overlays with context for auto-close functionality
  const { registerOverlay, unregisterOverlay } = useOverlayContext();
  
  // Get requests data first
  const { requests, loading, error, refresh } = useRequestByStatus(
    "AWAITING",
    selectedMonth.getMonth() + 1,
    selectedMonth.getFullYear()
  );

  // Register with refresh context
  const { registerRefreshCallback, unregisterRefreshCallback } = useRequestRefresh();
  
  React.useEffect(() => {
    registerOverlay('myrequest-new-leave', () => setNewLeaveRequestVisible(false));
    registerOverlay('myrequest-detail', () => setRequestDetailVisible(false));
    registerOverlay('myrequest-filter', () => setShowFilter(false));
    
    // Register refresh callback for this component
    registerRefreshCallback('inaction', refresh);
    
    return () => {
      unregisterOverlay('myrequest-new-leave');
      unregisterOverlay('myrequest-detail');
      unregisterOverlay('myrequest-filter');
      unregisterRefreshCallback('inaction');
    };
  }, [registerOverlay, unregisterOverlay, registerRefreshCallback, unregisterRefreshCallback, refresh]);

  // Auto-close overlays when navigating to other tabs
  useAutoCloseOverlays([
    () => setNewLeaveRequestVisible(false),
    () => setRequestDetailVisible(false),
    () => setShowFilter(false)
  ]);

  // Refresh data when component mounts to ensure latest data is shown
  React.useEffect(() => {
    // Small delay to ensure navigation is complete
    const timer = setTimeout(() => {
      refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run once when component mounts

  // Handle route parameters for showing leave detail
  React.useEffect(() => {
    const params = route.params;
    if (params?.showLeaveDetail && params?.leaveData) {
      // Convert LeaveItem to RequestCardData format
      const requestData: RequestCardData = {
        id: params.leaveId.toString(),
        type: params.leaveData.type,
        status: params.leaveData.state === 'Approved' || params.leaveData.state === 'APPROVED' ? 'APPROVED' : 'AWAITING',
        date: params.leaveData.date,
        time: params.leaveData.category,
        reason: params.leaveData.reason || '',
        requestDate: params.leaveData.requestDate || '',
        startTime: params.leaveData.startTime || '',
        endTime: params.leaveData.endTime || '',
        shiftId: '', // Leave requests don't have shift IDs
      };
      
      setSelectedRequest(requestData);
      setRequestDetailVisible(true);
    }
  }, [route.params]);

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleNewLeaveRequest = () => {
    setNewLeaveRequestVisible(true);
  };

  const handleLeaveRequestSubmitted = () => {
    setNewLeaveRequestVisible(false);
    refresh(); // Refresh the requests list
  };

  const handleRequestPress = (request: RequestCardData) => {
    setSelectedRequest(request);
    setRequestDetailVisible(true);
  };

  const handleRequestDetailClose = () => {
    setRequestDetailVisible(false);
    setSelectedRequest(null);
  };

  const handleFilterApply = () => {
    setShowFilter(false);
  };

  const handleFilterClear = () => {
    setFilterValue({
      leaveTypes: [],
      swapTypes: [],
      openShiftRequest: false,
    });
  };

  const handleFilterClose = () => {
    setShowFilter(false);
  };

  // Filter requests based on selected filters
  const filteredRequests = requests.filter(request => {
    // Check leave types
    if (filterValue.leaveTypes.length > 0) {
      if (request.requestType === "Leave Request" && 
          filterValue.leaveTypes.includes(request.requestSubType as string)) {
        return true;
      }
    }

    // Check swap types
    if (filterValue.swapTypes.length > 0) {
      if (request.requestType === "Swap Request") {
        const isIncomingSwap = request.isIncomingSwap;
        const swapType = isIncomingSwap ? "Incoming Swap" : "My Swap";
        if (filterValue.swapTypes.includes(swapType)) {
          return true;
        }
      }
    }

    // Check open shift request
    if (filterValue.openShiftRequest && request.requestType === "Open Shift Request") {
      return true;
    }

    // If no filters are selected, show all requests
    if (filterValue.leaveTypes.length === 0 && 
        filterValue.swapTypes.length === 0 && 
        !filterValue.openShiftRequest) {
      return true;
    }

    return false;
  });

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="options-outline" size={sx(20)} color={COLOR.ink} />
        </TouchableOpacity>
        
        <View style={styles.centerGroup}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={sx(20)} color={COLOR.ink} />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>{formatMonthYear(selectedMonth)}</Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={sx(20)} color={COLOR.ink} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={sx(20)} color={COLOR.ink} />
        </TouchableOpacity>
      </View>

      {/* Request Filter */}
      <RequestFilter
        visible={showFilter}
        value={filterValue}
        onChange={setFilterValue}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        onClose={handleFilterClose}
      />

      {/* Request List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.requestList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.brand} />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={sx(48)} color={COLOR.label} />
              <Text style={styles.emptyText}>No awaiting requests</Text>
            </View>
          ) : (
            filteredRequests.map((request, index) => (
              <RequestCard
                key={`awaiting-${request.id}-${index}`}
                request={request}
                onPress={() => handleRequestPress(request)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* New Leave Request Button */}
      <TouchableOpacity style={styles.newRequestButton} onPress={handleNewLeaveRequest}>
        <Ionicons name="add" size={sx(20)} color="#fff" />
        <Text style={styles.newRequestButtonText}>New Leave Request</Text>
      </TouchableOpacity>

      {/* New Leave Request Overlay */}
      <NewLeaveRequest
        visible={newLeaveRequestVisible}
        onCancel={() => setNewLeaveRequestVisible(false)}
        onSubmitted={handleLeaveRequestSubmitted}
      />

      {/* Request Detail Overlay */}
      <RequestDetail
        visible={requestDetailVisible}
        onClose={handleRequestDetailClose}
        request={selectedRequest}
        workingStaff={[]} // TODO: Fetch working staff for shift-related requests
        onRefresh={refresh} // Pass refresh function to trigger auto refresh on actions
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(18),
    paddingVertical: sy(16),
    backgroundColor: COLOR.bg,
  },
  centerGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  navButton: {
    padding: sx(8),
  },
  monthText: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
    marginHorizontal: sx(16),
  },
  refreshButton: {
    padding: sx(8),
  },
  filterButton: {
    padding: sx(8),
  },
  scrollView: {
    flex: 1,
  },
  requestList: {
    paddingHorizontal: sx(18),
    paddingBottom: sy(100), // Space for the floating button
  },
  newRequestButton: {
    position: "absolute",
    bottom: sy(24),
    right: sx(18),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.brand,
    paddingHorizontal: sx(20),
    paddingVertical: sy(12),
    borderRadius: sx(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  newRequestButtonText: {
    color: "#fff",
    fontSize: sx(14),
    fontWeight: "600",
    marginLeft: sx(8),
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: sy(48),
  },
  loadingText: {
    fontSize: sx(14),
    color: COLOR.label,
    marginTop: sy(12),
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: sy(48),
  },
  errorText: {
    fontSize: sx(14),
    color: COLOR.red,
    textAlign: "center",
    marginBottom: sy(16),
  },
  retryButton: {
    backgroundColor: COLOR.brand,
    paddingHorizontal: sx(20),
    paddingVertical: sy(8),
    borderRadius: sx(16),
  },
  retryButtonText: {
    color: "#fff",
    fontSize: sx(14),
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: sy(48),
  },
  emptyText: {
    fontSize: sx(14),
    color: COLOR.label,
    marginTop: sy(12),
  },
});
