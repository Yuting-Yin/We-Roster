import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useTeamRosterData } from "@/hooks/useTeamRoster";
import TeamRosterFilter from "@/components/overlays/TeamRosterFilter";
import { fmt } from "@/lib/date";

// Types for team roster data
export type TeamRosterShift = {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  assignedStaff: {
    id: string;
    name: string;
    initials: string;
    designation: string;
  }[];
};

export type TeamRosterCell = {
  room: string;
  shiftType: "AM" | "PM" | "AH" | "ON_CALL";
  shifts: TeamRosterShift[];
};

export type TeamRosterTable = {
  hospital: string;
  rooms: string[];
  cells: TeamRosterCell[];
  isCollapsed: boolean;
};

export type TeamRosterFilterValue = {
  shiftTypes: string[];
  designations: string[];
};

export default function TeamRoster() {
  const route = useRoute<any>();
  const selectedDate = route.params?.selectedDate;
  const { members, loading, error, refresh } = useTeamMembers();
  const { user: currentUser } = useCurrentUser();
  const { registerOverlay, unregisterOverlay } = useOverlayContext();
  
  // Get current date for display and API calls - memoize to prevent unnecessary re-renders
  const currentDate = useMemo(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  }, [selectedDate]);
  
  const { data: teamRosterData, loading: rosterLoading, error: rosterError, refresh: refreshRoster } = useTeamRosterData(currentDate);

  // State for filter overlay
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<TeamRosterFilterValue>({
    shiftTypes: [],
    designations: [],
  });

  // State for collapsible tables
  const [collapsedHospitals, setCollapsedHospitals] = useState<Set<string>>(new Set());

  // Convert API data to component format
  const teamRosterTables: TeamRosterTable[] = useMemo(() => {
    if (!teamRosterData) return [];
    
    return teamRosterData.tables.map(table => ({
      hospital: table.hospital,
      rooms: table.rooms,
      isCollapsed: collapsedHospitals.has(table.hospital),
      cells: table.cells
    }));
  }, [teamRosterData, collapsedHospitals]);

  // Register overlay for auto-close
  useEffect(() => {
    registerOverlay('team-roster-filter', () => setFilterVisible(false));
    return () => {
      unregisterOverlay('team-roster-filter');
    };
  }, [registerOverlay, unregisterOverlay]);

  // Auto-close overlays when navigating to other tabs
  useAutoCloseOverlays([
    () => setFilterVisible(false)
  ]);

  // Filter data based on filter values
  const filteredData = useMemo(() => {
    return teamRosterTables.map(hospital => ({
      ...hospital,
      cells: hospital.cells.filter(cell => {
        // Filter by shift types
        if (filter.shiftTypes.length > 0 && !filter.shiftTypes.includes(cell.shiftType)) {
          return false;
        }
        
        // Filter by designations
        if (filter.designations.length > 0) {
          const hasMatchingDesignation = cell.shifts.some(shift =>
            shift.assignedStaff.some(staff =>
              filter.designations.includes(staff.designation)
            )
          );
          if (!hasMatchingDesignation) {
            return false;
          }
        }
        
        return true;
      })
    }));
  }, [teamRosterTables, filter]);

  // Format current date for display - memoize to prevent unnecessary re-renders
  const formattedDate = useMemo(() => {
    return fmt(currentDate, { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }, [currentDate]);

  const toggleHospitalCollapse = (hospital: string) => {
    const newCollapsed = new Set(collapsedHospitals);
    if (newCollapsed.has(hospital)) {
      newCollapsed.delete(hospital);
    } else {
      newCollapsed.add(hospital);
    }
    setCollapsedHospitals(newCollapsed);
  };

  const renderStaffList = (staff: TeamRosterShift['assignedStaff'], shiftId: string) => {
    return staff.map((person, index) => (
      <View key={`staff-${shiftId}-${person.id}-${index}`} style={styles.staffItem}>
        <Ionicons name="person" size={sx(12)} color={COLOR.label} />
        <Text style={styles.staffName}>{person.name}</Text>
      </View>
    ));
  };

  const renderTableCell = (room: string, shiftType: "AM" | "PM" | "AH" | "ON_CALL") => {
    const cell = filteredData[0]?.cells.find(c => c.room === room && c.shiftType === shiftType);
    
    if (!cell || cell.shifts.length === 0) {
      return <View style={styles.emptyCell} />;
    }

    return (
      <View style={styles.tableCell}>
        {cell.shifts.map((shift, index) => (
          <View key={`shift-${room}-${shiftType}-${shift.id}-${index}`} style={styles.shiftContainer}>
            <View style={styles.shiftHeader}>
              <Ionicons name="medical" size={sx(14)} color={COLOR.brand} />
              <Text style={styles.shiftName}>{shift.shiftName}</Text>
            </View>
            <Text style={styles.shiftTime}>{shift.startTime} - {shift.endTime}</Text>
            <View style={styles.staffContainer}>
              {renderStaffList(shift.assignedStaff, shift.id)}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderHospitalTable = (hospital: TeamRosterTable) => {
    const isCollapsed = collapsedHospitals.has(hospital.hospital);
    const rooms = hospital.rooms; // Backend already includes "On Call"
    const shiftTypes: ("AM" | "PM" | "AH" | "ON_CALL")[] = ["ON_CALL", "AM", "PM", "AH"];

    return (
      <View key={hospital.hospital} style={styles.hospitalSection}>
        {/* Hospital Header */}
        <Pressable 
          style={styles.hospitalHeader}
          onPress={() => toggleHospitalCollapse(hospital.hospital)}
        >
          <Text style={styles.hospitalTitle}>{hospital.hospital}</Text>
          <Ionicons 
            name={isCollapsed ? "chevron-down" : "chevron-up"} 
            size={sx(20)} 
            color={COLOR.label} 
          />
        </Pressable>

        {!isCollapsed && (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.sessionColumn}>
                <Text style={styles.headerText}>Session</Text>
              </View>
              {rooms.map(room => (
                <View key={room} style={styles.roomColumn}>
                  <Text style={styles.headerText}>{room}</Text>
                </View>
              ))}
            </View>

            {/* Table Rows */}
            {shiftTypes.map(shiftType => (
              <View key={shiftType} style={styles.tableRow}>
                <View style={styles.sessionColumn}>
                  <Text style={styles.shiftTypeText}>
                    {shiftType === "ON_CALL" ? "On Call" : shiftType}
                  </Text>
                </View>
                {rooms.map(room => (
                  <View key={`${room}-${shiftType}`} style={styles.roomColumn}>
                    {renderTableCell(room, shiftType)}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date and Filter Bar */}
      <View style={styles.toolbar}>
        <Pressable 
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={sx(18)} color={COLOR.ink} />
        </Pressable>

        <View style={styles.dateContainer}>
          <Ionicons name="chevron-back" size={sx(20)} color={COLOR.label} />
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Ionicons name="chevron-forward" size={sx(20)} color={COLOR.label} />
        </View>

        <Pressable style={styles.searchButton}>
          <Ionicons name="search-outline" size={sx(18)} color={COLOR.ink} />
        </Pressable>
      </View>

      {/* Team Roster Tables */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {rosterLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading team roster...</Text>
          </View>
        ) : rosterError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={sx(48)} color={COLOR.warn} />
            <Text style={styles.errorText}>{rosterError}</Text>
            <Pressable onPress={refreshRoster} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={sx(48)} color={COLOR.label} />
            <Text style={styles.emptyText}>No team roster data available</Text>
          </View>
        ) : (
          filteredData.map(renderHospitalTable)
        )}
      </ScrollView>

      {/* Filter Overlay */}
      <TeamRosterFilter
        visible={filterVisible}
        value={filter}
        onChange={setFilter}
        onApply={() => setFilterVisible(false)}
        onClear={() => setFilter({ shiftTypes: [], designations: [] })}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  
  filterButton: {
    width: sx(36),
    height: sy(36),
    borderRadius: sx(8),
    alignItems: "center",
    justifyContent: "center",
  },
  
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(12),
  },
  
  dateText: {
    fontSize: sx(16),
    fontWeight: "600",
    color: COLOR.ink,
  },
  
  searchButton: {
    width: sx(36),
    height: sy(36),
    borderRadius: sx(8),
    alignItems: "center",
    justifyContent: "center",
  },
  
  content: {
    flex: 1,
    padding: sx(16),
  },
  
  hospitalSection: {
    marginBottom: sy(24),
    backgroundColor: "#fff",
    borderRadius: sx(12),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  
  hospitalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    backgroundColor: COLOR.brand + "10",
  },
  
  hospitalTitle: {
    fontSize: sx(18),
    fontWeight: "700",
    color: COLOR.brand,
  },
  
  tableContainer: {
    padding: sx(16),
  },
  
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: COLOR.brand,
    paddingBottom: sy(8),
    marginBottom: sy(12),
  },
  
  sessionColumn: {
    width: sx(80),
    paddingRight: sx(8),
  },
  
  roomColumn: {
    flex: 1,
    paddingHorizontal: sx(4),
  },
  
  headerText: {
    fontSize: sx(14),
    fontWeight: "700",
    color: COLOR.brand,
    textAlign: "center",
  },
  
  tableRow: {
    flexDirection: "row",
    minHeight: sy(60),
    marginBottom: sy(8),
    alignItems: "flex-start",
  },
  
  shiftTypeText: {
    fontSize: sx(12),
    fontWeight: "600",
    color: COLOR.ink,
    textAlign: "center",
    paddingTop: sy(4),
  },
  
  tableCell: {
    flex: 1,
    paddingHorizontal: sx(4),
    paddingVertical: sy(4),
  },
  
  emptyCell: {
    flex: 1,
    height: sy(52),
  },
  
  shiftContainer: {
    backgroundColor: COLOR.bg,
    borderRadius: sx(8),
    padding: sx(8),
    marginBottom: sy(4),
    borderWidth: 1,
    borderColor: COLOR.divider,
  },
  
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sy(4),
    gap: sx(4),
  },
  
  shiftName: {
    fontSize: sx(12),
    fontWeight: "600",
    color: COLOR.ink,
    flex: 1,
  },
  
  shiftTime: {
    fontSize: sx(10),
    color: COLOR.label,
    marginBottom: sy(4),
  },
  
  staffContainer: {
    gap: sy(2),
  },
  
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(4),
  },
  
  staffName: {
    fontSize: sx(10),
    color: COLOR.label,
    flex: 1,
  },
  
  loadingContainer: {
    padding: sx(32),
    alignItems: "center",
    marginTop: sy(60),
  },
  
  loadingText: {
    color: COLOR.label,
    marginTop: sy(12),
    textAlign: "center",
  },
  
  errorContainer: {
    padding: sx(32),
    alignItems: "center",
    marginTop: sy(60),
  },
  
  errorText: {
    color: COLOR.warn,
    marginTop: sy(12),
    textAlign: "center",
  },
  
  retryButton: {
    marginTop: sy(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(8),
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
  },
  
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  
  emptyContainer: {
    padding: sx(32),
    alignItems: "center",
    marginTop: sy(60),
  },
  
  emptyText: {
    color: COLOR.label,
    marginTop: sy(12),
    textAlign: "center",
  },
});
