import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { styles } from "../../styles";
import { Row } from "../Row";
import type { DutyItem } from "@/types/dashboard";

export const DutyCard = memo(function DutyCard({ item, onPress }: { item: DutyItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityLabel={`duty-${item.name}`}>
      <View style={styles.cardTopRow}>
        <Pressable onPress={onPress} style={styles.initials} accessibilityLabel={`${item.name} avatar`}>
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
