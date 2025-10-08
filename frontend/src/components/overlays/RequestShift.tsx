import React from "react";
import { View, ScrollView, Text, TextInput, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { fmt, hoursBetween } from "@/lib/date";
import { isDateInPast, getPastDateErrorMessage } from "@/lib/dateValidation";
import Chip from "@/components/common/Chip";
import WarningToast from "@/components/overlays/WarningToast";

export default function RequestShift({
  visible, onCancel, onSubmitted, date, slot,
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmitted: () => void;
  date: Date;
  slot?: { start: string; end: string };
}) {
  const [location] = React.useState("PMCC");
  const [role] = React.useState("Neurosurgery");
  const [note, setNote] = React.useState("");
  
  // Toast state
  const [warningToast, setWarningToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  
  const showWarningToast = (message: string) => { 
    setToastMessage(message); 
    setWarningToast(true); 
    setTimeout(() => setWarningToast(false), 1800); 
  };

  const handleSubmit = () => {
    // Check if the date is in the past
    if (isDateInPast(date)) {
      showWarningToast(getPastDateErrorMessage(date));
      return;
    }
    
    onSubmitted();
  };

  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: visible && slot ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible, slot]);

  if (!visible || !slot) return null;
  const duration = `${hoursBetween(slot.start, slot.end)} hours`;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 40 }]} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel}><Text style={styles.hLeft}>Cancel</Text></Pressable>
          <Text style={styles.hTitle}>REQUEST SHIFT</Text>
          <Pressable onPress={handleSubmit}><Text style={styles.hRight}>Apply</Text></Pressable>
        </View>
        <View style={styles.divider} />

        <ScrollView style={{ maxHeight: sy(420) }} contentContainerStyle={{ paddingBottom: sy(18) }}>
          <Row icon="calendar-outline" label="Date" right={<Chip>{fmt(date, { day: "2-digit", month: "long", year: "numeric" })}</Chip>} />
          <Line />
          <Row icon="time-outline" label="Time" right={<View style={{ flexDirection: "row" }}>
            <Chip>{slot.start} - {slot.end}</Chip><View style={{ width: sx(8) }} /><Chip>{duration}</Chip>
          </View>} />
          <Line />
          <Row icon="business-outline" label="Location" right={<Chip icon={<Ionicons name="chevron-down" size={sx(16)} color={COLOR.ink} />}>{location}</Chip>} />
          <Line />
          <Row icon="medkit-outline" label="Role" right={<Chip icon={<Ionicons name="chevron-down" size={sx(16)} color={COLOR.ink} />}>{role}</Chip>} />

          <View style={{ marginHorizontal: sx(16), marginTop: sy(14) }}>
            <View style={styles.noteBox}>
              <TextInput placeholder="Note" placeholderTextColor="#8FA7BF" value={note} onChangeText={setNote} multiline style={{ color: COLOR.ink, fontSize: sx(16), minHeight: sy(120) }} />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      
      <WarningToast visible={warningToast} message={toastMessage} />
    </View>
}

function Row({ icon, label, right }: { icon: any; label: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={sx(20)} color={COLOR.brand} style={{ marginRight: sx(10) }} />
        <Text style={{ color: COLOR.ink, fontSize: sx(16) }}>{label}</Text>
      </View>
      {right}
    </View>
  );
}
const Line = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff",
    borderTopLeftRadius: sx(12), borderTopRightRadius: sx(12),
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLOR.divider,
    paddingBottom: sy(8), zIndex: 41, elevation: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.12, shadowRadius: 6,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: sx(16), paddingVertical: sy(12) },
  hLeft: { color: COLOR.ink, fontSize: sx(16) },
  hTitle: { color: "#000", fontSize: sx(16), fontWeight: "600" },
  hRight: { color: COLOR.brand, fontSize: sx(16), fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLOR.divider },
  row: { paddingHorizontal: sx(16), paddingVertical: sy(12), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  noteBox: { borderWidth: 1, borderColor: COLOR.brand, borderRadius: sx(16), paddingHorizontal: sx(12), paddingVertical: sy(8) },
});
