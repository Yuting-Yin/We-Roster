import React from "react";
import { View, Text, Pressable, Switch, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useSettings } from "@/contexts/SettingsContext";
import { sx, sy } from "@/theme/metrics";

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function Settings() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { notificationsEnabled, toggleNotifications, isLoading, colors } = useSettings();

  const handleEditDashboard = () => {
    navigation.navigate('EditDashboard');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {/* Edit Dashboard */}
        <Pressable style={[styles.settingItem, { backgroundColor: colors.bg }]} onPress={handleEditDashboard}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="create-outline" size={sx(20)} color={colors.ink} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingTitle, { color: colors.ink }]}>Edit dashboard</Text>
              <Text style={[styles.settingSubtitle, { color: colors.label }]}>Customise what you see on your dashboard</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={sx(20)} color={colors.label} />
        </Pressable>

        {/* Notifications */}
        <View style={[styles.settingItem, { backgroundColor: colors.bg }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="notifications-outline" size={sx(20)} color={colors.ink} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingTitle, { color: colors.ink }]}>Notifications</Text>
              <Text style={[styles.settingSubtitle, { color: colors.label }]}>Shift and roster alerts</Text>
            </View>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.divider, true: colors.brand }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor={colors.divider}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: sx(40),
    height: sx(40),
    borderRadius: sx(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sx(12),
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: sx(16),
    fontWeight: '500',
    marginBottom: sy(2),
  },
  settingSubtitle: {
    fontSize: sx(14),
  },
  switchContainer: {
    marginLeft: sx(12),
  },
});