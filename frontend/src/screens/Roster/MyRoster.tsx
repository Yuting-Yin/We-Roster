import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import CollapsibleCalendar from "@/components/calendar/CollapsibleCalendar";
import DayTimeline from "@/components/timeline/DayTimeline";
import WeekTimeline from "@/components/timeline/WeekTimeline";
import ShiftDetails from "@/components/overlays/ShiftDetails";
import OpenShiftDetails, { OpenShiftDetail, Coworker } from "@/components/overlays/OpenShiftDetails";
import RequestShift from "@/components/overlays/RequestShift";
import RequestLeave from "@/components/overlays/RequestLeave";
import SwapShift from "@/components/overlays/SwapShift";
import TinyMenu from "@/components/overlays/TinyMenu";
import SuccessToast from "@/components/overlays/SuccessToast";
import { COLOR } from "@/theme/colors";
import { EventItem } from "@/types/roster";
import { fmt } from "@/lib/date";

// users for swap
import { getAvailableUsers, type ApiUser } from "@/api/user";
import { getTeamRoster, type TeamRosterResponse } from "@/api/teamroster";
import { useMyRosterData } from "@/hooks/useMyRoster";
import { useRosterData } from "@/hooks/useRoster";
import { useOpenShiftsWeek } from "@/hooks/useOpenShiftsWeek";
import { useOpenShiftApplication } from "@/hooks/useOpenShifts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAutoCloseOverlays } from "@/hooks/useAutoCloseOverlays";
import { useApprovedLeaves } from "@/hooks/useApprovedLeaves";
import { useOverlayContext } from "@/contexts/OverlayContext";
import type { OpenShiftDto } from "@/api/openshift";

// user infos that only used for UI/SwapShift
type UIUser = { id: string; name: string; initials: string };

export default function MyRoster() {
  const rootRef = useRef<View>(null);
  const [mode, setMode] = useState<"day" | "week">("day");
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Helper function to get start of week (Monday)
  const startOfWeekMon = (d: Date) => {
    const r = new Date(d);
    // Calculate start of current week (Monday)
    // If today is Sunday (0), go back 6 days to get Monday
    // If today is Monday (1), go back 0 days
    // If today is Tuesday (2), go back 1 day
    // etc.
    const dayOfWeek = r.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days back, Monday = 0 days back
    
    r.setDate(r.getDate() - daysToSubtract);
    r.setHours(0, 0, 0, 0);
    
    console.log('🔍 Roster MyRoster week calculation:', {
      today: d.toDateString(),
      dayOfWeek,
      daysToSubtract,
      startOfWeek: r.toDateString()
    });
    
    return r;
  };

  // Use navigation param if provided, otherwise default to today
  const [date, setDate] = useState(() => {
    const selectedDate = route.params?.selectedDate;
    console.log('🔍 Roster - route.params:', route.params);
    console.log('🔍 Roster - selectedDate:', selectedDate);
    const finalDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    console.log('🔍 Roster - finalDate:', finalDate);
    return finalDate;
  });
  
  // Get current user for open shifts
  const { user } = useCurrentUser();
  
  // Use useRosterData for calendar dots (shiftMap) - loads data for entire month range
  const { shiftMap, getEventsForDate: getCalendarEvents, refresh: refreshRoster, loading: calendarLoading, error: calendarError } = useRosterData(date, { mock: false, months: 2 });
  
  // Get approved leaves for calendar highlighting
  const { leaveMap, refresh: refreshLeaves } = useApprovedLeaves();
  
  // Use useMyRosterData for timeline events - loads data for specific day
  const { getEventsForDate, loading: timelineLoading, error: timelineError } = useMyRosterData(date, { mock: false });
  const myShifts = useMemo(() => getEventsForDate(date), [getEventsForDate, date]);
  
  // Get open shifts for the current week
  const weekStartDate = useMemo(() => startOfWeekMon(date), [date]);
  const { openShifts: openShiftsData, loading: openShiftsLoading, error: openShiftsError, refresh: refreshOpenShifts } = useOpenShiftsWeek(weekStartDate, user?.email);
  
  // Convert open shifts to EventItem format and filter for current date
  const openShiftEvents = useMemo(() => {
    const dateKey = date.toISOString().split('T')[0];
    return openShiftsData
      .filter(shift => shift.date === dateKey)
      .map(shift => ({
        id: `openshift-${shift.id}`,
        start: shift.start,
        end: shift.end,
        title: `Open Shift - ${shift.departmentName || 'Available'}`,
        type: shift.session,
        location: shift.locationName || 'Room', // Use room/location name, not hospital name
        role: shift.designationRequirements.length > 0 
          ? shift.designationRequirements.map(r => r.designationName).join(", ")
          : "Any designation",
        teammates: shift.assignedStaff.length > 0 
          ? `${shift.assignedStaff.length} staff assigned`
          : "Currently no staff assigned",
        action: 'plus' as const,
        color: shift.urgentFlag ? COLOR.warn : COLOR.success,
        // Store original shift data for details
        originalOpenShift: shift,
      }));
  }, [openShiftsData, date]);
  
  // Combine regular shifts and open shifts
  // If an open shift has the same time as a regular shift, merge them into ONE card
  // If multiple open shifts have the same time, show only one with a "view more" link
  const events = useMemo(() => {
    const merged: EventItem[] = [];
    const usedOpenShiftIds = new Set<string>();
    
    // Group open shifts by time interval
    const openShiftsByTime = new Map<string, typeof openShiftEvents>();
    openShiftEvents.forEach(os => {
      const timeKey = `${os.start}-${os.end}`;
      if (!openShiftsByTime.has(timeKey)) {
        openShiftsByTime.set(timeKey, []);
      }
      openShiftsByTime.get(timeKey)!.push(os);
    });
    
    // Process regular shifts first
    myShifts.forEach(shift => {
      const timeKey = `${shift.start}-${shift.end}`;
      const matchingOpenShifts = openShiftsByTime.get(timeKey) || [];
      
      if (matchingOpenShifts.length > 0) {
        // Use first open shift for display
        const firstOpenShift = matchingOpenShifts[0];
        matchingOpenShifts.forEach(os => usedOpenShiftIds.add(os.id));
        
        merged.push({
          ...shift,
          hasOpenShift: true,
          openShiftInfo: {
            location: firstOpenShift.location,
            role: firstOpenShift.role,
            teammates: firstOpenShift.teammates,
            color: firstOpenShift.color,
          },
          originalOpenShift: (firstOpenShift as any).originalOpenShift,
          multipleOpenShifts: matchingOpenShifts.length,
          openShiftDate: ((firstOpenShift as any).originalOpenShift?.date) || date.toISOString().split('T')[0],
          hasDualAction: true,
        });
      } else {
        merged.push(shift);
      }
    });
    
    // Add remaining open shifts that didn't match any regular shift
    // Group them by time and show only one per time slot
    const remainingByTime = new Map<string, typeof openShiftEvents>();
    openShiftEvents.forEach(os => {
      if (!usedOpenShiftIds.has(os.id)) {
        const timeKey = `${os.start}-${os.end}`;
        if (!remainingByTime.has(timeKey)) {
          remainingByTime.set(timeKey, []);
        }
        remainingByTime.get(timeKey)!.push(os);
      }
    });
    
    remainingByTime.forEach(shifts => {
      const firstShift = shifts[0];
      merged.push({
        ...firstShift,
        multipleOpenShifts: shifts.length,
        openShiftDate: ((firstShift as any).originalOpenShift?.date) || date.toISOString().split('T')[0],
      });
    });
    
    return merged.sort((a, b) => a.start.localeCompare(b.start));
  }, [myShifts, openShiftEvents, date]);
  
  // Combine loading states and errors
  const loading = calendarLoading || timelineLoading || openShiftsLoading;
  const error = calendarError || timelineError || openShiftsError;
  
  // Only show error if we have no data AND there are errors
  // This prevents showing error messages when some data has loaded successfully
  const hasData = Object.keys(shiftMap).length > 0 || myShifts.length > 0 || Object.keys(openShiftsData).length > 0;
  const shouldShowError = error && !hasData;

  // ===== avaliable users for wsap (api original data) =====
  const [availableUsers, setAvailableUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userErr, setUserErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    setUserErr(null);
    getAvailableUsers()
      .then((users) => {
        if (mounted) setAvailableUsers(users);
      })
      .catch((e) => {
        console.error('🔍 MyRoster - Error loading users:', e);
        if (mounted) setUserErr(e?.message ?? "Failed to load users");
      })
      .finally(() => mounted && (setLoadingUsers(false)));
    return () => { mounted = false; };
  }, []);

  // —— Week related —— //
  const weekStart = React.useMemo(() => startOfWeekMon(date), [date]);

  // overlays
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [detailEvent, setDetailEvent] = React.useState<EventItem | undefined>();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);

  const [openShiftDetailVisible, setOpenShiftDetailVisible] = React.useState(false);
  const [openShiftDetail, setOpenShiftDetail] = React.useState<OpenShiftDetail | undefined>();

  const [reqVisible, setReqVisible] = React.useState(false);
  const [reqSlot, setReqSlot] = React.useState<{ start: string; end: string } | undefined>();

  const [leaveVisible, setLeaveVisible] = React.useState(false);
  const [swapVisible, setSwapVisible] = React.useState(false);

  const [toast, setToast] = React.useState(false);
  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 1800); };
  
  // Open shift application
  const { applyForShift, submitting } = useOpenShiftApplication();

  // Function to get shift data for a specific user on a specific date
  const getShiftForUser = React.useCallback(async (userId: string, targetDate: Date, slot?: { start: string; end: string }): Promise<EventItem | null> => {
    try {
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const teamRoster = await getTeamRoster(dateStr);
      
      // Look for the user in the team roster data
      for (const table of teamRoster.tables) {
        for (const cell of table.cells) {
          for (const shift of cell.shifts) {
            const assignedStaff = shift.assignedStaff.find(staff => staff.id === userId);
            if (assignedStaff) {
              // Found the user's shift
              const startTime = shift.startTime.slice(0, 5); // HH:MM format
              const endTime = shift.endTime.slice(0, 5); // HH:MM format
              
              // Check if this shift overlaps with the requested time slot
              if (slot) {
                const slotStart = slot.start;
                const slotEnd = slot.end;
                
                // Simple overlap check: if either start or end is within the other's range
                const overlaps = (startTime <= slotEnd && endTime >= slotStart);
                if (!overlaps) {
                  continue; // This shift doesn't overlap with the requested slot
                }
              }
              
              // Parse campus and room from shift location
              const { campus, room } = parseCampusAndRoom(shift.shiftName || cell.room);
              
              return {
                id: shift.id,
                start: startTime,
                end: endTime,
                title: `${shift.shiftName || cell.room} - ${table.hospital}`,
                location: cell.room,
                role: assignedStaff.designation,
                teammates: `working with ${shift.assignedStaff.length - 1} others`,
                coworkers: shift.assignedStaff
                  .filter(staff => staff.id !== userId)
                  .map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    initials: staff.initials
                  })),
                action: "arrow",
                campus,
                room,
                campusAddress: table.hospital,
                shiftName: shift.shiftName,
              };
            }
          }
        }
      }
      
      // User not found in any shift for this date
      return null;
    } catch (error) {
      console.error('Error getting shift for user:', error);
      return null;
    }
  }, []);

  // Helper function to parse campus and room from location string
  const parseCampusAndRoom = (location: string): { campus: string; room: string } => {
    if (!location) return { campus: '', room: '' };
    
    // Try to split on common patterns
    const parts = location.split(' - ');
    if (parts.length >= 2) {
      return { campus: parts[0], room: parts[1] };
    }
    
    // If no clear split, assume it's all room
    return { campus: '', room: location };
  };

  // Register overlays with context for auto-close functionality
  const { registerOverlay, unregisterOverlay, requestTeamMemberNav, teamMemberNavRequest, clearTeamMemberNavRequest } = useOverlayContext();
  
  React.useEffect(() => {
    registerOverlay('myroster-detail', () => setDetailVisible(false));
    registerOverlay('myroster-openshift-detail', () => setOpenShiftDetailVisible(false));
    registerOverlay('myroster-menu', () => setMenuVisible(false));
    registerOverlay('myroster-request', () => setReqVisible(false));
    registerOverlay('myroster-leave', () => setLeaveVisible(false));
    registerOverlay('myroster-swap', () => setSwapVisible(false));
    registerOverlay('myroster-toast', () => setToast(false));
    
    return () => {
      unregisterOverlay('myroster-detail');
      unregisterOverlay('myroster-openshift-detail');
      unregisterOverlay('myroster-menu');
      unregisterOverlay('myroster-request');
      unregisterOverlay('myroster-leave');
      unregisterOverlay('myroster-swap');
      unregisterOverlay('myroster-toast');
    };
  }, [registerOverlay, unregisterOverlay]);

  // Auto-close overlays when navigating to other tabs
  useAutoCloseOverlays([
    () => setDetailVisible(false),
    () => setOpenShiftDetailVisible(false),
    () => setMenuVisible(false),
    () => setReqVisible(false),
    () => setLeaveVisible(false),
    () => setSwapVisible(false),
    () => setToast(false)
  ]);

  // Track if we've already restored to prevent multiple restorations
  const [hasRestored, setHasRestored] = useState(false);

  // Restore overlay state when returning from team member navigation
  useEffect(() => {
    if (teamMemberNavRequest?.overlayState && !hasRestored) {
      const { type, event, date: overlayDate } = teamMemberNavRequest.overlayState;
      
      // Only restore if we're currently on the Roster screen
      if (route.name === 'MY ROSTER') {
        if (type === 'shift-details' && event) {
          setDetailEvent(event);
          setDetailVisible(true);
          if (overlayDate) {
            setDate(overlayDate);
          }
          setHasRestored(true);
        } else if (type === 'open-shift-details' && event) {
          setOpenShiftDetail(event);
          setOpenShiftDetailVisible(true);
          if (overlayDate) {
            setDate(overlayDate);
          }
          setHasRestored(true);
        }
      }
    }
    
    // Reset restoration flag when teamMemberNavRequest changes
    if (!teamMemberNavRequest && hasRestored) {
      setHasRestored(false);
    }
  }, [teamMemberNavRequest, route.name, hasRestored]);

  const openDetails = (ev: EventItem) => { 
    // Check if this is an open shift (has action === "plus")
    if (ev.action === 'plus' && (ev as any).originalOpenShift) {
      const shift = (ev as any).originalOpenShift as OpenShiftDto;
      const detail: OpenShiftDetail = {
        id: shift.id.toString(),
        date: shift.date,
        start: shift.start,
        end: shift.end,
        session: shift.session,
        location: shift.locationName || "Unknown",
        hospitalName: shift.hospitalName || "Hospital",
        address: shift.hospitalAddress || "Address not available",
        designation: shift.designationRequirements.length > 0 
          ? shift.designationRequirements.map(r => r.designationName).join(", ")
          : "Any",
        theatre: shift.locationName,
        pay: shift.paymentCents ? shift.paymentCents / 100 : 0,
        urgent: shift.urgentFlag,
        status: shift.status,
        canApply: shift.canApply !== false,
        applicationStatus: shift.applicationStatus,
        assignedStaff: shift.assignedStaff || [],
        requirements: shift.designationRequirements || [],
      };
      setOpenShiftDetail(detail);
      setOpenShiftDetailVisible(true);
    } else {
      setDetailEvent(ev); 
      setDetailVisible(true); 
    }
  };
  
  const closeDetails = () => { setDetailVisible(false); setMenuVisible(false); };

  const openRequest = (ev: EventItem) => { setReqSlot({ start: ev.start, end: ev.end }); setReqVisible(true); };
  
  // Apply for open shift
  const handleApplyOpenShift = async () => {
    if (!openShiftDetail || !user?.email) return;
    
    const result = await applyForShift({ openShiftId: parseInt(openShiftDetail.id), message: "" });
    
    if (result.success) {
      showToast();
      setOpenShiftDetailVisible(false);
      refreshOpenShifts(); // Refresh open shifts data
    } else if (result.error) {
      // Show error toast or handle error
      console.error("Failed to apply for open shift:", result.error);
    }
  };

  // —— API User → UI User —— //
  const initialsOf = (fullName: string) => {
    const parts = (fullName || "").trim().split(/\s+/);
    if (parts.length <= 1) return (parts[0] || "NA").slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const toUIUser = (u: ApiUser): UIUser => {
    const name = (u as any).displayName ?? (u as any).name ?? "";
    return { id: String(u.id), name, initials: initialsOf(name) };
  };
  const availableUIUsers = React.useMemo<UIUser[]>(
    () => {
      return availableUsers.map(toUIUser);
    },
    [availableUsers]
  );

  // Click "+" in Week: switch to the corresponding date and then open RequestShift
  const openRequestFromWeek = (day: Date, slot: { start: string; end: string }) => {
    setDate(new Date(day));
    setReqSlot(slot);
    setReqVisible(true);
  };
  
  // Navigate to Open Shifts page with specific date
  const handleViewMoreOpenShifts = (dateStr: string) => {
    navigation.navigate('OPEN SHIFTS', {
      selectedDate: dateStr,
    });
  };

  return (
    <View ref={rootRef} style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Show error if API call failed */}
      {shouldShowError && (
        <View style={{ padding: 16, backgroundColor: '#ffebee', margin: 16, borderRadius: 8 }}>
          <Text style={{ color: '#c62828', textAlign: 'center' }}>
            Error loading roster: {error}
          </Text>
        </View>
      )}

      <View style={styles.calendarStack}>
        <CollapsibleCalendar
          value={date}
          onChange={setDate}
          shiftMap={shiftMap}
          leaveMap={leaveMap}
          title={
            mode === "day"
              ? `${fmt(date, { weekday: "short" })}, ${fmt(date, { day: "2-digit", month: "long", year: "numeric" })}`
              : `${fmt(weekStart, { day: "2-digit", month: "short" })} - ${fmt(
                  new Date(weekStart.getTime() + 6 * 86400000),
                  { day: "2-digit", month: "short", year: "numeric" }
                )}`
          }
          leftAction={{ icon: "menu", onPress: () => setMode((m) => (m === "day" ? "week" : "day")) }}
          rightAction={{ icon: "refresh", onPress: () => {
            setLoadingUsers(true);
            refreshRoster();
            refreshOpenShifts();
            refreshLeaves();
            getAvailableUsers()
              .then((users) => setAvailableUsers(users))
              .catch((e) => setUserErr(e?.message ?? "Failed to load users"))
              .finally(() => setLoadingUsers(false));
          }}}
        />
      </View>

      {mode === "day" ? (
        <DayTimeline 
          events={events} 
          onOpenDetails={openDetails} 
          onOpenRequest={openRequest}
          onViewMoreOpenShifts={handleViewMoreOpenShifts}
        />
      ) : (
        <WeekTimeline
          weekStart={weekStart}
          selectedDate={date}
          getEventsFor={(d) => {
            // Combine regular shifts and open shifts for the week view
            const regularShifts = getEventsForDate(d);
            const dateKey = d.toISOString().split('T')[0];
            const openShifts = openShiftsData
              .filter(shift => shift.date === dateKey)
              .map(shift => ({
                id: `openshift-${shift.id}`,
                start: shift.start,
                end: shift.end,
                title: `Open Shift - ${shift.departmentName || 'Available'}`,
                type: shift.session,
                location: shift.locationName || 'Room', // Use room/location name, not hospital name
                role: shift.designationRequirements.length > 0 
                  ? shift.designationRequirements.map(r => r.designationName).join(", ")
                  : "Any designation",
                teammates: shift.assignedStaff.length > 0 
                  ? `${shift.assignedStaff.length} staff assigned`
                  : "Currently no staff assigned",
                action: 'plus' as const,
                color: shift.urgentFlag ? COLOR.warn : COLOR.success,
                originalOpenShift: shift,
              }));
            
            // Mark regular shifts as "taken" if there's a matching open shift
            const combined: EventItem[] = [];
            regularShifts.forEach(shift => {
              const matchingOpenShift = openShifts.find(os => 
                os.start === shift.start && os.end === shift.end
              );
              combined.push({
                ...shift,
                isTaken: !!matchingOpenShift,
              });
            });
            
            // Add all open shifts
            combined.push(...openShifts);
            
            return combined.sort((a, b) => {
              const timeCompare = a.start.localeCompare(b.start);
              if (timeCompare !== 0) return timeCompare;
              // Show assigned shifts (arrow) before open shifts (plus) for same time
              if (a.action === 'arrow' && b.action === 'plus') return -1;
              if (a.action === 'plus' && b.action === 'arrow') return 1;
              return 0;
            });
          }}
          onOpenDetails={openDetails}
          onOpenRequest={openRequestFromWeek}
        />
      )}

      <ShiftDetails
        visible={detailVisible}
        onClose={closeDetails}
        onPressPlus={({ x, y }) => {
          rootRef.current?.measureInWindow((rx, ry) => {
            setMenuAnchor({ x: x - rx, y: y - ry });
            setMenuVisible(true);
          });
        }}
        onCoworkerPress={(coworker) => {
          // Navigate to My Team tab and show staff details
          const staffId = parseInt(coworker.id, 10);
          if (!isNaN(staffId)) {
            // Capture current overlay state to restore later
            const overlayState = {
              type: 'shift-details' as const,
              event: detailEvent,
              date: date,
            };
            requestTeamMemberNav(staffId, coworker.name, coworker.initials, "Roster", overlayState);
            navigation.navigate("My Team");
          }
        }}
        date={date}
        event={detailEvent}
      />

      <TinyMenu
        visible={detailVisible && menuVisible}
        anchor={menuAnchor}
        onClose={() => setMenuVisible(false)}
        onRequestLeave={() => { 
          setMenuVisible(false); 
          // Set reqSlot to current shift's times when opening leave request
          if (detailEvent) {
            setReqSlot({ start: detailEvent.start, end: detailEvent.end });
          }
          setLeaveVisible(true); 
        }}
        onSwapShift={() => { setMenuVisible(false); setSwapVisible(true); }}
      />

      <RequestShift
        visible={reqVisible}
        onCancel={() => setReqVisible(false)}
        onSubmitted={() => { setReqVisible(false); showToast(); }}
        date={date}
        slot={reqSlot}
      />

      <RequestLeave
        visible={leaveVisible}
        onCancel={() => setLeaveVisible(false)}
        onSubmitted={() => { 
          setLeaveVisible(false); 
          showToast();
          // Refresh roster data to show the new leave request
          refreshRoster();
        }}
        date={date}
        slot={reqSlot}
        shiftId={detailEvent?.id} // Pass the current shift's ID for Day Leave requests
      />

      <SwapShift
        visible={swapVisible}
        onCancel={() => setSwapVisible(false)}
        onSubmitted={() => { setSwapVisible(false); showToast(); }}
        date={date}
        slot={reqSlot}
        currentEvent={detailEvent}
        availableUsers={availableUIUsers}
        getShiftForUser={getShiftForUser}
        // loading={loadingUsers}
        // error={userErr}
      />

      {/* Open Shift Details Overlay */}
      <OpenShiftDetails
        visible={openShiftDetailVisible}
        shift={openShiftDetail}
        coworkers={openShiftDetail?.assignedStaff || []}
        onClose={() => setOpenShiftDetailVisible(false)}
        onApply={handleApplyOpenShift}
        onCoworkerPress={(coworker) => {
          // Navigate to My Team tab and show staff details
          const staffId = parseInt(coworker.id, 10);
          if (!isNaN(staffId)) {
            // Capture current overlay state to restore later
            const overlayState = {
              type: 'open-shift-details' as const,
              event: openShiftDetail,
              date: date,
            };
            requestTeamMemberNav(staffId, coworker.name, coworker.initials, "Roster", overlayState);
            navigation.navigate("My Team");
          }
        }}
      />

      <SuccessToast visible={toast} text="Successfully submitted" />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarStack: { position: "relative", zIndex: 2, elevation: 4 },
});

