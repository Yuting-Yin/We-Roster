// src/screens/Splash.tsx
import React, { FC, useEffect, useRef } from "react";
import { SafeAreaView, View, Image, Animated, Easing, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
};

type SplashNav = NativeStackNavigationProp<RootStackParamList, "Splash">;

const SHOW_MS = 900;      // stay time
const FADE_MS = 500;      // Fade-in/Fade-out time

const Splash: FC = () => {
  const navigation = useNavigation<SplashNav>();
  const opacity = useRef(new Animated.Value(0)).current; // 0→1 Fade in

  useEffect(() => {
    // Animation: Fade in → Stay → Fade out → Jump
    const seq = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: FADE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(SHOW_MS),
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);

    const sub = seq.start(({ finished }) => {
      if (finished) {
        // Use replace to prevent returning to Splash
        navigation.replace("Login");
      }
    });

    return () => {
      // Stop animation when component is uninstalled to avoid memory leaks
      opacity.stopAnimation();
      // Animated v2 does not have a clear remove method, so its fine to stop it.
    };
  }, [navigation, opacity]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Optional: hide the status bar. e.g. time，battery etc. */}
      <StatusBar hidden />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View style={{ opacity, alignItems: "center", width: "73%" }}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={{ width: "100%", height: undefined, aspectRatio: 1}}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Splash;