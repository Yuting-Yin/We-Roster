import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestCardData } from "@/types/request";
import RequestCard from "@/components/overlays/RequestCard";
import { useRequests } from "@/hooks/useRequests";
import RequestDetail from "@/components/overlays/RequestDetail";

export default function History() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [requestDetailVisible, setRequestDetailVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestCardData | null>(null);
  const { historyRequests: requests, loading, error, refreshRequests: refresh } = useRequests(
    selectedMonth.getMonth() + 1, 
    selectedMonth.getFullYear()
  );

  // Refresh data when component mounts to ensure latest data is shown
  React.useEffect(() => {
    // Small delay to ensure navigation is complete
    const timer = setTimeout(() => {
      refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run once when component mounts

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

  const handleRequestPress = (request: RequestCardData) => {
    setSelectedRequest(request);
    setRequestDetailVisible(true);
  };

  const handleRequestDetailClose = () => {
    setRequestDetailVisible(false);
    setSelectedRequest(null);
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.filterButton}>
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
          ) : requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={sx(48)} color={COLOR.label} />
              <Text style={styles.emptyText}>No history requests</Text>
            </View>
          ) : (
            requests.map((request, index) => (
              <RequestCard
                key={`history-${request.id}-${index}`}
                request={request}
                onPress={() => handleRequestPress(request)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Request Detail Overlay */}
      <RequestDetail
        visible={requestDetailVisible}
        onClose={handleRequestDetailClose}
        request={selectedRequest}
        workingStaff={[]} // TODO: Fetch working staff for shift-related requests
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
    paddingBottom: sy(24),
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
