// navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// screens
import Splash from "@/screens/Splash";
import Login from "@/screens/Login";
import AppTabs from "@/navigation/AppTabs";   // Contains Dashboard and other Tab pages
import Profile from "@/screens/Profile/index";
import Settings from "@/screens/Settings";
import EditDashboard from "@/screens/Settings/EditDashboard";
import Notifications from "@/screens/Notifications";

// Theme colors (for Profile / EditProfile headers)
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { OverlayProvider } from "@/contexts/OverlayContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

/** ====== Root Stack parameter types ====== */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AppTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  EditDashboard: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <SettingsProvider>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AppTabs">
            {() => (
              <NotificationProvider>
                <OverlayProvider>
                  <AppTabs />
                </OverlayProvider>
              </NotificationProvider>
            )}
          </Stack.Screen>

          {/* Profile page: needs to display header bar (blue) */}
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{
              headerShown: true,
              title: "Profile",
              headerStyle: { backgroundColor: COLOR.brand },
              headerTintColor: "#fff",
            }}
          />

          <Stack.Screen 
            name="Settings" 
            component={Settings}
            options={{
              headerShown: true, 
              title: "Settings",
              headerStyle: { 
                backgroundColor: COLOR.brand,
              }, 
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontSize: sx(20),
                fontWeight: "normal",
              },
            }}
          />

          <Stack.Screen 
            name="EditDashboard" 
            component={EditDashboard}
            options={{
              headerShown: true, 
              title: "Edit Dashboard",
              headerStyle: { 
                backgroundColor: COLOR.brand,
              }, 
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontSize: sx(20),
                fontWeight: "normal",
              },
            }}
          />

          <Stack.Screen 
            name="Notifications" 
            options={{
              headerShown: false, // We handle our own header in the component
            }}
          >
            {() => (
              <NotificationProvider>
                <Notifications />
              </NotificationProvider>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </SettingsProvider>
    </NavigationContainer>
  );
}

