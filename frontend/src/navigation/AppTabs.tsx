import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Dashboard from "@/screens/Dashboard";
import RosterScreen from "@/screens/Roster";
import { View, Text, Dimensions } from "react-native";

const { width: W } = Dimensions.get("window");
const HI_FI_WIDTH = 412;
const sx = (x: number) => (x / HI_FI_WIDTH) * W;

function Roster() { return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><Text>Roster</Text></View>; }
function MyRequest() { return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><Text>My Request</Text></View>; }
function MyTeam() { return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><Text>My Team</Text></View>; }

export type AppTabParamList = {
  Dashboard: undefined;
  Roster: { selectedDate?: string } | undefined;
  "My Request": undefined;
  "My Team": undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0078D4",
        tabBarInactiveTintColor: "#8FA7BF",
        tabBarIcon: ({ color, size, focused }) => {
            const map: Record<keyof AppTabParamList, [any, any]> = {
                Dashboard: ["grid-outline", "grid"],
                Roster: ["calendar-outline", "calendar"],
                        "My Request": ["document-text-outline", "document-text"],
                        "My Team": ["people-outline", "people"],
                };
            const [outline, filled] = map[route.name as keyof AppTabParamList];
            return (
                    <Ionicons
                    name={focused ? (filled as any) : (outline as any)}
                    size={sx(24)}
                    color={color}
                    />
                );
            },
        tabBarLabelStyle: { fontSize: sx(12) },
        tabBarStyle: {
            height: sx(72),
            paddingBottom: sx(6),
            paddingTop: sx(6),
            backgroundColor: "#fff",

            // shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 6, // Android
            },
        })}
        screenListeners={{
          tabPress: () => {
            // This will fire for any tab press
            console.log('Tab pressed - overlays should close');
          },
        }}
    >
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Roster" component={RosterScreen} />
    <Tab.Screen name="My Request" component={MyRequest} />
    <Tab.Screen name="My Team" component={MyTeam} />
    </Tab.Navigator>

  );
}