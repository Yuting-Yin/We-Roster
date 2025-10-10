import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AppBar from "@/components/common/AppBar";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RequestRefreshProvider } from "@/contexts/RequestRefreshContext";

// Sub-pages: InAction, History
import InAction from "./InAction";
import History from "./History";

const Tab = createMaterialTopTabNavigator();

export default function MyRequestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      {/* top sub nav bar */}
      <RequestRefreshProvider>
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
          <Tab.Screen name="IN ACTION" component={InAction} />
          <Tab.Screen name="HISTORY" component={History} />
        </Tab.Navigator>
      </RequestRefreshProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },
});
