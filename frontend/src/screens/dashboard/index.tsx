import React, { memo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import type { ViewToken } from "react-native";

/** ======= size & color ======= */
const HI_FI_WIDTH = 412;
const HI_FI_HEIGHT = 917;
const { width: W, height: H } = Dimensions.get("window");
const sx = (x: number) => (x / HI_FI_WIDTH) * W;
const sy = (y: number) => (y / HI_FI_HEIGHT) * H;

const CARD_W = sx(280);
const CARD_GAP = sx(16);

const COLOR = {
  brand: "#0078D4",
  ink: "#212121",
  text: "#000",
  bg: "#fff",
  line: "#E6E6E6",
  subtleBlue: "#DEECF9",
  warnBg: "#FFF2C8",
  warn: "#DCAB00",
  redBg: "#FFEBEB",
  red: "#BB2424"
};

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
  bonus?: string; // "+$500"
  urgent?: boolean;
};

type LeaveItem = {
  id: string;
  date: string;
  type: "Half-day" | "Full-day";
  category: string;
  state: "Approved" | "Awaiting" | "Declined";
};

/** ======= pesudo data (need to docking with API) ======= */
const dutyData: DutyItem[] = [
  {
    id: "d1",
    initials: "TV",
    name: "Thu Vo",
    role: "Anaes Coordinator",
    theatre: "Theatre 1",
    site: "PMCC",
    time: "08:00 - 13:00",
    date: "Tue. 12 May",
  },
  {
    id: "d2",
    initials: "MJ",
    name: "Min Ji",
    role: "Anaes Coordinator",
    theatre: "—",
    site: "PMCC",
    time: "—",
    date: "Tue. 12 May",
    urgent: true,
  },
];

const myShifts: ShiftItem[] = [
  {
    id: "s1",
    date: "Wed, 14 May",
    time: "13:00 - 18:00",
    site: "PMCC",
    dept: "Anaes Coordinator",
    teammates: "Working with 3 others",
  },
  {
    id: "s2",
    date: "Thu, 15 May",
    time: "08:00 - 12:00",
    site: "PMCC",
    dept: "Anaes Coordinator",
    teammates: "Working with 3 others",
  },
];

const openShifts: ShiftItem[] = [
  {
    id: "o1",
    date: "Fri, 16 May",
    time: "8:00 - 12:00",
    site: "PMCC",
    dept: "Neurosurgery",
    bonus: "+$500",
    urgent: true,
  },
  {
    id: "o2",
    date: "Fri, 16 May",
    time: "8:00 - 12:00",
    site: "PMCC",
    dept: "Neurosurgery",
    bonus: "+$500",
  },
    {
    id: "o3",
    date: "Fri, 16 May",
    time: "8:00 - 12:00",
    site: "PMCC",
    dept: "Neurosurgery",
    bonus: "+$500",
    urgent: true
  },
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
            width: sx(8),
            height: sx(8),
            borderRadius: sx(4),
            marginHorizontal: sx(3),
            backgroundColor: i === index ? COLOR.brand : "#E0E0E0",
          }}
        />
      ))}
    </View>
  );
}

/** ======= main component ======= */
export default function Dashboard() {
  const onPressDuty = useCallback((id: string) => {
    console.log("duty", id);
  }, []);

  const onPressShift = useCallback((id: string) => {
    console.log("shift", id);
  }, []);

  const onPressLeave = useCallback((id: string) => {
    console.log("leave", id);
  }, []);

  const [dutyIdx, setDutyIdx] = React.useState(0);
  const [myShiftIdx, setMyShiftIdx] = React.useState(0);
  const [openShiftIdx, setOpenShiftIdx] = React.useState(0);
  const [leaveIdx, setLeaveIdx] = React.useState(0);

  const makeViewableHandler =
  <T,>(setter: (n: number) => void) =>
  (info: { viewableItems: Array<ViewToken<T>>; changed: Array<ViewToken<T>> }) => {
    const idx = info.viewableItems[0]?.index;
    if (typeof idx === "number") setter(idx);
  };

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaView style={styles.container}>
        <Header name="Thuw" />
      <ScrollView contentContainerStyle={{ paddingBottom: sy(0) }}>
        
        {/* Who’s on duty */}
        <View style={{ marginTop: sy(16) }}>
            <SectionTitle
                title={`Who’s on duty (${dutyData.length})`}
                actionLabel="View My Team"
                onAction={() => console.log("view team")}
            />
            <FlatList
                data={dutyData}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sx(16) }}
                renderItem={({ item }) => <DutyCard item={item} onPress={() => onPressDuty(item.id)} />}
                // Key: Adsorption/paging experience
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={CARD_W + CARD_GAP}
                pagingEnabled={false}               // use snapToInterval
                // Key: Calculating visible item indexes
                onViewableItemsChanged={makeViewableHandler<DutyItem>(setDutyIdx)}
                viewabilityConfig={viewConfigRef.current}
                // Optional: Improve scrolling performance & index stability
                getItemLayout={(_, index) => ({
                    length: CARD_W + CARD_GAP,
                    offset: (CARD_W + CARD_GAP) * index + sx(16), // + left padding
                    index,
                })}
            />
            <PaginationDots count={dutyData.length} index={dutyIdx} />
        </View>

        {/* My shifts this week */}
        <View style={{ marginTop: sy(16) }}>
            <SectionTitle title={`My shifts this week (${myShifts.length})`} />
                <FlatList
                data={myShifts}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sx(16) }}
                renderItem={({ item }) => (
                <ShiftCard item={item} onPress={() => onPressShift(item.id)} />
                )}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={CARD_W + CARD_GAP}
                onViewableItemsChanged={makeViewableHandler(setMyShiftIdx)}
                viewabilityConfig={viewConfigRef.current}
                getItemLayout={(_, index) => ({
                length: CARD_W + CARD_GAP,
                offset: (CARD_W + CARD_GAP) * index + sx(16),
                index,
                })}
            />
            <PaginationDots count={myShifts.length} index={myShiftIdx} />
        </View>

        {/* Open shifts */}
        <View style={{ marginTop: sy(16) }}>
            <SectionTitle
            title={`Open shifts this week (${openShifts.length})`}
            actionLabel="View All"
            onAction={() => console.log("view all")}
            />
                <FlatList
                data={openShifts}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sx(16) }}
                renderItem={({ item }) => (
                    <ShiftCard item={item} onPress={() => onPressShift(item.id)} />
                )}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={CARD_W + CARD_GAP}
                onViewableItemsChanged={makeViewableHandler(setOpenShiftIdx)}
                viewabilityConfig={viewConfigRef.current}
                getItemLayout={(_, index) => ({
                    length: CARD_W + CARD_GAP,
                    offset: (CARD_W + CARD_GAP) * index + sx(16),
                    index,
                })}
            />
            <PaginationDots count={openShifts.length} index={openShiftIdx} />
        </View>


        {/* My leaves */}
        <View style={{ marginTop: sy(16), marginBottom: sy(32) }}>
            <SectionTitle title={`My leaves this month (${myLeaves.length})`} />
                <FlatList
                data={myLeaves}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sx(16) }}
                renderItem={({ item }) => (
                    <LeaveCard item={item} onPress={() => onPressLeave(item.id)} />
                )}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={CARD_W + CARD_GAP}
                onViewableItemsChanged={makeViewableHandler(setLeaveIdx)}
                viewabilityConfig={viewConfigRef.current}
                getItemLayout={(_, index) => ({
                    length: CARD_W + CARD_GAP,
                    offset: (CARD_W + CARD_GAP) * index + sx(16),
                    index,
                })}
            />
            <PaginationDots count={myLeaves.length} index={leaveIdx} />
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

/** ======= subcomponent ======= */

const Header = memo(function Header({ name }: { name: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="person-circle-outline" size={sx(24)} color="#fff" />
        <Text style={styles.headerTitle}>Hello, {name}</Text>
        <Ionicons name="chevron-down" size={sx(24)} color="#fff" />
      </View>
      <Ionicons name="notifications-outline" size={sx(24)} color="#fff" />
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
      {item.teammates ? (
        <Row text={item.teammates} icon={<Ionicons name="people-outline" size={sx(16)} color={COLOR.brand} />} />
      ) : null}

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

  const badgeStyle =
    isApproved ? styles.stateApproved :
    isAwaiting ? styles.stateAwaiting :
    styles.stateDeclined;

  const iconName:
    | "checkmark-circle-outline"
    | "time-outline"
    | "close-circle-outline" =
    isApproved ? "checkmark-circle-outline" :
    isAwaiting ? "time-outline" :
    "close-circle-outline";

  const toneColor = isApproved ? COLOR.brand : isAwaiting ? COLOR.warn : COLOR.red;

  return (
    <Pressable onPress={onPress} style={styles.leaveCard} accessibilityLabel={`leave-${item.id}`}>
      <Text style={styles.leaveDate}>{item.date}</Text>
      <Row text={item.type} icon={<Ionicons name="checkbox-outline" size={sx(16)} color={COLOR.brand} />} />
      <Row text={item.category} icon={<MCI name="calendar-clock-outline" size={sx(16)} color={COLOR.brand} />} />

      <View style={[styles.stateBadge, badgeStyle]}>
        <Ionicons name={iconName} size={sx(12)} color={toneColor} />
        <Text style={[styles.stateText, { marginLeft: sx(4), color: toneColor }]}>
          {item.state}
        </Text>
      </View>
    </Pressable>
  );
});

/** row info: context + icon */
const Row = ({
  text,
  icon,
  gap = 4,
}: {
  text: string;
  icon: React.ReactNode;
  gap?: number;
}) => (
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
    marginBottom: sy(0),
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
    paddingHorizontal: sx(0),
    marginRight: sx(16),
    width: sx(280),
    backgroundColor: COLOR.bg,
  },
  cardTopRow: { flexDirection: "row", marginBottom: sy(8), marginHorizontal: sx(16) },
  initials: {
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(28),
    paddingHorizontal: sx(27),
    marginRight: sx(16),
  },
  initialsText: { color: "#fff", fontSize: sx(20), fontWeight: "600" },
  cardName: { color: COLOR.text, fontSize: sx(16), marginBottom: sy(2), fontWeight: "600" },
  cardDivider: { height: 1, backgroundColor: COLOR.brand, marginHorizontal: sx(16), marginBottom: sy(8) },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: sx(16) },

  shiftCard: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    padding: sx(16),
    marginRight: sx(16),
    minWidth: sx(280),
    backgroundColor: COLOR.bg,
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
    marginRight: sx(16),
    minWidth: sx(260),
    backgroundColor: COLOR.bg,
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
  stateDeclined: { backgroundColor: COLOR.redBg, borderColor: COLOR.red},
  stateText: { fontSize: sx(12) },

  meta12: { color: COLOR.ink, fontSize: sx(12) },
});
