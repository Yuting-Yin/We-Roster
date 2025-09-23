import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { sx } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { styles } from "../../styles";
import { Row } from "../Row";
import type { LeaveItem } from "@/types/dashboard";

export const LeaveCard = memo(function LeaveCard({ item, onPress }: { item: LeaveItem; onPress: () => void }) {
  const isApproved = item.state === "Approved";
  const isAwaiting = item.state === "Awaiting";
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
