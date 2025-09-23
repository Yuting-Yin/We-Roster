// src/screens/Dashboard/index.tsx
import React, { useState } from "react";
import { SafeAreaView, ScrollView, RefreshControl } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import ProfileSideMenu from "@/components/overlays/ProfileSideMenu";
import { useDashboardData } from "@/hooks/useDashboard";
import type { DutyItem, ShiftItem, LeaveItem } from "@/types/dashboard";

import { styles } from "./styles";
import { Section } from "./components/Section";
import { Header } from "./components/Header";
import { ErrorBanner } from "./components/ErrorBanner";
import { PaginationDots } from "./components/PaginationDots";

import { DutyCard } from "./components/cards/DutyCard";
import { ShiftCard } from "./components/cards/ShiftCard";
import { LeaveCard } from "./components/cards/LeaveCard";

import { DutyCardSkeleton } from "./components/skeletons/DutyCardSkeleton";
import { ShiftCardSkeleton } from "./components/skeletons/ShiftCardSkeleton";
import { LeaveCardSkeleton } from "./components/skeletons/LeaveCardSkeleton";

import { placeholderArray } from "./utils/placeholder";
import { useHorizontalSnapProps } from "./utils/useHorizontalSnap";
import { LEFT_PAD } from "./constants";

import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Dashboard() {
  const navigation = useNavigation<any>();

  const { duty, myShifts, openShifts, leaves, loading, error, refresh } =
  useDashboardData({ mock: true, delayMs: 500, amplifyTimes: 2 }); // use mock data

  const { firstName, displayName, initials, email } = useCurrentUser({mock: true});  // use mock data

  const [sideVisible, setSideVisible] = useState(false);
  const [dutyIdx, setDutyIdx] = useState(0);
  const [myShiftIdx, setMyShiftIdx] = useState(0);
  const [openShiftIdx, setOpenShiftIdx] = useState(0);
  const [leaveIdx, setLeaveIdx] = useState(0);

  const dutySnap = useHorizontalSnapProps<DutyItem>(setDutyIdx);
  const myShiftSnap = useHorizontalSnapProps<ShiftItem>(setMyShiftIdx);
  const openShiftSnap = useHorizontalSnapProps<ShiftItem>(setOpenShiftIdx);
  const leaveSnap = useHorizontalSnapProps<LeaveItem>(setLeaveIdx);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        name={firstName}
        onHelloPress={() => setSideVisible(true)}
        onBellPress={() => console.log("notifications")}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: sy(8) }}
        refreshControl={
          <RefreshControl refreshing={!!loading} onRefresh={refresh} tintColor={COLOR.brand} colors={[COLOR.brand]} />
        }
      >
        {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

        <Section title={`Who’s on duty (${duty.length})`} actionLabel="View My Team" onAction={() => console.log("view team")}
          data={loading && duty.length === 0 ? placeholderArray<DutyItem>(3) : duty}
          keyExtractor={(i, idx) => (i?.id ?? `duty-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <DutyCard item={item} onPress={() => console.log("duty", item.id)} /> : <DutyCardSkeleton />)}
          flatListProps={dutySnap}
          footer={<PaginationDots count={Math.max(duty.length, loading ? 3 : 0)} index={dutyIdx} />}
        />

        <Section title={`My shifts this week (${myShifts.length})`}
          data={loading && myShifts.length === 0 ? placeholderArray<ShiftItem>(3) : myShifts}
          keyExtractor={(i, idx) => (i?.id ?? `myshift-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <ShiftCard item={item} onPress={() => console.log("shift", item.id)} /> : <ShiftCardSkeleton />)}
          flatListProps={myShiftSnap}
          footer={<PaginationDots count={Math.max(myShifts.length, loading ? 3 : 0)} index={myShiftIdx} />}
        />

        <Section title={`Open shifts this week (${openShifts.length})`} actionLabel="View All" onAction={() => console.log("view all")}
          data={loading && openShifts.length === 0 ? placeholderArray<ShiftItem>(3) : openShifts}
          keyExtractor={(i, idx) => (i?.id ?? `openshift-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <ShiftCard item={item} onPress={() => console.log("shift", item.id)} /> : <ShiftCardSkeleton />)}
          flatListProps={openShiftSnap}
          footer={<PaginationDots count={Math.max(openShifts.length, loading ? 3 : 0)} index={openShiftIdx} />}
        />

        <Section title={`My leaves this month (${leaves.length})`}
          data={loading && leaves.length === 0 ? placeholderArray<LeaveItem>(3) : leaves}
          keyExtractor={(i, idx) => (i?.id ?? `leave-skel-${idx}`)}
          contentContainerStyle={{ paddingHorizontal: LEFT_PAD }}
          renderItem={({ item }) => (item?.id ? <LeaveCard item={item} onPress={() => console.log("leave", item.id)} /> : <LeaveCardSkeleton />)}
          flatListProps={leaveSnap}
          footer={<PaginationDots count={Math.max(leaves.length, loading ? 3 : 0)} index={leaveIdx} />}
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
        onPressLogout={() => {
          setSideVisible(false);
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
        }}
        user={{ initials, name: displayName, email }}
      />
    </SafeAreaView>
  );
}
