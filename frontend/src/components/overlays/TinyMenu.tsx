// src/components/overlays/TinyMenu.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";

export default function TinyMenu({
  visible,
  anchor, // { x, y } — 传的是“容器坐标”
  onClose,
  onRequestLeave,
  onSwapShift,
}: {
  visible: boolean;
  anchor: { x: number; y: number } | null;
  onClose: () => void;
  onRequestLeave: () => void;
  onSwapShift: () => void;
}) {
  if (!visible || !anchor) return null;

  const MENU_W = sx(180);
  const { width: W } = Dimensions.get("window");

  const top = Math.max(sy(4), anchor.y); // 轻微下移防抖
  const left = Math.min(Math.max(sx(8), anchor.x - sx(8)), W - MENU_W - sx(8));

  return (
    // 绝对铺满，层级最高，穿透点击到子菜单
    <View style={styles.overlay} pointerEvents="box-none">
      {/* 点击外部关闭 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={[styles.wrap, { top, left, width: MENU_W }]}>
        <Pressable style={styles.item} onPress={onRequestLeave}>
          <Ionicons name="airplane-outline" size={sx(16)} color={COLOR.ink} />
          <Text style={styles.txt}>Request Leave</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.item} onPress={onSwapShift}>
          <Ionicons name="repeat-outline" size={sx(16)} color={COLOR.ink} />
          <Text style={styles.txt}>Swap Shift</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,       // ⬅️ 高于 ShiftDetails(30)
    elevation: 12,    // Android 也要抬层
    backgroundColor: "transparent",
  },
  wrap: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderRadius: sx(12),
    paddingVertical: sy(6),
    // 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8EEF6",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: sy(10),
    paddingHorizontal: sx(12),
    gap: sx(8),
  },
  txt: { color: COLOR.ink, fontSize: sx(14) },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E8EEF6", marginHorizontal: sx(8) },
});
