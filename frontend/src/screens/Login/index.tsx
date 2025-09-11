import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { login } from "../../api/login";
import { healthCheck } from "../../api/health";

const HI_FI_WIDTH = 412;
const HI_FI_HEIGHT = 917;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const sx = (x: number) => (x / HI_FI_WIDTH) * SCREEN_WIDTH;
const sy = (y: number) => (y / HI_FI_HEIGHT) * SCREEN_HEIGHT;

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function Login() {
  const navigation = useNavigation<LoginNav>();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  async function onTestHealth() {
    try {
      const data = await healthCheck();
      Alert.alert("Health", JSON.stringify(data));
    } catch (e: any) {
      Alert.alert("Health Error", e?.message ?? "Unknown");
    }
  }

  async function onLogin() {
    try {
      // true login
      const data = await login(email, password);
      // TODO: implement token / remember logic

      // successfully login -> dashboard
      navigation.replace("AppTabs"); // or: navigation.navigate("AppTabs")
    } catch (e: any) {
      Alert.alert("Login Failed", e?.message ?? "Unknown");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={{ alignItems: "center", marginTop: sy(72) }}>
        <Image
          source={require("../../../assets/images/logo.png")}
          resizeMode="contain"
          style={{ width: sx(175), height: sx(175 * (125 / 175)) }}
        />
      </View>

      {/* Welcome message */}
      <View style={{ alignItems: "center", marginTop: sy(12), marginBottom: sy(64) }}>
        <Text style={styles.welcome}>Welcome message</Text>
      </View>

      {/* Inputs */}
      <View style={{ marginHorizontal: sx(48) }}>
        <Field placeholder="Domain" value={domain} onChangeText={setDomain} topGap={sy(0)} />
        <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" topGap={sy(24)} />
        <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry topGap={sy(24)} />
      </View>

      {/* Remember me */}
      <TouchableOpacity
        onPress={() => setRemember(!remember)}
        style={{ flexDirection: "row", alignItems: "center", marginLeft: sx(48), marginTop: sy(24) }}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, { backgroundColor: remember ? "#4090CD" : "#fff" }]} />
        <Text style={styles.remember}>Remember me</Text>
      </TouchableOpacity>

      {/* Login */}
      <TouchableOpacity
        onPress={onLogin}
        activeOpacity={0.85}
        style={{
          marginTop: sy(140),
          marginHorizontal: sx(42),
          paddingVertical: sy(12),
          borderRadius: sy(18),
          backgroundColor: "#4090CD",
          alignItems: "center",
        }}
      >
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Forgot password */}
      <TouchableOpacity activeOpacity={0.8} style={{ alignItems: "center", marginTop: sy(64) }}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/** Single input */
type FieldProps = React.ComponentProps<typeof TextInput> & { topGap?: number };
function Field({ topGap = 0, style, ...rest }: FieldProps) {
  return (
    <View style={{ marginTop: topGap }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#4090CD",
          borderRadius: sy(4),
          paddingHorizontal: sx(12),
          height: sy(48),
          justifyContent: "center",
        }}
      >
        <TextInput {...rest} placeholderTextColor="#888" style={[{ fontSize: sx(16), padding: 0 }, style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  welcome: { color: "#4090CD", fontSize: sx(14) },
  checkbox: { width: sx(20), height: sx(20), borderWidth: 1, borderColor: "#4090CD", marginRight: sx(8) },
  remember: { color: "#4090CD", fontSize: sx(14) },
  loginText: { color: "#FFFFFF", fontSize: sx(16), fontWeight: "normal" },
  forgot: { color: "#4090CD", fontSize: sx(14) },
});
