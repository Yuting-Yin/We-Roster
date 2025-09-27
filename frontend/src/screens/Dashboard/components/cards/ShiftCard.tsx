import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { styles } from "../../styles";
import { Row } from "../Row";
import type { ShiftItem } from "@/types/dashboard";

export const ShiftCard = memo(function ShiftCard({ item, onPress }: { item: ShiftItem; onPress: () => void }) {
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
