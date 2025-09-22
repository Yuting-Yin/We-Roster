// src/screens/Dashboard/index.tsx
import React, { memo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import type { ViewToken } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import ProfileSideMenu from "@/components/overlays/ProfileSideMenu"; // ← 左侧抽屉 Overlay

const IS_WEB = Platform.OS === "web";

/** ======= 尺寸常量（全部整数，避免 Web 断言问题） ======= */
const CARD_W = Math.round(sx(280));
const CARD_GAP = Math.round(sx(16));
const LEFT_PAD = Math.round(sx(16));
const SNAP = CARD_W + CARD_GAP;
const INITIALS_SIZE = Math.round(sx(70));

/** ======= data types ======= */
type DutyItem = {
  id: string;
  initials: string;
  name: string;
  role: string;
  theatre: string;
  site: string;
  time: string;
  date: string;
  urgent?: boolean;
};

type ShiftItem = {
  id: string;
  date: string;
  time: string;
  site: string;
  dept: string;
  teammates?: string;
  bonus?: string;
  urgent?: boolean;
};

type LeaveItem = {
  id: string;
  date: string;
  type: "Half-day" | "Full-day";
  category: string;
  state: "Approved" | "Awaiting" | "Declined";
};

/** ======= demo data ======= */
const dutyData: DutyItem[] = [
  { id: "d1", initials: "TV", name: "Thu Vo", role: "Anaes Coordinator", theatre: "Theatre 1", site: "PMCC", time: "08:00 - 13:00", date: "Tue. 12 May" },
  { id: "d2", initials: "MJ", name: "Min Ji", role: "Anaes Coordinator", theatre: "—", site: "PMCC", time: "—", date: "Tue. 12 May", urgent: true },
];

const myShifts: ShiftItem[] = [
  { id: "s1", date: "Wed, 14 May", time: "13:00 - 18:00", site: "PMCC", dept: "Anaes Coordinator", teammates: "Working with 3 others" },
  { id: "s2", date: "Thu, 15 May", time: "08:00 - 12:00", site: "PMCC", dept: "Anaes Coordinator", teammates: "Working with 3 others" },
];

const openShifts: ShiftItem[] = [
  { id: "o1", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500", urgent: true },
  { id: "o2", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500" },
  { id: "o3", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500", urgent: true },
];

const myLeaves: LeaveItem[] = [
  { id: "l1", date: "Mon, 19 May", type: "Half-day", category: "Annual Leave", state: "Approved" },
  { id: "l2", date: "Fri, 30 May", type: "Full-day", category: "Annual Leave", state: "Awaiting" },
  { id: "l3", date: "Fri, 30 May", type: "Full-day", category: "Annual Leave", state: "Declined" },
  { id: "l4", date: "Fri, 30 May", type: "Full-day", category: "Annual Leave", state: "Awaiting" },
];

function PaginationDots({ count, index }: { count: number; index: number }) {
  if (count < 2) return null;
  return (
    <View style={{ flexDirection: "row", alignSelf: "center", marginTop: sy(8) }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: Math.round(sx(8)),
            height: Math.round(sx(8)),
            borderRadius: Math.round(sx(4)),
            marginHorizontal: Math.round(sx(3)),
            backgroundColor: i === index ? COLOR.brand : "#E0E0E0",
          }}
        />
      ))}
    </View>
  );
}

/** ======= main component ======= */
export default function Dashboard() {
  const navigation = useNavigation<any>();

  const onPressDuty = useCallback((id: string) => console.log("duty", id), []);
  const onPressShift = useCallback((id: string) => console.log("shift", id), []);
  const onPressLeave = useCallback((id: string) => console.log("leave", id), []);

  const [dutyIdx, setDutyIdx] = React.useState(0);
  const [myShiftIdx, setMyShiftIdx] = React.useState(0);
  const [openShiftIdx, setOpenShiftIdx] = React.useState(0);
  const [leaveIdx, setLeaveIdx] = React.useState(0);

  // 左侧抽屉 Overlay 显示控制
  const [sideVisible, setSideVisible] = React.useState(false);

  const makeViewableHandler =
    <T,>(setter: (n: number) => void) =>
    (info: { viewableItems: Array<ViewToken<T>>; changed: Array<ViewToken<T>> }) => {
      const idx = info.viewableItems[0]?.index;
      if (typeof idx === "number") setter(idx);
    };

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  // 根据平台返回横向列表的“吸附”能力（Web 端关闭）
  const listSnapProps = <T,>(setter: (n: number) => void) =>
    !IS_WEB
      ? ({
          decelerationRate: "fast" as const,
          snapToAlignment: "start" as const,
          snapToInterval: SNAP,
          onViewableItemsChanged: makeViewableHandler<T>(setter),
          viewabilityConfig: viewConfigRef.current,
          getItemLayout: (_: any, index: number) => ({
            length: SNAP,
            offset: LEFT_PAD + SNAP * index,
            index,
          }),
        } as const)
      : ({} as const);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        name="Thuw"
        onHelloPress={() => setSideVisible(true)} // 打开左侧抽屉
        onBellPress={() => console.log("notifications")}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: sy(8) }}>
        {/* Who’s on duty */}
        <View style={{ marginTop: sy(16) }}>
          <SectionTitle
            title={`Who’s on duty (${Array.isArray(dutyData) ? dutyData.length : 0})`}
            actionLabel="View My Team"
            onAction={() => console.log("view team")}
          />
          <FlatList
            data={Array.isArray(dutyData) ? dutyData : []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
            removeClippedSubviews={!IS_WEB}
            renderItem={({ item }) => <DutyCard item={item} onPress={() => onPressDuty(item.id)} />}
            {...listSnapProps<DutyItem>(setDutyIdx)}
          />
          <PaginationDots count={Array.isArray(dutyData) ? dutyData.length : 0} index={dutyIdx} />
        </View>

        {/* My shifts this week */}
        <View style={{ marginTop: sy(16) }}>
          <SectionTitle title={`My shifts this week (${Array.isArray(myShifts) ? myShifts.length : 0})`} />
          <FlatList
            data={Array.isArray(myShifts) ? myShifts : []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
            removeClippedSubviews={!IS_WEB}
            renderItem={({ item }) => <ShiftCard item={item} onPress={() => onPressShift(item.id)} />}
            {...listSnapProps<ShiftItem>(setMyShiftIdx)}
          />
          <PaginationDots count={Array.isArray(myShifts) ? myShifts.length : 0} index={myShiftIdx} />
        </View>

        {/* Open shifts */}
        <View style={{ marginTop: sy(16) }}>
          <SectionTitle
            title={`Open shifts this week (${Array.isArray(openShifts) ? openShifts.length : 0})`}
            actionLabel="View All"
            onAction={() => console.log("view all")}
          />
          <FlatList
            data={Array.isArray(openShifts) ? openShifts : []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
            removeClippedSubviews={!IS_WEB}
            renderItem={({ item }) => <ShiftCard item={item} onPress={() => onPressShift(item.id)} />}
            {...listSnapProps<ShiftItem>(setOpenShiftIdx)}
          />
          <PaginationDots count={Array.isArray(openShifts) ? openShifts.length : 0} index={openShiftIdx} />
        </View>

        {/* My leaves */}
        <View style={{ marginTop: sy(16), marginBottom: sy(32) }}>
          <SectionTitle title={`My leaves this month (${Array.isArray(myLeaves) ? myLeaves.length : 0})`} />
          <FlatList
            data={Array.isArray(myLeaves) ? myLeaves : []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
            removeClippedSubviews={!IS_WEB}
            renderItem={({ item }) => <LeaveCard item={item} onPress={() => onPressLeave(item.id)} />}
            {...listSnapProps<LeaveItem>(setLeaveIdx)}
          />
          <PaginationDots count={Array.isArray(myLeaves) ? myLeaves.length : 0} index={leaveIdx} />
        </View>
      </ScrollView>

      {/* 左侧抽屉 Overlay */}
      <ProfileSideMenu
        visible={sideVisible}
        onClose={() => setSideVisible(false)}
        onPressAvatar={() => {
          setSideVisible(false);
          navigation.navigate("Profile");
        }}
        onPressSettings={() => {
          setSideVisible(false);
          navigation.navigate("Settings"); // 请确保在 RootNavigator 里已注册
        }}
        onPressLogout={() => {
          setSideVisible(false);
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
          );
        }}
        user={{ initials: "AT", name: "Amy T.", email: "example.email@gmail.com" }}
      />
    </SafeAreaView>
  );
}

/** ======= subcomponents ======= */
const Header = memo(function Header({
  name,
  onHelloPress,
  onBellPress,
}: {
  name: string;
  onHelloPress: () => void;
  onBellPress?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerLeft} onPress={onHelloPress} hitSlop={8}>
        <Ionicons name="person-circle-outline" size={sx(24)} color="#fff" />
        <Text style={styles.headerTitle}>Hello, {name}</Text>
        {/* 不再需要向下箭头 */}
      </Pressable>
      <Pressable onPress={onBellPress} hitSlop={8}>
        <Ionicons name="notifications-outline" size={sx(24)} color="#fff" />
      </Pressable>
    </View>
  );
});

const SectionTitle = memo(function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <View style={styles.actionRow}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={sx(12)} color={COLOR.ink} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
});

const DutyCard = memo(function DutyCard({
  item,
  onPress,
}: {
  item: DutyItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityLabel={`duty-${item.name}`}>
      <View style={styles.cardTopRow}>
        <Pressable onPress={onPress} style={styles.initials}>
          <Text style={styles.initialsText}>{item.initials}</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Row text={item.role} icon={<MCI name="stethoscope" size={sx(16)} color={COLOR.brand} />} />
          <Row text={item.theatre} icon={<MCI name="hospital-building" size={sx(16)} color={COLOR.brand} />} />
          <Row text={item.site} icon={<Ionicons name="location-outline" size={sx(16)} color={COLOR.brand} />} />
        </View>

        <Ionicons name="arrow-forward-circle" size={sx(32)} color={COLOR.brand} style={{ marginTop: sy(48) }} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottomRow}>
        <Row text={item.date} icon={<Ionicons name="calendar-outline" size={sx(16)} color={COLOR.brand} />} />
        <Row text={item.time} icon={<Ionicons name="time-outline" size={sx(16)} color={COLOR.brand} />} />
      </View>
    </Pressable>
  );
});

const ShiftCard = memo(function ShiftCard({
  item,
  onPress,
}: {
  item: ShiftItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.shiftCard, { position: "relative" }]} accessibilityLabel={`shift-${item.id}`}>
      <Text style={styles.shiftDate}>{item.date}</Text>
      <Row text={item.time} icon={<Ionicons name="time-outline" size={sx(16)} color={COLOR.brand} />} />
      <Row text={item.site} icon={<Ionicons name="location-outline" size={sx(16)} color={COLOR.brand} />} />
      <Row text={item.dept} icon={<MCI name="stethoscope" size={sx(16)} color={COLOR.brand} />} />
      {item.teammates ? <Row text={item.teammates} icon={<Ionicons name="people-outline" size={sx(16)} color={COLOR.brand} />} /> : null}

      {item.bonus ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: sy(4) }}>
          <Ionicons name="cash-outline" size={sx(16)} color={COLOR.brand} />
          <Text style={[styles.bonusText, { marginLeft: sx(4) }]}>{item.bonus}</Text>
          <Text style={styles.meta12}> extra pay</Text>
        </View>
      ) : null}

      {item.urgent ? (
        <View style={[styles.urgentBadge, { position: "absolute", top: sy(8), right: sx(8) }]}>
          <Ionicons name="alert-circle-outline" size={sx(12)} color={COLOR.brand} />
          <Text style={styles.urgentText}>Urgent</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

const LeaveCard = memo(function LeaveCard({
  item,
  onPress,
}: {
  item: LeaveItem;
  onPress: () => void;
}) {
  const isApproved = item.state === "Approved";
  const isAwaiting = item.state === "Awaiting";
  const isDeclined = item.state === "Declined";

  const badgeStyle = isApproved ? styles.stateApproved : isAwaiting ? styles.stateAwaiting : styles.stateDeclined;
  const iconName = isApproved ? "checkmark-circle-outline" : isAwaiting ? "time-outline" : "close-circle-outline";
  const toneColor = isApproved ? COLOR.brand : isAwaiting ? COLOR.warn : COLOR.red;

  return (
    <Pressable onPress={onPress} style={styles.leaveCard} accessibilityLabel={`leave-${item.id}`}>
      <Text style={styles.leaveDate}>{item.date}</Text>
      <Row text={item.type} icon={<Ionicons name="checkbox-outline" size={sx(16)} color={COLOR.brand} />} />
      <Row text={item.category} icon={<MCI name="calendar-clock-outline" size={sx(16)} color={COLOR.brand} />} />

      <View style={[styles.stateBadge, badgeStyle]}>
        <Ionicons name={iconName as any} size={sx(12)} color={toneColor} />
        <Text style={[styles.stateText, { marginLeft: sx(4), color: toneColor }]}>{item.state}</Text>
      </View>
    </Pressable>
  );
});

const Row = ({ text, icon, gap = 4 }: { text: string; icon: React.ReactNode; gap?: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginTop: sy(4) }}>
    <View style={{ marginRight: sx(gap) }}>{icon}</View>
    <Text style={styles.meta12}>{text}</Text>
  </View>
);

/** ======= styles ======= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLOR.brand,
    paddingVertical: sy(16),
    paddingHorizontal: sx(18),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: sx(4) },
  headerTitle: { color: "#fff", fontSize: sx(20), marginHorizontal: sx(4) },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: sx(16),
    marginBottom: sy(8),
  },
  sectionTitle: { color: COLOR.text, fontSize: sx(14), flex: 1 },
  actionRow: { flexDirection: "row", alignItems: "center" },
  actionText: { color: COLOR.ink, fontSize: sx(12), marginRight: sx(6) },

  card: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(16),
    paddingHorizontal: 0,
    marginRight: CARD_GAP,
    width: CARD_W,
    backgroundColor: COLOR.card,
  },
  cardTopRow: { flexDirection: "row", marginBottom: sy(8), marginHorizontal: sx(16) },

  initials: {
    width: INITIALS_SIZE,
    height: INITIALS_SIZE,
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(16),
    marginTop: sx(6),
  },
  initialsText: { color: "#fff", fontSize: sx(20), fontWeight: "600", lineHeight: sx(20) },

  cardName: { color: COLOR.text, fontSize: sx(16), marginBottom: sy(2), fontWeight: "600" },
  cardDivider: { height: 1, backgroundColor: COLOR.brand, marginHorizontal: sx(16), marginBottom: sy(8) },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: sx(16) },

  shiftCard: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    padding: sx(16),
    marginRight: CARD_GAP,
    minWidth: CARD_W,
    backgroundColor: COLOR.card,
  },
  shiftDate: { color: COLOR.ink, fontSize: sx(16), marginBottom: sy(4), fontWeight: "600" },
  bonusText: { color: COLOR.ink, fontSize: sx(16), fontWeight: "bold" },
  urgentBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.subtleBlue,
    borderColor: COLOR.brand,
    borderWidth: 1,
    borderRadius: sx(12),
    paddingVertical: sy(4),
    paddingHorizontal: sx(8),
    marginTop: sy(8),
    gap: sx(2),
  },
  urgentText: { color: COLOR.brand, fontSize: sx(12) },

  leaveCard: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(16),
    paddingHorizontal: sx(16),
    marginRight: CARD_GAP,
    minWidth: Math.round(sx(260)),
    backgroundColor: COLOR.card,
  },
  leaveDate: { color: COLOR.ink, fontSize: sx(16), marginBottom: sy(8), fontWeight: "600" },
  stateBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: sx(12),
    borderWidth: 1,
    paddingVertical: sy(4),
    paddingHorizontal: sx(8),
    marginTop: sy(8),
  },
  stateApproved: { backgroundColor: COLOR.subtleBlue, borderColor: COLOR.brand },
  stateAwaiting: { backgroundColor: COLOR.warnBg, borderColor: COLOR.warn },
  stateDeclined: { backgroundColor: COLOR.redBg, borderColor: COLOR.red },
  stateText: { fontSize: sx(12) },

  meta12: { color: COLOR.ink, fontSize: sx(12) },
});
