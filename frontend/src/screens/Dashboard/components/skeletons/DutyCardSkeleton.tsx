import React from "react";
import { View } from "react-native";
import { styles } from "../../styles";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { Pulse } from "./Pulse";

export const DutyCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.cardTopRow}>
      <Pulse style={[styles.initials, { backgroundColor: COLOR.skeleton }]} />
      <View style={{ flex: 1 }}>
        <Pulse style={{ height: sy(16), width: sx(120), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginBottom: sy(6) }} />
        <Pulse style={{ height: sy(12), width: sx(140), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginBottom: sy(6) }} />
        <Pulse style={{ height: sy(12), width: sx(110), backgroundColor: COLOR.skeleton, borderRadius: sx(4), marginBottom: sy(6) }} />
        <Pulse style={{ height: sy(12), width: sx(90), backgroundColor: COLOR.skeleton, borderRadius: sx(4) }} />
      </View>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.cardBottomRow}>
      <Pulse style={{ height: sy(12), width: sx(80), backgroundColor: COLOR.skeleton, borderRadius: sx(4) }} />
      <Pulse style={{ height: sy(12), width: sx(80), backgroundColor: COLOR.skeleton, borderRadius: sx(4) }} />
    </View>
  </View>
);
