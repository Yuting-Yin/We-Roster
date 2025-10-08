// navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// screens
import Splash from "@/screens/Splash";
import Login from "@/screens/Login";
import AppTabs from "@/navigation/AppTabs";   // 里面包含 Dashboard 等 Tab 页
import Profile from "@/screens/Profile/index";
import Settings from "@/screens/Settings";
import Notifications from "@/screens/Notifications";

// 主题色（给 Profile / EditProfile 的头部用）
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { OverlayProvider } from "@/contexts/OverlayContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

/** ====== 顶层 Stack 的参数类型 ====== */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AppTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
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

        {/* 个人信息页：需要展示标题栏（蓝色） */}
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
              height: 56, // Standard header height to match AppBar
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
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
    </NavigationContainer>
  );
}

