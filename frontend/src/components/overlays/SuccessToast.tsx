import React from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

export default function SuccessToast({ visible, text }: { visible: boolean; text: string }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [sy(60), 0] });
  const opacity = anim;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { transform: [{ translateY }], opacity }]}>
      <Ionicons name="checkmark-circle-outline" size={sx(18)} color={COLOR.success} />
      <Text style={styles.txt}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute", left: sx(16), right: sx(16), bottom: sy(16),
    backgroundColor: COLOR.successBg, borderWidth: 1, borderColor: COLOR.success,
    borderRadius: sx(10), paddingVertical: sy(10), paddingHorizontal: sx(12),
    flexDirection: "row", alignItems: "center", zIndex: 60, elevation: 16,
  },
  txt: { marginLeft: sx(8), color: COLOR.success, fontSize: sx(14), fontWeight: "600" },
});
