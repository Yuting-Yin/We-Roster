import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useTeamRosterData, useTeamRosterFilterOptions } from "@/hooks/useTeamRoster";
import { getAvailableDates } from "@/api/teamroster";
import TeamRosterFilter from "@/components/overlays/TeamRosterFilter";
import StaffDetails, { StaffMember as StaffDetailsMember } from "@/components/overlays/StaffDetails";
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

const BORDER_COLOR = "#2B88D8";
const HEADER_BG = "#EFF6FC";
const LABEL_COLOR = "#212121";

export default function TeamRoster() {
  const route = useRoute<any>();
  const selectedDate = route.params?.selectedDate;
  const { user: currentUser } = useCurrentUser();
  const { registerOverlay, unregisterOverlay } = useOverlayContext();
  
  // Get current date for display and API calls
  const currentDate = useMemo(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  }, [selectedDate]);
  
  // State for date navigation
  const [displayDate, setDisplayDate] = useState<Date>(currentDate);
  
  // Update displayDate when route params change
  useEffect(() => {
    if (selectedDate) {
      setDisplayDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Debug: Check available dates
  useEffect(() => {
    const checkAvailableDates = async () => {
      try {
        const dates = await getAvailableDates();
        console.log('🔍 TeamRoster - Available dates with data:', dates);
      } catch (error) {
        console.error('🔍 TeamRoster - Error fetching available dates:', error);
      }
    };
    checkAvailableDates();
  }, []);
  
  const { data: teamRosterData, loading: rosterLoading, error: rosterError, refresh: refreshRoster } = useTeamRosterData(displayDate, { mock: false });
  const { options: filterOptions, loading: filterOptionsLoading } = useTeamRosterFilterOptions();

  // State for filter overlay
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<TeamRosterFilterValue>({
    shiftTypes: [],
    designations: [],
  });

  // State for collapsible tables
  const [collapsedHospitals, setCollapsedHospitals] = useState<Set<string>>(new Set());
  
  // State for staff details overlay
  const [staffDetailsVisible, setStaffDetailsVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffDetailsMember | undefined>(undefined);
  
  // Animation for refresh icon
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // ScrollView ref
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Format display date for display
  const formattedDate = useMemo(() => {
    return fmt(displayDate, { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }, [displayDate]);

  // Day navigation functions
  const handlePreviousDay = () => {
    const previousDay = new Date(displayDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setDisplayDate(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(displayDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setDisplayDate(nextDay);
  };

  // Handle staff member click
  const handleStaffPress = (staff: TeamRosterShift['assignedStaff'][0]) => {
    const staffDetails: StaffDetailsMember = {
      id: parseInt(staff.id),
      name: staff.name,
      initials: staff.initials,
      email: `${staff.name.toLowerCase().replace(/\s+/g, '.')}@weroster.com`, // Generate email
      phone: "+1-555-0123", // Placeholder phone
      designation: staff.designation,
      accreditation: `${staff.designation?.toUpperCase()}-2023-001` // Placeholder accreditation
    };
    
    setSelectedStaff(staffDetails);
    setStaffDetailsVisible(true);
  };

  // Handle staff details overlay close
  const handleStaffDetailsClose = () => {
    setStaffDetailsVisible(false);
    setSelectedStaff(undefined);
  };


  // Handle refresh button press
  const handleRefresh = () => {
    // Start rotation animation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    refreshRoster();
  };

  const toggleHospitalCollapse = (hospital: string) => {
    const newCollapsed = new Set(collapsedHospitals);
    if (newCollapsed.has(hospital)) {
      newCollapsed.delete(hospital);
    } else {
      newCollapsed.add(hospital);
    }
    setCollapsedHospitals(newCollapsed);
  };

  // Helper function to get cells for a specific room and shift type
  const getCellsForRoomAndShift = (
    hospitalCells: TeamRosterCell[], 
    room: string, 
    shiftType: "AM" | "PM" | "AH" | "ON_CALL"
  ): TeamRosterCell | undefined => {
    return hospitalCells.find(c => c.room === room && c.shiftType === shiftType);
  };

  // Render staff list with avatars and highlighting
  const renderStaffList = (staff: TeamRosterShift['assignedStaff']) => {
    return staff.map((person, index) => {
      // Check if this staff member matches the designation filter
      const isHighlighted = filter.designations.length > 0 && 
        filter.designations.includes(person.designation);
      
      return (
        <Pressable 
          key={`${person.id}-${index}`} 
          style={styles.staffRow}
          onPress={() => handleStaffPress(person)}
        >
          <View style={[
            styles.staffAvatar,
            isHighlighted && styles.staffAvatarHighlighted
          ]}>
            <Text style={[
              styles.staffAvatarText,
              isHighlighted && styles.staffAvatarTextHighlighted
            ]}>
              {person.initials}
            </Text>
          </View>
          <Text style={[
            styles.staffName,
            isHighlighted && styles.staffNameHighlighted
          ]}>
            {person.name}
          </Text>
        </Pressable>
      );
    });
  };

  // Render shifts in a cell
  const renderShifts = (shifts: TeamRosterShift[]) => {
    return shifts.map((shift, index) => (
      <View 
        key={`${shift.id}-${index}`} 
        style={[
          styles.shiftGroup,
          index > 0 && styles.shiftGroupSpacing
        ]}
      >
        <View style={styles.dutyRow}>
          <Ionicons name="medical-outline" size={sx(12)} color={BORDER_COLOR} />
          <Text style={styles.dutyName}>{shift.shiftName}</Text>
        </View>
        {renderStaffList(shift.assignedStaff)}
      </View>
    ));
  };

  // Render a single table cell
  const renderTableCell = (
    hospitalCells: TeamRosterCell[],
    room: string, 
    shiftType: "AM" | "PM" | "AH" | "ON_CALL",
    isLastColumn: boolean,
    key?: string
  ) => {
    const cell = getCellsForRoomAndShift(hospitalCells, room, shiftType);
    
    return (
      <View 
        key={key}
        style={[
          isLastColumn ? styles.tableCellNarrow : styles.tableCell,
          !isLastColumn && styles.tableCellBorder, // Only non-last columns get full borders
          isLastColumn && styles.tableCellLeftBorder // AH column gets left border only
        ]}
      >
        {cell && cell.shifts.length > 0 ? (
          renderShifts(cell.shifts)
        ) : null}
      </View>
    );
  };

  // Render hospital table
  const renderHospitalTable = (hospital: TeamRosterTable) => {
    const isCollapsed = collapsedHospitals.has(hospital.hospital);
    
    // Define shift types in order: ON_CALL should be "On Call", others as is
    const shiftTypeRows: Array<{
      key: "ON_CALL" | "AM" | "PM" | "AH";
      label: string;
      rooms: string[];
    }> = [];

    // Check if we have "On Call" room data
    const hasOnCallRoom = hospital.rooms.some(r => r === "On Call");
    if (hasOnCallRoom) {
      shiftTypeRows.push({
        key: "ON_CALL",
        label: "On Call",
        rooms: ["On Call"]
      });
    }

    // Get all theatre/room rows (exclude "On Call")
    const theatreRooms = hospital.rooms.filter(r => r !== "On Call");
    if (theatreRooms.length > 0) {
      theatreRooms.forEach(room => {
        shiftTypeRows.push({
          key: room as any,
          label: room,
          rooms: [room]
        });
      });
    }

    // Column headers
    const shiftColumns = ["AM", "PM", "AH"];

    return (
      <View key={hospital.hospital} style={styles.hospitalSection}>
        {/* Hospital Header - Collapsible */}
        <Pressable 
          style={styles.campusHeader}
          onPress={() => toggleHospitalCollapse(hospital.hospital)}
        >
          <Ionicons 
            name={isCollapsed ? "chevron-down" : "chevron-up"} 
            size={sx(16)} 
            color={LABEL_COLOR} 
          />
          <Text style={styles.campusTitle}>{hospital.hospital}</Text>
        </Pressable>

        {!isCollapsed && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tableScrollContainer}
            contentContainerStyle={styles.tableScrollContent}
          >
            <View style={styles.tableWrapper}>
              {/* Table Header Row */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.sessionHeaderCell, styles.headerCellLeft, styles.headerCellRight]}>
                  <Text style={styles.headerText}>Session</Text>
                </View>
                {shiftColumns.map((col, index) => (
                  <View 
                    key={col} 
                    style={[
                      index === shiftColumns.length - 1 ? styles.shiftHeaderCellNarrow : styles.shiftHeaderCell,
                      styles.headerCellLeft,
                      index < shiftColumns.length - 1 && styles.headerCellRight // Only non-last columns get right border
                    ]}
                  >
                    <Text style={styles.headerText}>{col}</Text>
                  </View>
                ))}
              </View>

            {/* Table Body - Rows */}
            {shiftTypeRows.map((row, rowIndex) => {
              const isOnCallRow = row.key === "ON_CALL";
              
              return (
                <View 
                  key={`${row.key}-${rowIndex}`} 
                  style={[
                    styles.tableRow,
                    rowIndex === 0 && styles.tableRowFirst
                  ]}
                >
                  {/* Session Column */}
                  <View style={[styles.sessionCell, styles.tableCellBorder]}>
                    <Text style={styles.sessionText}>{row.label}</Text>
                  </View>
                  
                  {/* Data Columns */}
                  {isOnCallRow ? (
                    // On Call row spans all shift columns
                    <View style={styles.onCallCell}>
                      {hospital.cells
                        .filter(c => c.room === "On Call" && c.shiftType === "ON_CALL")
                        .flatMap(c => c.shifts)
                        .map((shift, idx) => (
                          <View 
                            key={`${shift.id}-${idx}`} 
                            style={[
                              styles.shiftGroup,
                              idx > 0 && styles.shiftGroupSpacing
                            ]}
                          >
                            <View style={styles.dutyRow}>
                              <Ionicons name="medical-outline" size={sx(12)} color={BORDER_COLOR} />
                              <Text style={styles.dutyName}>{shift.shiftName}</Text>
                            </View>
                            {renderStaffList(shift.assignedStaff)}
                          </View>
                        ))}
                    </View>
                  ) : (
                    // Theatre rows have individual cells for AM, PM, AH
                    shiftColumns.map((shiftType, colIndex) => 
                      renderTableCell(
                        hospital.cells,
                        row.label,
                        shiftType as "AM" | "PM" | "AH",
                        colIndex === shiftColumns.length - 1,
                        `${row.key}-${shiftType}-${colIndex}`
                      )
                    )
                  )}
                </View>
              );
            })}
            </View>
          </ScrollView>
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
          <Pressable 
            style={styles.dateNavButton}
            onPress={handlePreviousDay}
          >
            <Ionicons name="chevron-back" size={sx(18)} color={COLOR.ink} />
          </Pressable>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Pressable 
            style={styles.dateNavButton}
            onPress={handleNextDay}
          >
            <Ionicons name="chevron-forward" size={sx(18)} color={COLOR.ink} />
          </Pressable>
        </View>

        <Pressable 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}
          >
            <Ionicons 
              name="refresh" 
              size={sx(18)} 
              color={COLOR.ink}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Team Roster Tables */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
        shiftTypeOptions={filterOptions?.shiftTypes || []}
        designationOptions={filterOptions?.designations || []}
      />

      {/* Staff Details Overlay */}
      <StaffDetails
        visible={staffDetailsVisible}
        staff={selectedStaff}
        onClose={handleStaffDetailsClose}
        returnToTab="Roster"
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
    height: sy(48),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(10),
    backgroundColor: "#fff",
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
    gap: sx(8),
  },
  
  dateNavButton: {
    width: sx(32),
    height: sy(32),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: sx(6),
  },
  

  refreshButton: {
    width: sx(36),
    height: sy(36),
    borderRadius: sx(8),
    alignItems: "center",
    justifyContent: "center",
  },

  
  dateText: {
    color: COLOR.ink,
    fontWeight: "600",
  },
  
  
  content: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: sy(16),
  },
  
  hospitalSection: {
    backgroundColor: "#fff",
  },
  
  campusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(4),
    paddingHorizontal: sx(8),
    paddingVertical: sy(8),
    backgroundColor: HEADER_BG,
  },
  
  campusTitle: {
    fontSize: sx(14),
    fontWeight: "400",
    color: LABEL_COLOR,
    textTransform: "uppercase",
  },
  
  tableScrollContainer: {
    flex: 1,
  },

  tableScrollContent: {
    minWidth: '100%',
  },

  tableWrapper: {
    minWidth: sx(600), // Make table wider to enable horizontal scroll
  },
  
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  
  sessionHeaderCell: {
    width: sx(120), // Increased width
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  
  shiftHeaderCell: {
    width: sx(150), // Default width for shift columns
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "center",
    alignItems: "center",
    // Removed borderBottomWidth to prevent double borders with table rows
  },

  shiftHeaderCellNarrow: {
    width: sx(120), // Narrower width for AH column
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "center",
    alignItems: "center",
    // Removed borderBottomWidth to prevent double borders with table rows
  },
  
  headerCellLeft: {
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },

  headerCellRight: {
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  
  headerText: {
    fontSize: sx(10),
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
  },
  
  tableRow: {
    flexDirection: "row",
    minHeight: sy(60),
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },

  tableRowFirst: {
    borderTopWidth: 0,
  },

  
  sessionCell: {
    width: sx(120), // Match header width
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "center",
    alignItems: "center",
  },
  
  sessionText: {
    fontSize: sx(10),
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
  },
  
  onCallCell: {
    width: sx(450), // Wider for On Call content
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },
  
  tableCell: {
    width: sx(150), // Default width for shift columns
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  tableCellNarrow: {
    width: sx(120), // Narrower width for AH column
    paddingVertical: sy(8),
    paddingHorizontal: sx(12),
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  
  tableCellBorder: {
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },

  tableCellLeftBorder: {
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },
  
  shiftGroup: {
    width: "100%",
  },

  shiftGroupSpacing: {
    marginTop: sy(8),
    paddingTop: sy(8),
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  
  dutyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(4),
    marginBottom: sy(4),
  },
  
  dutyName: {
    fontSize: sx(10),
    fontWeight: "400",
    color: "#000",
    flex: 1,
  },
  
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(6),
    marginTop: sy(2),
    paddingVertical: sy(2),
  },
  
  staffAvatar: {
    width: sx(20),
    height: sx(20),
    borderRadius: sx(10),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  
  staffAvatarText: {
    fontSize: sx(8),
    fontWeight: "600",
    color: "#fff",
  },
  
  staffName: {
    fontSize: sx(10),
    fontWeight: "400",
    color: "#000",
    flex: 1,
  },

  // Highlighting styles for filtered staff
  staffAvatarHighlighted: {
    backgroundColor: "#FFD700", // Gold color for highlighting
    borderWidth: 2,
    borderColor: "#FFA500", // Orange border for emphasis
  },

  staffAvatarTextHighlighted: {
    color: "#000", // Black text on gold background
    fontWeight: "700",
  },

  staffNameHighlighted: {
    color: "#FF6B35", // Orange text for highlighted staff names
    fontWeight: "600",
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
