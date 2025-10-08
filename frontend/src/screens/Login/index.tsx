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
import { useAuth } from "@/contexts/AuthContext";

const HI_FI_WIDTH = 412;
const HI_FI_HEIGHT = 917;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const sx = (x: number) => (x / HI_FI_WIDTH) * SCREEN_WIDTH;
const sy = (y: number) => (y / HI_FI_HEIGHT) * SCREEN_HEIGHT;

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function Login() {
  const navigation = useNavigation<LoginNav>();
  const { login: authLogin } = useAuth();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!domain.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Use the AuthContext login method which handles token storage
      await authLogin(domain, email, password);
      
      // Successfully login -> navigate to dashboard
      navigation.replace("AppTabs");
    } catch (e: any) {
      Alert.alert("Login Failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
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
        <Text style={styles.welcome}>Sign in to your account</Text>
      </View>

      {/* Inputs */}
      <View style={{ marginHorizontal: sx(48) }}>
        <Field placeholder="Domain" value={domain} onChangeText={setDomain} topGap={sy(0)} />
        <Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" topGap={sy(24)} />
        <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry topGap={sy(24)} />
      </View>

      {/* Login */}
      <TouchableOpacity
        onPress={onLogin}
        activeOpacity={0.85}
        disabled={loading}
        style={{
          marginTop: sy(140),
          marginHorizontal: sx(42),
          paddingVertical: sy(12),
          borderRadius: sy(18),
          backgroundColor: loading ? "#ccc" : "#4090CD",
          alignItems: "center",
        }}
      >
        <Text style={styles.loginText}>{loading ? "LOGGING IN..." : "LOGIN"}</Text>
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
  loginText: { color: "#FFFFFF", fontSize: sx(16), fontWeight: "normal" },
});
