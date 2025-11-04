import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useSettings, DashboardSection } from "@/contexts/SettingsContext";

type EditDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditDashboard'>;

export default function EditDashboard() {
  const navigation = useNavigation<EditDashboardNavigationProp>();
  const { dashboardSections, updateDashboardSections } = useSettings();
  
  const [components, setComponents] = useState<DashboardSection[]>(dashboardSections);

  // Update local state when context changes
  useEffect(() => {
    setComponents(dashboardSections);
  }, [dashboardSections]);

  const handleToggleComponent = (id: string) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
      )
    );
  };

  const handleSave = async () => {
    try {
      await updateDashboardSections(components);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save dashboard preferences:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoHeader}>
        <Ionicons name="information-circle-outline" size={sx(18)} color={COLOR.brand} />
        <Text style={styles.infoText}>Select which sections to display on your dashboard</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
        {components.map((item) => (
          <Pressable 
            key={item.id} 
            style={styles.componentItem}
            onPress={() => handleToggleComponent(item.id)}
          >
            <Ionicons 
              name={item.enabled ? "checkbox" : "square-outline"} 
              size={sx(28)} 
              color={item.enabled ? COLOR.brand : COLOR.label} 
            />
            <View style={styles.textContainer}>
              <Text style={styles.componentTitle}>{item.title}</Text>
              <Text style={styles.componentSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      
      <View style={styles.saveButtonContainer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.subtleBlue,
    paddingHorizontal: sx(16),
    paddingVertical: sy(12),
    gap: sx(8),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.divider,
  },
  infoText: {
    fontSize: sx(13),
    color: COLOR.ink,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: sy(12),
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.divider,
    gap: sx(16),
  },
  textContainer: {
    flex: 1,
  },
  componentTitle: {
    fontSize: sx(16),
    fontWeight: '500',
    color: COLOR.ink,
    marginBottom: sy(2),
  },
  componentSubtitle: {
    fontSize: sx(14),
    color: COLOR.label,
    lineHeight: sx(20),
  },
  saveButtonContainer: {
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: COLOR.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: sx(16),
    fontWeight: '600',
  },
});
