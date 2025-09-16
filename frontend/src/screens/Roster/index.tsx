import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AppBar from "@/components/common/AppBar";
import CollapsibleCalendar from "@/components/calendar/CollapsibleCalendar";
import DayTimeline from "@/components/timeline/DayTimeline";
import WeekTimeline from "@/components/timeline/WeekTimeline"; // ← 新增
import ShiftDetails from "@/components/overlays/ShiftDetails";
import RequestShift from "@/components/overlays/RequestShift";
import RequestLeave from "@/components/overlays/RequestLeave";
import SwapShift from "@/components/overlays/SwapShift";
import TinyMenu from "@/components/overlays/TinyMenu";
import SuccessToast from "@/components/overlays/SuccessToast";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { buildEventsFor, makeDemoShiftMap } from "@/lib/fakeData";
import { EventItem } from "@/types/roster";
import { fmt } from "@/lib/date";

const Tab = createMaterialTopTabNavigator();

function MyRoster() {
  const rootRef = React.useRef<View>(null);               // ← 用来做坐标换算
  const [mode, setMode] = React.useState<"day" | "week">("day");

  const [date, setDate] = React.useState(new Date(2025, 4, 12));
  const shiftMap = React.useMemo(makeDemoShiftMap, []);
  const events = React.useMemo(() => buildEventsFor(date, shiftMap), [date, shiftMap]);

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

  // 所有可交换的员工（示例数据）
  type User = { id: string; name: string; initials: string };
  const allUsers: User[] = [
    { id: "u_cb", name: "Chris Brown", initials: "CB" },
    { id: "u_tv", name: "Thu Vo", initials: "TV" },
    { id: "u_kc", name: "Kathy Chen", initials: "KC" },
    { id: "u_pr", name: "Pristine R.", initials: "PR" },
    { id: "u_jc", name: "Jill C.", initials: "JC" },
  ];
  const busyUserIds: string[] = []; // 先空数组：显示所有人

  // —— Week 相关 —— //
  const startOfWeekMon = (d: Date) => {
    const r = new Date(d); const day = r.getDay(); // 0..6
    const diff = (day === 0 ? -6 : 1 - day);
    r.setDate(r.getDate() + diff); r.setHours(0, 0, 0, 0);
    return r;
  };
  const weekStart = React.useMemo(() => startOfWeekMon(date), [date]);

  // Week 里点击 "+"：切到对应日期再打开 RequestShift
  const openRequestFromWeek = (day: Date, slot: { start: string; end: string }) => {
    setDate(new Date(day)); // 确保 calendar 也指向这一天
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
              : `${fmt(weekStart, { day: "2-digit", month: "short" })} - ${fmt(new Date(weekStart.getTime() + 6*86400000), 
                { day: "2-digit", month: "short", year: "numeric" })}`
          }
          leftAction={{ icon: "menu", onPress: () => setMode(m => (m === "day" ? "week" : "day")) }}
          rightAction={{ icon: "refresh", onPress: () => { /* TODO: 刷新 */ } }} 
          />
      </View>

      {mode === "day" ? (
        <DayTimeline events={events} onOpenDetails={openDetails} onOpenRequest={openRequest} />
      ) : (
        <WeekTimeline
          weekStart={weekStart}
          getEventsFor={(d) => buildEventsFor(d, shiftMap)}
          onOpenDetails={openDetails}
          onOpenRequest={openRequestFromWeek}
        />
      )}

      <ShiftDetails
        visible={detailVisible}
        onClose={closeDetails}
        onPressPlus={({ x, y }) => {
          // window -> 容器坐标（保证 TinyMenu 贴着“+”）
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
        allUsers={allUsers}
        busyUserIds={busyUserIds}
      />

      <SuccessToast visible={toast} text="Successfully submitted" />
    </View>
  );
}

function TeamRoster() { return <View style={styles.body} />; }
function OpenShifts() { return <View style={styles.body} />; }

export default function RosterScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <AppBar />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
          tabBarIndicatorStyle: { backgroundColor: COLOR.brand, height: sy(3), borderRadius: sy(2) },
          tabBarActiveTintColor: COLOR.brand,
          tabBarInactiveTintColor: COLOR.label,
          tabBarLabelStyle: { fontSize: sx(12), fontWeight: "600", textTransform: "none" },
          tabBarStyle: {
            backgroundColor: COLOR.bg, height: sy(48),
            borderBottomColor: COLOR.divider, borderBottomWidth: StyleSheet.hairlineWidth,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
          },
        }}
      >
        <Tab.Screen name="MY ROSTER" component={MyRoster} />
        <Tab.Screen name="TEAM ROSTER" component={TeamRoster} />
        <Tab.Screen name="OPEN SHIFTS" component={OpenShifts} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: COLOR.bg },
  calendarStack: { position: "relative", zIndex: 2, elevation: 4 },
  toolbar: {
    height: sy(40),
    paddingHorizontal: sx(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarTitle: { color: COLOR.ink, fontSize: sx(14), fontWeight: "600" },
});
