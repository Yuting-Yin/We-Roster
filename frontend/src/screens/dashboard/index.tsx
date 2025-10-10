// src/screens/Dashboard/index.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { SafeAreaView, ScrollView, RefreshControl, View, Pressable, FlatList } from "react-native";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";

import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import ProfileSideMenu from "@/components/overlays/ProfileSideMenu";
import { useDashboardData } from "@/hooks/useDashboard";
import { useMyLeaves } from "@/hooks/useMyLeaves";
import { useAuth } from "@/contexts/AuthContext";
import { useDutyAssignments } from "@/hooks/useDutyAssignments";
import type { DutyItem, ShiftItem, LeaveItem } from "@/types/dashboard";
import type { DutyAssignmentData } from "@/api/duty";

import { styles } from "./styles";
import { Section } from "./components/Section";
import { Header } from "./components/Header";
import { ErrorBanner } from "./components/ErrorBanner";
import { PaginationDots } from "./components/PaginationDots";

import { DutyCard } from "./components/cards/DutyCard";
import { ShiftCard } from "./components/cards/ShiftCard";
import { LeaveCard } from "./components/cards/LeaveCard";
import TeamMemberProfile from "@/components/overlays/TeamMemberProfile";

import { DutyCardSkeleton } from "./components/skeletons/DutyCardSkeleton";
import { ShiftCardSkeleton } from "./components/skeletons/ShiftCardSkeleton";
import { LeaveCardSkeleton } from "./components/skeletons/LeaveCardSkeleton";

import { placeholderArray } from "./utils/placeholder";
import { useHorizontalSnapProps } from "./utils/useHorizontalSnap";
import { LEFT_PAD } from "./constants";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMyRosterData } from "@/hooks/useMyRoster";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { useOpenShiftsWeek } from "@/hooks/useOpenShiftsWeek";
import { fmt } from "@/lib/date";
import { useNotificationContext } from "@/contexts/NotificationContext";

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [sideVisible, setSideVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DutyAssignmentData | null>(null);

  // Register overlays with context for auto-close functionality
  const { registerOverlay, unregisterOverlay } = useOverlayContext();
  
  React.useEffect(() => {
    registerOverlay('dashboard-side', () => setSideVisible(false));
    registerOverlay('dashboard-profile', () => setProfileVisible(false));
    
    return () => {
      unregisterOverlay('dashboard-side');
      unregisterOverlay('dashboard-profile');
    };
  }, [registerOverlay, unregisterOverlay]);

  // Auto-close overlays when navigating to other tabs
  useAutoCloseOverlays([
    () => setSideVisible(false),
    () => setProfileVisible(false)
  ]);

  // Handle shift card press - navigate to Roster page with specific date
  const handleShiftPress = (shift: any) => {
    
    // Navigate to Roster tab with the shift's date
    navigation.navigate('Roster', { 
      selectedDate: shift.eventDate // Pass the date from the shift
    });
  };

  // Handle leave card press - navigate to My Request with leave details
  const handleLeavePress = (leave: LeaveItem) => {
    // Navigate to My Request tab
    navigation.navigate('My Request');
    
    // Determine which sub-page to show based on leave state
    const subPage = leave.state === 'Approved' || leave.state === 'APPROVED' ? 'HISTORY' : 'IN ACTION';
    
    // Navigate to the specific sub-page
    setTimeout(() => {
      navigation.navigate('My Request', { 
        screen: subPage,
        params: { 
          showLeaveDetail: true, 
          leaveId: leave.id,
          leaveData: leave 
        }
      });
    }, 100); // Small delay to ensure tab navigation completes first
  };

  // Handle duty card press - show team member profile
  const handleDutyPress = (dutyItem: DutyItem) => {
    // Find the corresponding duty assignment data
    const assignment = dutyAssignments.find(a => a.staffId === dutyItem.id);
    if (assignment) {
      setSelectedMember(assignment);
      setProfileVisible(true);
    }
  };

  // Handle "View My Team" button press - navigate to Team Roster
  const handleViewMyTeam = () => {
    navigation.navigate('Roster', { screen: 'TEAM ROSTER' });
  };

  // Get current user info (connected to backend database)
  const { firstName, displayName, initials, email, user } = useCurrentUser({mock: false});
  
  // Get leaves without month filter - will be filtered in the hook
  const { leaves, loading: leavesLoading, error: leavesError, refresh: refreshLeaves } = useMyLeaves(undefined, { mock: false });
  
  // Real data for "Who's on duty" section
  const { assignments: dutyAssignments, loading: dutyLoading, error: dutyError, refresh: refreshDuty } = useDutyAssignments();
  
  // Convert duty assignments to DutyItem format for compatibility
  const duty: DutyItem[] = dutyAssignments.map(assignment => ({
    id: assignment.staffId,
    initials: assignment.staffInitials,
    name: assignment.staffName,
    role: assignment.staffDesignation,
    theatre: assignment.locationName,
    site: assignment.hospitalName,
    time: assignment.shiftTime,
    date: assignment.shiftDate,
  }));
  
  const loading = dutyLoading;
  const error = dutyError;
  const refresh = refreshDuty;

  // Refresh data once when dashboard screen comes into focus
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [shouldResetScroll, setShouldResetScroll] = useState(false);
  
  useFocusEffect(
    React.useCallback(() => {
      if (!hasRefreshed) {
        refreshLeaves();
        refresh();
        setHasRefreshed(true);
      } else {
        // Always refresh leave data when returning to dashboard to show new submissions
        refreshLeaves();
      }
      
      // Reset all card positions to first card (leftmost) when returning to dashboard
      setDutyIdx(0);
      setMyShiftIdx(0);
      setOpenShiftIdx(0);
      setLeaveIdx(0);
      setShouldResetScroll(true);
      
      // Reset vertical scroll to top
      mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [refreshLeaves, refresh, hasRefreshed])
  );


  // Get current user's shifts (use real data from backend)
  // Use a stable date to prevent re-loading on every render
  const [weekStartDate] = useState(() => {
    const today = new Date();
    // Calculate start of current week (Monday) using UTC to avoid timezone issues
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const date = today.getUTCDate();
    const dayOfWeek = today.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days back, Monday = 0 days back
    
    const startOfWeek = new Date(Date.UTC(year, month, date - daysToSubtract, 0, 0, 0, 0));
    
    return startOfWeek;
  });
  
  // Load entire week's data once
  const [weekEvents, setWeekEvents] = useState<Record<string, any[]>>({});
  const [weekLoading, setWeekLoading] = useState(true);
  const [weekError, setWeekError] = useState<string | null>(null);

  // Load all days of the current week using single API call
  useEffect(() => {
    const loadWeekData = async () => {
      setWeekLoading(true);
      setWeekError(null);
      
      try {
        // Use the same approach as useMyRosterData - single API call for multiple days
        const { fetchJson } = await import('@/lib/api');
        
        // Use the same approach as useMyRosterData - single API call for multiple days
        const monthAnchorDate = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), 1);
        const params = new URLSearchParams({
          month: monthAnchorDate.toISOString().slice(0, 7), // YYYY-MM format
          months: '2', // Load 2 months of data (same as Roster page)
        });
        
        
        const res = await fetchJson<{
          events?: Record<string, any[] | undefined>;
          shiftMap?: Record<string, string>;
        }>(`/api/v1/myroster/roster?${params.toString()}`);


        // Filter events to only include the current week
        const weekData: Record<string, any[]> = {};
        
        // Calculate the end of the current week (Sunday) using UTC
        const weekEndDate = new Date(Date.UTC(
          weekStartDate.getUTCFullYear(),
          weekStartDate.getUTCMonth(),
          weekStartDate.getUTCDate() + 6,
          0, 0, 0, 0
        ));
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(Date.UTC(
            weekStartDate.getUTCFullYear(),
            weekStartDate.getUTCMonth(),
            weekStartDate.getUTCDate() + i,
            0, 0, 0, 0
          ));
          const dateKey = date.toISOString().split('T')[0];
          
          // Double-check that this date is actually within the current week
          if (date >= weekStartDate && date <= weekEndDate && res.events && res.events[dateKey]) {
            // Convert raw shift data to events format
            const events = res.events[dateKey].map((shift: any) => {
              // Handle overnight shifts properly
              const startTime = shift.startTs.split('T')[1].substring(0, 5); // "16:00"
              const endTime = shift.endTs.split('T')[1].substring(0, 5); // "00:00"
              
              // Check if this is an overnight shift (end time is earlier than start time)
              const isOvernight = endTime < startTime;
              
              return {
                id: shift.id.toString(),
                start: startTime,
                end: endTime,
                isOvernight: isOvernight, // Add flag for overnight shifts
                title: `${shift.type} Shift - ${shift.dept}`,
                type: shift.type,
                location: `${shift.location}`,
                role: shift.role,
                teammates: shift.teammates && shift.teammates.length > 0 
                  ? `working with ${shift.teammates.length} others`
                  : 'working alone',
                action: 'arrow',
                campus: shift.campus,
                room: shift.room,
                campusAddress: shift.campusAddress,
                // Convert teammates to coworkers format for ShiftDetails
                coworkers: shift.teammates ? shift.teammates.map((teammate: any) => ({
                  id: teammate.staffId.toString(),
                  name: teammate.staffName,
                  initials: teammate.staffInitials
                })) : []
              };
            });
            
            weekData[dateKey] = events;
          } else {
            weekData[dateKey] = [];
          }
        }
        
        setWeekEvents(weekData);
      } catch (error) {
        console.error('Failed to load week data:', error);
        setWeekError(error instanceof Error ? error.message : 'Failed to load shifts');
      } finally {
        setWeekLoading(false);
      }
    };

    loadWeekData();
  }, [weekStartDate]); // Only load once when component mounts

  // Convert week events to shift items for "My shifts this week"
  const myShifts = useMemo(() => {
    if (!weekEvents) return [];
    
    const weekShifts: any[] = [];
    
    // Calculate the end of the current week (Sunday) for validation using UTC
    const weekEndDate = new Date(Date.UTC(
      weekStartDate.getUTCFullYear(),
      weekStartDate.getUTCMonth(),
      weekStartDate.getUTCDate() + 6,
      0, 0, 0, 0
    ));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.UTC(
        weekStartDate.getUTCFullYear(),
        weekStartDate.getUTCMonth(),
        weekStartDate.getUTCDate() + i,
        0, 0, 0, 0
      ));
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = weekEvents[dateKey] || [];
      
      console.log(`🔍 Processing day ${i}: ${date.toDateString()} (${dateKey}) - ${dayEvents.length} events`);
      
      // Validate that this date is within the current week
      if (date >= weekStartDate && date <= weekEndDate) {
        dayEvents.forEach(event => {
        if (event && event.id) {
          // Format date for display using the same approach as Roster page
          const dateObj = new Date(dateKey + 'T00:00:00'); // Add time to avoid timezone issues
          const formattedDate = fmt(dateObj, { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          console.log(`🔍 Adding shift: ${formattedDate} (${dateKey}) - ${event.start} to ${event.end}`);
          
          weekShifts.push({
            id: event.id,
            date: formattedDate,
            time: event.isOvernight ? `${event.start} - ${event.end} (+1)` : `${event.start} - ${event.end}`,
            site: event.campus || 'Main Campus',
            dept: event.role || 'Emergency Department',
            teammates: event.teammates,
            urgent: false,
            // Store original event data for navigation
            originalEvent: event,
            // Store the actual date for proper date handling
            eventDate: dateKey
          });
        }
      });
      } // Close the if statement for date validation
    }
    
    return weekShifts;
  }, [weekEvents, weekStartDate]);

  // Get open shifts for the current week (real data from backend)
  const { openShifts: openShiftsData, loading: openShiftsLoading, error: openShiftsError, refresh: refreshOpenShifts } = 
    useOpenShiftsWeek(weekStartDate, user?.email);

  // Get notification unread count for bell icon
  const { unreadCount } = useNotificationContext();

  // Convert open shifts to display format and sort by date (Monday to Sunday)
  const openShiftsFormatted = useMemo(() => {
    // Calculate the end of the current week (Sunday) for validation using UTC
    const weekEndDate = new Date(Date.UTC(
      weekStartDate.getUTCFullYear(),
      weekStartDate.getUTCMonth(),
      weekStartDate.getUTCDate() + 6,
      0, 0, 0, 0
    ));
    
    // Filter shifts to only include current week using UTC comparisons
    const currentWeekShifts = openShiftsData.filter(shift => {
      const shiftDate = new Date(shift.date + 'T00:00:00.000Z'); // Parse as UTC
      const isInCurrentWeek = shiftDate >= weekStartDate && shiftDate <= weekEndDate;
      return isInCurrentWeek;
    });
    
    // First, sort the shifts by date chronologically
    const sortedShifts = [...currentWeekShifts].sort((a, b) => {
      // Compare dates, then start times
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start.localeCompare(b.start);
    });
    
    return sortedShifts.map(shift => {
      const dateObj = new Date(shift.date + 'T00:00:00');
      const formattedDate = fmt(dateObj, { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      
      return {
        id: shift.id.toString(),
        date: formattedDate,
        time: `${shift.start} - ${shift.end}`,
        site: shift.hospitalName || 'Unknown Hospital',
        dept: shift.designationRequirements.length > 0 
          ? shift.designationRequirements.map(r => r.designationName).join(", ")
          : "Any designation",
        teammates: shift.assignedStaff.length > 0 
          ? `${shift.assignedStaff.length} staff assigned`
          : "Currently no staff assigned",
        bonus: shift.formattedPayment,
        urgent: shift.urgentFlag,
        // Store original shift data
        originalShift: shift,
        eventDate: shift.date,
        shiftId: shift.id // Store shift ID for navigation
      };
    });
  }, [openShiftsData]);

  // Reset scroll positions when data changes (after data is loaded)
  useEffect(() => {
    const resetScrollPositions = () => {
      setTimeout(() => {
        if (duty.length > 0) {
          try {
            dutyFlatListRef.current?.scrollToIndex({ index: 16, animated: true, viewPosition: 0 });
          } catch (error) {
            dutyFlatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }
        if (myShifts.length > 0) {
          try {
            myShiftFlatListRef.current?.scrollToIndex({ index: 16, animated: true, viewPosition: 0 });
          } catch (error) {
            myShiftFlatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }
        if (openShiftsFormatted.length > 0) {
          try {
            openShiftFlatListRef.current?.scrollToIndex({ index: 16, animated: true, viewPosition: 0 });
          } catch (error) {
            openShiftFlatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }
        if (leaves.length > 0) {
          try {
            leaveFlatListRef.current?.scrollToIndex({ index: 16, animated: true, viewPosition: 0 });
          } catch (error) {
            leaveFlatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }, 300);
    };

    // Only reset when we have data, are not loading, and should reset scroll
    if (!loading && !weekLoading && !openShiftsLoading && !leavesLoading && shouldResetScroll) {
      resetScrollPositions();
      setShouldResetScroll(false); // Reset the flag after scrolling
    }
  }, [duty.length, myShifts.length, openShiftsFormatted.length, leaves.length, loading, weekLoading, openShiftsLoading, leavesLoading, shouldResetScroll]);

  const [dutyIdx, setDutyIdx] = useState(0);
  const [myShiftIdx, setMyShiftIdx] = useState(0);
  const [openShiftIdx, setOpenShiftIdx] = useState(0);
  const [leaveIdx, setLeaveIdx] = useState(0);

  // Refs to control FlatList scroll positions
  const dutyFlatListRef = useRef<FlatList<DutyItem>>(null);
  const myShiftFlatListRef = useRef<FlatList<ShiftItem>>(null);
  const openShiftFlatListRef = useRef<FlatList<any>>(null);
  const leaveFlatListRef = useRef<FlatList<LeaveItem>>(null);
  
  // Ref to control main ScrollView position
  const mainScrollViewRef = useRef<ScrollView>(null);

  const dutySnap = useHorizontalSnapProps<DutyItem>(setDutyIdx);
  const myShiftSnap = useHorizontalSnapProps<ShiftItem>(setMyShiftIdx);
  const openShiftSnap = useHorizontalSnapProps<any>(setOpenShiftIdx);
  const leaveSnap = useHorizontalSnapProps<LeaveItem>(setLeaveIdx);

  // Handle open shift card press - navigate to OpenShifts tab with the specific date
  const handleOpenShiftPress = (shift: any) => {
    // Navigate to Roster tab and OPEN SHIFTS screen with the shift's date
    // Note: The screen name is "OPEN SHIFTS" (uppercase with space) as defined in Roster/index.tsx
    navigation.navigate('Roster', { 
      screen: 'OPEN SHIFTS',
      params: {
        selectedDate: shift.eventDate, // Pass the shift date
        highlightShiftId: shift.shiftId // Pass the shift ID to highlight
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        name={firstName}
        onHelloPress={() => setSideVisible(true)}
        onBellPress={() => navigation.navigate("Notifications")}
        unreadCount={unreadCount}
      />

      <ScrollView
        ref={mainScrollViewRef}
        contentContainerStyle={{ paddingBottom: sy(8) }}
        refreshControl={
          <RefreshControl 
            refreshing={!!loading} 
            onRefresh={() => {
              refresh();
              // Reset card positions when user manually refreshes
              setDutyIdx(0);
              setMyShiftIdx(0);
              setOpenShiftIdx(0);
              setLeaveIdx(0);
              setShouldResetScroll(true);
              
              // Reset vertical scroll to top
              mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }} 
            tintColor={COLOR.brand} 
            colors={[COLOR.brand]} 
          />
        }
      >
        {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

        {/* Real "Who's on duty" section with backend data */}
        <Section title={`Who's on duty (${duty.length})`} actionLabel="View My Team" onAction={handleViewMyTeam}
          data={loading && duty.length === 0 ? placeholderArray<DutyItem>(3) : duty}
          keyExtractor={(i, idx) => (i?.id ?? `duty-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <DutyCard item={item} onPress={() => handleDutyPress(item)} /> : <DutyCardSkeleton />)}
          flatListProps={dutySnap}
          footer={<PaginationDots count={Math.max(duty.length, loading ? 3 : 0)} index={dutyIdx} />}
          emptyText="No team members on duty"
          flatListRef={dutyFlatListRef}
        />

        {/* Real data: Current user's shift assignments this week */}
        <Section title={`My shifts this week (${myShifts.length})`} actionLabel="View All" 
          onAction={() => navigation.navigate('Roster', { screen: 'MY ROSTER' })}
          data={weekLoading && myShifts.length === 0 ? placeholderArray<ShiftItem>(3) : myShifts}
          keyExtractor={(i, idx) => (i?.id ?? `myshift-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <ShiftCard item={item} onPress={() => handleShiftPress(item)} /> : <ShiftCardSkeleton />)}
          flatListProps={myShiftSnap}
          footer={<PaginationDots count={Math.max(myShifts.length, weekLoading ? 3 : 0)} index={myShiftIdx} />}
          emptyText="No shifts scheduled this week"
          flatListRef={myShiftFlatListRef}
        />

        {/* Real data: Available open shifts this week */}
        <Section title={`Open shifts this week (${openShiftsFormatted.length})`} actionLabel="View All" 
          onAction={() => navigation.navigate('Roster', { screen: 'OPEN SHIFTS' })}
          data={openShiftsLoading && openShiftsFormatted.length === 0 ? placeholderArray<any>(3) : openShiftsFormatted}
          keyExtractor={(i, idx) => (i?.id ?? `openshift-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <ShiftCard item={item} onPress={() => handleOpenShiftPress(item)} /> : <ShiftCardSkeleton />)}
          flatListProps={openShiftSnap}
          footer={<PaginationDots count={Math.max(openShiftsFormatted.length, openShiftsLoading ? 3 : 0)} index={openShiftIdx} />}
          emptyText="No open shifts available this week"
          flatListRef={openShiftFlatListRef}
        />

        {/* Real data: Current user's leave requests this month */}
        <Section title={`My leaves this month (${leaves.length})`} actionLabel="View All" 
          onAction={() => navigation.navigate('My Request')}
          data={leavesLoading && leaves.length === 0 ? placeholderArray<LeaveItem>(3) : leaves}
          keyExtractor={(i, idx) => String(i?.id ?? `leave-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <LeaveCard item={item} onPress={() => handleLeavePress(item)} /> : <LeaveCardSkeleton />)}
          flatListProps={leaveSnap}
          footer={<PaginationDots count={Math.max(leaves.length, leavesLoading ? 3 : 0)} index={leaveIdx} />}
          emptyText="No leave requests this month"
          flatListRef={leaveFlatListRef}
        />
      </ScrollView>

      <ProfileSideMenu
        visible={sideVisible}
        onClose={() => setSideVisible(false)}
        onPressAvatar={() => {
          setSideVisible(false);
          navigation.navigate("Profile");
        }}
        onPressSettings={() => {
          setSideVisible(false);
          navigation.navigate("Settings");
        }}
        onPressLogout={async () => {
          setSideVisible(false);
          await logout(); // Clear token from storage
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
        }}
        user={{ 
          initials: user?.initials || initials, 
          name: user?.name || displayName, 
          email: user?.email || email 
        }}
      />

      {/* Team Member Profile Overlay */}
      <TeamMemberProfile
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        member={selectedMember}
      />

    </SafeAreaView>
  );
}
