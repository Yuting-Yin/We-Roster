import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRoute } from "@react-navigation/native";
import AppBar from "@/components/common/AppBar";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";

// Sub-pages: MyRoster, TeamRoster, Openshifts
import MyRoster from "./MyRoster";
import TeamRoster from "./TeamRoster";
import OpenShifts from "./OpenShifts";
const Tab = createMaterialTopTabNavigator();

export default function RosterScreen() {
  const route = useRoute<any>();
  const selectedDate = route.params?.selectedDate;
  
  console.log('🔍 RosterScreen - route.params:', route.params);
  console.log('🔍 RosterScreen - selectedDate:', selectedDate);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <AppBar />
      {/* top sub nav bar */}
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
          tabBarIndicatorStyle: { backgroundColor: COLOR.brand, height: sy(3), borderRadius: sy(2) },
          tabBarActiveTintColor: COLOR.brand,
          tabBarInactiveTintColor: COLOR.label,
          tabBarLabelStyle: { fontSize: sx(12), fontWeight: "600", textTransform: "none" },
          tabBarStyle: {
            backgroundColor: COLOR.bg, height: sy(48),
            borderBottomColor: COLOR.divider, borderBottomWidth: StyleSheet.hairlineWidth,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
          },
        }}
      >
        <Tab.Screen 
          name="MY ROSTER" 
          component={MyRoster}
          initialParams={{ selectedDate }}
        />
        <Tab.Screen 
          name="TEAM ROSTER" 
          component={TeamRoster}
          initialParams={{ selectedDate }}
        />
        <Tab.Screen name="OPEN SHIFTS" component={OpenShifts} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: COLOR.bg },
});
