// src/screens/MyTeam/index.tsx
import React, { useState, useMemo, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useFilterMetadata } from "@/hooks/useFilterMetadata";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import TeamFilter, { TeamFilterValue } from "@/components/overlays/TeamFilter";
import StaffDetails, { StaffMember } from "@/components/overlays/StaffDetails";
import type { TeamMember } from "@/api/team";
import { getStaffShifts } from "@/api/team";
import { useNavigation } from "@react-navigation/native";

export default function MyTeam() {
  const { members, loading, error, refresh } = useTeamMembers();
  const { metadata: filterMetadata } = useFilterMetadata();
  const { registerOverlay, unregisterOverlay, teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  const { user: currentUser } = useCurrentUser();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [staffDetailsVisible, setStaffDetailsVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>(undefined);
  const [selectedStaffShiftMap, setSelectedStaffShiftMap] = useState<Record<string, import("@/types/roster").ShiftType | import("@/types/roster").ShiftType[]>>({});
  const [filter, setFilter] = useState<TeamFilterValue>({
    designations: [],
  });

  // Register overlay for auto-close on navigation
  useEffect(() => {
    registerOverlay('myteam-filter', () => setFilterVisible(false));
    registerOverlay('myteam-staff-details', () => setStaffDetailsVisible(false));
    return () => {
      unregisterOverlay('myteam-filter');
      unregisterOverlay('myteam-staff-details');
    };
  }, [registerOverlay, unregisterOverlay]);

  // Listen for navigation requests from other tabs
  useEffect(() => {
    if (teamMemberNavRequest) {
      const { staffId, staffName, staffInitials } = teamMemberNavRequest;
      const member = members.find(m => m.id === staffId);
      
      if (member) {
        // Found the full member, use it
        handleStaffPress(member);
      } else {
        // Member not in list (shouldn't happen), but show what we have
        const initials = staffInitials || staffName.split(' ').map(n => n[0]).join('').toUpperCase();
        handleStaffPress({
          id: staffId,
          name: staffName,
          firstName: staffName.split(' ')[0] || staffName,
          lastName: staffName.split(' ').slice(1).join(' ') || '',
          initials,
          email: '',
        });
      }
    }
  }, [teamMemberNavRequest, members]);

  // Handle return navigation when staff details overlay closes
  const handleStaffDetailsClose = () => {
    setStaffDetailsVisible(false);
    
    // If we came from another tab, navigate back to it
    if (teamMemberNavRequest?.returnToTab) {
      navigation.navigate(teamMemberNavRequest.returnToTab);
    }
    
    // Clear the navigation request after handling the close
    clearTeamMemberNavRequest();
  };

  const handleStaffPress = async (member: TeamMember) => {
    try {
      // Set staff info immediately
      setSelectedStaff({
        id: member.id,
        name: member.name,
        initials: member.initials,
        email: member.email,
        phone: member.phone,
        designation: member.designation,
        accreditation: member.accreditation,
      });
      
      // Open overlay with loading state
      setSelectedStaffShiftMap({});
      setStaffDetailsVisible(true);
      
      // Fetch real shift data from backend
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      
      const shiftsData = await getStaffShifts(member.id, startDate, 2);
      
      // Convert backend format (date -> string[]) to component format (date -> ShiftType | ShiftType[])
      const shiftMap: Record<string, import("@/types/roster").ShiftType | import("@/types/roster").ShiftType[]> = {};
      Object.entries(shiftsData.shiftMap).forEach(([date, types]) => {
        if (types.length === 1) {
          shiftMap[date] = types[0] as import("@/types/roster").ShiftType;
        } else if (types.length > 1) {
          shiftMap[date] = types as import("@/types/roster").ShiftType[];
        }
      });
      
      setSelectedStaffShiftMap(shiftMap);
    } catch (error) {
      console.error("Failed to fetch staff shifts:", error);
      // Still show the overlay even if shift fetch fails
    }
  };

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let result = members;

    // Apply designation filter
    if (filter.designations.length > 0) {
      result = result.filter(m => 
        m.designation && filter.designations.includes(m.designation)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        (m.email?.toLowerCase().includes(query)) ||
        (m.designation?.toLowerCase().includes(query)) ||
        (m.accreditation?.toLowerCase().includes(query))
      );
    }

    // Sort: current user at the top, rest alphabetically
    return result.sort((a, b) => {
      const currentStaffId = currentUser?.staffId;
      const isACurrentUser = currentStaffId && a.id === currentStaffId;
      const isBCurrentUser = currentStaffId && b.id === currentStaffId;
      
      // Current user always comes first
      if (isACurrentUser) return -1;
      if (isBCurrentUser) return 1;
      
      // Sort rest alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [members, filter, searchQuery, currentUser?.staffId]);

  const renderMember = ({ item }: { item: TeamMember }) => {
    // Check if this is the current user (match by staff ID)
    const currentStaffId = currentUser?.staffId;
    const isCurrentUser = currentStaffId && item.id === currentStaffId;
    
    return (
      <Pressable 
        style={[styles.memberCard, isCurrentUser && styles.memberCardCurrent]}
        onPress={() => handleStaffPress(item)}
        android_ripple={{ color: "#f0f0f0" }}
      >
        <View style={[styles.avatar, isCurrentUser && styles.avatarCurrent]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>You</Text>
              </View>
            )}
          </View>
          {item.designation && (
            <View style={styles.designationRow}>
              <Ionicons name="briefcase-outline" size={sx(14)} color={COLOR.label} />
              <Text style={styles.designation}>{item.designation}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={sx(20)} color={COLOR.label} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
        <Pressable onPress={() => {}} hitSlop={8}>
          <Ionicons name="notifications-outline" size={sx(24)} color="#fff" />
        </Pressable>
      </View>

      {/* Toolbar with filter and search */}
      <View style={styles.toolbar}>
        <Pressable 
          style={styles.iconBtn} 
          onPress={() => setFilterVisible(true)} 
          android_ripple={{ color: "#eaeaea" }}
        >
          <Ionicons name="options-outline" size={sx(18)} color={COLOR.ink} />
        </Pressable>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={sx(18)} color={COLOR.label} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, designation..."
            placeholderTextColor={COLOR.label}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={sx(18)} color={COLOR.label} />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.iconBtn} onPress={refresh} android_ripple={{ color: "#eaeaea" }}>
          {loading ? (
            <ActivityIndicator size="small" color={COLOR.brand} />
          ) : (
            <Ionicons name="refresh" size={sx(18)} color={COLOR.ink} />
          )}
        </Pressable>
      </View>

      {/* Members list */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={COLOR.brand} />
                <Text style={styles.emptyText}>Loading team members...</Text>
              </>
            ) : error ? (
              <>
                <Ionicons name="alert-circle-outline" size={sx(48)} color={COLOR.warn} />
                <Text style={styles.emptyText}>{error}</Text>
                <Pressable onPress={refresh} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Ionicons name="people-outline" size={sx(48)} color={COLOR.label} />
                <Text style={styles.emptyText}>No team members found</Text>
              </>
            )}
          </View>
        }
      />

      {/* Filter Overlay */}
      <TeamFilter
        visible={filterVisible}
        value={filter}
        onChange={setFilter}
        onApply={() => setFilterVisible(false)}
        onClear={() => setFilter({ designations: [] })}
        onClose={() => setFilterVisible(false)}
        designationOptions={filterMetadata.designations}
      />

      {/* Staff Details Overlay */}
      <StaffDetails
        visible={staffDetailsVisible}
        staff={selectedStaff}
        shiftMap={selectedStaffShiftMap}
        onClose={handleStaffDetailsClose}
        returnToTab={teamMemberNavRequest?.returnToTab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLOR.brand,
    paddingVertical: sy(16),
    paddingHorizontal: sx(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { color: "#fff", fontSize: sx(20) },
  
  toolbar: {
    height: sy(56),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sx(10),
    gap: sx(8),
    backgroundColor: "#fff",
  },
  iconBtn: { 
    width: sx(36), 
    height: sy(36), 
    borderRadius: sx(8), 
    alignItems: "center", 
    justifyContent: "center" 
  },
  searchContainer: {
    flex: 1,
    height: sy(40),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.bg,
    borderRadius: sx(8),
    paddingHorizontal: sx(12),
    gap: sx(8),
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: sx(14),
    color: COLOR.ink,
    padding: 0,
  },
  
  list: { padding: sx(12) },
  
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: sx(12),
    padding: sx(14),
    marginBottom: sy(10),
    borderWidth: 1,
    borderColor: COLOR.divider,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  memberCardCurrent: {
    borderWidth: 2,
    borderColor: COLOR.brand,
    backgroundColor: COLOR.brand + "08",
  },
  avatar: {
    width: sx(48),
    height: sy(48),
    borderRadius: sx(24),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(12),
  },
  avatarCurrent: {
    borderWidth: 2,
    borderColor: COLOR.brand,
    backgroundColor: COLOR.brand,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: sx(16) },
  memberInfo: { flex: 1, gap: sy(4) },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(8),
  },
  memberName: { color: COLOR.ink, fontWeight: "600", fontSize: sx(15) },
  youBadge: {
    backgroundColor: COLOR.brand,
    paddingHorizontal: sx(8),
    paddingVertical: sy(2),
    borderRadius: sx(12),
  },
  youBadgeText: {
    color: "#fff",
    fontSize: sx(11),
    fontWeight: "700",
  },
  designationRow: { flexDirection: "row", alignItems: "center", gap: sx(6) },
  designation: { color: COLOR.label, fontSize: sx(13) },
  
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
  retryBtn: {
    marginTop: sy(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(8),
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

