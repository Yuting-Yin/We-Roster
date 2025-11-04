import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestCardData, RequestStatus } from "@/types/request";

interface RequestCardProps {
  request: RequestCardData;
  onPress: () => void;
}

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const getStatusColor = (status: RequestStatus) => {
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

  const getStatusBackgroundColor = (status: RequestStatus) => {
    switch (status) {
      case "AWAITING":
        return COLOR.warnBg;
      case "APPROVED":
        return COLOR.successBg;
      case "DECLINED":
        return COLOR.redBg;
      default:
        return COLOR.card;
    }
  };

  const getRequestTypeDisplay = () => {
    // For Open Shift Requests, only show the main request type
    if (request.requestType === "Open Shift Request") {
      return request.requestType;
    }
    
    // For other requests, show the sub-type as the main type
    return request.requestSubType;
  };

  const getSubRequestTypeDisplay = () => {
    // For Open Shift Requests, don't show sub-type
    if (request.requestType === "Open Shift Request") {
      return null;
    }
    
    // For other requests, show the main request type as sub-type
    return request.requestType;
  };

  const isIncomingSwap = request.isIncomingSwap || request.requestSubType === "Incoming Swap Request";
  // Use the needsResponse field from backend, with fallback to the old logic
  const needsResponse = request.needsResponse ?? (isIncomingSwap && request.status === "AWAITING");

  return (
    <TouchableOpacity style={[styles.card, isIncomingSwap && styles.incomingSwapCard, needsResponse && styles.needsResponseCard]} onPress={onPress}>
      {/* Special yellow bar for incoming swap requests */}
      {isIncomingSwap}
      
      {/* Status indicator line */}
      <View style={[styles.statusLine, { backgroundColor: getStatusColor(request.status) }]} />
      
      <View style={styles.content}>
        <View style={styles.body}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(request.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {request.status}
            </Text>
          </View>
          
          <Text style={styles.dateText}>{request.date}</Text>
          
          {request.timeRange && (
            <Text style={styles.timeText}>{request.timeRange}</Text>
          )}
          
          <Text style={styles.requestTypeText}>{getRequestTypeDisplay()}</Text>
          
          {getSubRequestTypeDisplay() && (
            <TouchableOpacity style={styles.leaveRequestLink}>
              <Text style={styles.leaveRequestText}>{getSubRequestTypeDisplay()}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Respond indicator for incoming swap requests */}
      {isIncomingSwap && (
        <View style={[styles.respondIndicator, needsResponse && styles.urgentRespondIndicator]}>
          <Ionicons 
            name={needsResponse ? "alert-circle" : "checkmark-circle"} 
            size={sx(14)} 
            color={needsResponse ? "#FF6B35" : "#28A745"} 
          />
          <Text style={[styles.respondIndicatorText, needsResponse && styles.urgentRespondText]}>
            {needsResponse ? "Action Required" : "Responded"}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="chevron-forward" size={sx(20)} color={COLOR.label} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLOR.bg,
    borderRadius: sx(12),
    marginBottom: sy(12),
    minHeight: sy(120), // Ensure consistent minimum height
    // Enhanced shadow styling
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    // Remove overflow hidden to allow shadows to show
  },
  statusLine: {
    width: sx(4),
    height: "100%",
  },
  content: {
    flex: 1,
    padding: sx(16),
    paddingRight: sx(60), // Add extra padding on right to avoid overlap with footer
    justifyContent: "center", // Center content vertically
  },
  statusBadge: {
    paddingHorizontal: sx(12),
    paddingVertical: sy(4),
    borderRadius: sx(12),
    alignSelf: "flex-start", // Align badge to the left
    marginBottom: sy(8), // Add margin below the badge
  },
  statusText: {
    fontSize: sx(12),
    fontWeight: "600",
    textTransform: "uppercase",
  },
  body: {
    flex: 1, // Take up available space to help with consistent height
    justifyContent: "center", // Center the body content vertically
  },
  dateText: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
    marginBottom: sy(4),
  },
  timeText: {
    fontSize: sx(14),
    color: COLOR.label,
    marginBottom: sy(4),
  },
  requestTypeText: {
    fontSize: sx(14),
    color: COLOR.ink,
    marginBottom: sy(2),
  },
  subRequestTypeText: {
    fontSize: sx(12),
    color: COLOR.label,
  },
  leaveRequestLink: {
    marginTop: sy(2),
  },
  leaveRequestText: {
    fontSize: sx(12),
    color: COLOR.brand,
  },
  footer: {
    position: "absolute", // Position absolutely to place on far right
    right: sx(16), // Position on the far right with padding
    top: 0,
    bottom: 0,
    justifyContent: "center", // Center the arrow vertically
    alignItems: "center", // Center horizontally within the footer area
    width: sx(40), // Give the footer a fixed width
  },
  incomingSwapCard: {
    // Special styling for incoming swap requests
    position: "relative",
  },
  yellowBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: sx(6),
    backgroundColor: "#FFF8DC", // Light yellow color
    borderTopLeftRadius: sx(12),
    borderBottomLeftRadius: sx(12),
    zIndex: 1,
  },
  respondIndicator: {
    position: "absolute",
    right: sx(16),
    bottom: sx(16),
    flexDirection: "row",
    alignItems: "center",
    gap: sx(4),
  },
  respondIndicatorText: {
    color: "#B0C4DE", // Light blue-gray color
    fontSize: sx(11),
    fontWeight: "500",
  },
  needsResponseCard: {
    borderWidth: 2,
    borderColor: "#FF6B35",
    backgroundColor: "#FFF8F5", // Very light orange background
  },
  urgentRespondIndicator: {
    backgroundColor: "#FFF0E6",
    paddingHorizontal: sx(8),
    paddingVertical: sy(2),
    borderRadius: sx(12),
  },
  urgentRespondText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
});
