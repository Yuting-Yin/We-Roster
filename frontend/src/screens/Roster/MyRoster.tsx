import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import CollapsibleCalendar from "@/components/calendar/CollapsibleCalendar";
import DayTimeline from "@/components/timeline/DayTimeline";
import WeekTimeline from "@/components/timeline/WeekTimeline";
import ShiftDetails from "@/components/overlays/ShiftDetails";
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
import { useRosterData } from "@/hooks/useRoster";

// user infos that only used for UI/SwapShift
type UIUser = { id: string; name: string; initials: string };

export default function MyRoster() {
  const rootRef = React.useRef<View>(null);
  const [mode, setMode] = React.useState<"day" | "week">("day");

  // Default to today
  const [date, setDate] = React.useState(new Date());
  // TODO: Remove mock flag once roster API is connected.
  const { shiftMap, getEventsForDate, refresh: refreshRoster } = useRosterData(date, { mock: true });
  const events = React.useMemo(() => getEventsForDate(date), [getEventsForDate, date]);

  // ===== avaliable users for wsap (api original data) =====
  const [availableUsers, setAvailableUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userErr, setUserErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    setUserErr(null);
    getAvailableUsers()
      .then((users) => mounted && setAvailableUsers(users))
      .catch((e) => mounted && setUserErr(e?.message ?? "Failed to load users"))
      .finally(() => mounted && (setLoadingUsers(false)));
    return () => { mounted = false; };
  }, []);

  // —— Week related —— //
  const startOfWeekMon = (d: Date) => {
    const r = new Date(d);
    const day = r.getDay(); // 0..6
    const diff = day === 0 ? -6 : 1 - day;
    r.setDate(r.getDate() + diff);
    r.setHours(0, 0, 0, 0);
    return r;
  };
  const weekStart = React.useMemo(() => startOfWeekMon(date), [date]);

  // overlays
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [detailEvent, setDetailEvent] = React.useState<EventItem | undefined>();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);

  const [reqVisible, setReqVisible] = React.useState(false);
  const [reqSlot, setReqSlot] = React.useState<{ start: string; end: string } | undefined>();

  const [leaveVisible, setLeaveVisible] = React.useState(false);
  const [swapVisible, setSwapVisible] = React.useState(false);

  const [toast, setToast] = React.useState(false);
  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 1800); };

  const openDetails = (ev: EventItem) => { setDetailEvent(ev); setDetailVisible(true); };
  const closeDetails = () => { setDetailVisible(false); setMenuVisible(false); };

  const openRequest = (ev: EventItem) => { setReqSlot({ start: ev.start, end: ev.end }); setReqVisible(true); };

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
    () => availableUsers.map(toUIUser),
    [availableUsers]
  );

  // Click "+" in Week: switch to the corresponding date and then open RequestShift
  const openRequestFromWeek = (day: Date, slot: { start: string; end: string }) => {
    setDate(new Date(day));
    setReqSlot(slot);
    setReqVisible(true);
  };

  return (
    <View ref={rootRef} style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <View style={styles.calendarStack}>
        <CollapsibleCalendar
          value={date}
          onChange={setDate}
          shiftMap={shiftMap}
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
            getAvailableUsers()
              .then((users) => setAvailableUsers(users))
              .catch((e) => setUserErr(e?.message ?? "Failed to load users"))
              .finally(() => setLoadingUsers(false));
          }}}
        />
      </View>

      {mode === "day" ? (
        <DayTimeline events={events} onOpenDetails={openDetails} onOpenRequest={openRequest} />
      ) : (
        <WeekTimeline
          weekStart={weekStart}
          selectedDate={date}
          getEventsFor={(d) => getEventsForDate(d)}
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
        date={date}
        event={detailEvent}
      />

      <TinyMenu
        visible={detailVisible && menuVisible}
        anchor={menuAnchor}
        onClose={() => setMenuVisible(false)}
        onRequestLeave={() => { setMenuVisible(false); setLeaveVisible(true); }}
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
        onSubmitted={() => { setLeaveVisible(false); showToast(); }}
        date={date}
        slot={reqSlot}
      />

      <SwapShift
        visible={swapVisible}
        onCancel={() => setSwapVisible(false)}
        onSubmitted={() => { setSwapVisible(false); showToast(); }}
        date={date}
        slot={reqSlot}
        availableUsers={availableUIUsers}
        // loading={loadingUsers}
        // error={userErr}
      />

      <SuccessToast visible={toast} text="Successfully submitted" />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarStack: { position: "relative", zIndex: 2, elevation: 4 },
});

