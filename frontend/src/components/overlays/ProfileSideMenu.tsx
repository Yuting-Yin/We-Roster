import React, { memo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

const { width: W, height: H } = Dimensions.get("window");
const PANEL_W = Math.min(Math.round(W * 0.82), 320);
const AVATAR = sx(81);

// 统一时长/缓动，确保无弹性
const D_OPEN = 240;
const D_CLOSE = 200;
const easeOut = Easing.out(Easing.cubic);
const easeIn  = Easing.in(Easing.cubic);

type Props = {
  visible: boolean;
  onClose: () => void;
  onPressAvatar: () => void;
  onPressSettings: () => void;
  onPressLogout: () => void;
  user?: { initials?: string; name?: string; email?: string };
};

function ProfileSideMenu({
  visible,
  onClose,
  onPressAvatar,
  onPressSettings,
  onPressLogout,
  user,
}: Props) {
  // 为了播放关闭动画，visible=false 时不立即卸载
  const [rendered, setRendered] = useState(visible);

  // 面板位移：-PANEL_W(关) → 0(开)
  const tx = useRef(new Animated.Value(visible ? 0 : -PANEL_W)).current;
  const offsetRef = useRef(visible ? 0 : -PANEL_W);

  // 内部元素：头像缩放、两行菜单逐个淡入/位移
  const avatarScale = useRef(new Animated.Value(visible ? 1 : 0.96)).current;
  const row1 = useRef(new Animated.Value(visible ? 1 : 0)).current; // Settings
  const row2 = useRef(new Animated.Value(visible ? 1 : 0)).current; // Logout

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(tx,      { toValue: 0, duration: D_OPEN, easing: easeOut, useNativeDriver: true }),
        Animated.timing(avatarScale, { toValue: 1, duration: D_OPEN - 40, easing: easeOut, useNativeDriver: true }),
        Animated.stagger(70, [
          Animated.timing(row1, { toValue: 1, duration: 200, easing: easeOut, useNativeDriver: true }),
          Animated.timing(row2, { toValue: 1, duration: 200, easing: easeOut, useNativeDriver: true }),
        ]),
      ]).start(() => {
        offsetRef.current = 0;
      });
    } else if (rendered) {
      // 关闭：面板滑出；子元素状态复位，下一次打开能再次播放
      row1.setValue(0);
      row2.setValue(0);
      avatarScale.setValue(0.96);
      Animated.timing(tx, { toValue: -PANEL_W, duration: D_CLOSE, easing: easeIn, useNativeDriver: true })
        .start(() => {
          offsetRef.current = -PANEL_W;
          setRendered(false);
        });
    }
  }, [visible]);

  // 手势：左滑关闭；没有弹性
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
      onPanResponderGrant: () => {
        // @ts-ignore
        offsetRef.current = (tx as any).__getValue?.() ?? offsetRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = Math.max(-PANEL_W, Math.min(0, offsetRef.current + g.dx));
        tx.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const current = (tx as any).__getValue?.() ?? 0;
        const shouldClose = g.vx < -0.5 || current < -PANEL_W * 0.35;
        Animated.timing(tx, {
          toValue: shouldClose ? -PANEL_W : 0,
          duration: shouldClose ? D_CLOSE : D_OPEN,
          easing: shouldClose ? easeIn : easeOut,
          useNativeDriver: true,
        }).start(() => {
          offsetRef.current = shouldClose ? -PANEL_W : 0;
          if (shouldClose) onClose();
        });
      },
    })
  ).current;

  if (!rendered) return null;

  const initials = user?.initials ?? "AT";
  const name = user?.name ?? "Amy T.";
  const email = user?.email ?? "example.email@gmail.com";

  const rowAnim = (v: Animated.Value) => ({
    opacity: v,
    transform: [
      {
        translateX: v.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.backdrop} pointerEvents="box-none" accessibilityViewIsModal importantForAccessibility="yes">
      {/* 遮罩：固定不动，不参与动画 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View style={styles.dim} />
      </Pressable>

      {/* 面板：无弹性，仅 timing 平滑滑入/滑出 */}
      <Animated.View
        style={[styles.panel, { transform: [{ translateX: tx }] }]}
        accessibilityRole="menu"
        {...panResponder.panHandlers}
      >
        <Pressable style={styles.header} onPress={onPressAvatar} accessibilityRole="button">
          <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Animated.View>
          <View style={{ marginTop: sy(8) }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </Pressable>

        <View style={styles.divider} />

        <Animated.View style={rowAnim(row1)}>
          <Pressable style={styles.row} onPress={onPressSettings} accessibilityRole="menuitem">
            <Ionicons name="settings-outline" size={sx(18)} color={COLOR.ink} />
            <Text style={styles.rowText}>Settings</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View style={rowAnim(row2)}>
          <Pressable style={styles.row} onPress={onPressLogout} accessibilityRole="menuitem">
            <Ionicons name="log-out-outline" size={sx(18)} color={COLOR.ink} />
            <Text style={styles.rowText}>Log out</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.divider} />
      </Animated.View>
    </View>
  );
}

export default memo(ProfileSideMenu);

/* ===== styles ===== */
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    zIndex: 999,
  },
  dim: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }, // 不动画
  panel: {
    width: PANEL_W,
    height: H,
    backgroundColor: COLOR.bg,
    paddingTop: sy(24),
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: { paddingTop: sx(64), paddingHorizontal: sx(20), paddingBottom: sy(12) },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 1,
    borderColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLOR.brand, fontWeight: "700", fontSize: sx(28) },
  name: { marginTop: sy(10), color: COLOR.ink, fontWeight: "700", fontSize: sx(20) },
  email: { color: COLOR.label, marginTop: sy(4), fontSize: sx(13) },
  divider: { height: 0.25, backgroundColor: COLOR.divider, marginVertical: sy(6) },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: sx(20), paddingVertical: sy(14) },
  rowText: { marginLeft: sx(12), color: COLOR.ink, fontSize: sx(16) },
});
