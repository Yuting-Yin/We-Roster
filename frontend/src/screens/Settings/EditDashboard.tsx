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

  const moveUp = (index: number) => {
    if (index > 0) {
      const newComponents = [...components];
      [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
      setComponents(newComponents);
    }
  };

  const moveDown = (index: number) => {
    if (index < components.length - 1) {
      const newComponents = [...components];
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
      setComponents(newComponents);
    }
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
        {components.map((item, index) => (
          <View key={item.id} style={styles.componentItem}>
            <View style={styles.componentLeft}>
              <Pressable 
                style={styles.checkbox} 
                onPress={() => handleToggleComponent(item.id)}
              >
                <Ionicons 
                  name={item.enabled ? "checkbox" : "square-outline"} 
                  size={sx(24)} 
                  color={item.enabled ? COLOR.brand : COLOR.label} 
                />
              </Pressable>
              <View style={styles.textContainer}>
                <Text style={styles.componentTitle}>{item.title}</Text>
                <Text style={styles.componentSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.reorderButtons}>
              <Pressable 
                style={[styles.arrowButton, index === 0 && styles.arrowButtonDisabled]} 
                onPress={() => moveUp(index)}
                disabled={index === 0}
              >
                <Ionicons 
                  name="chevron-up" 
                  size={sx(20)} 
                  color={index === 0 ? COLOR.divider : COLOR.ink} 
                />
              </Pressable>
              <Pressable 
                style={[styles.arrowButton, index === components.length - 1 && styles.arrowButtonDisabled]} 
                onPress={() => moveDown(index)}
                disabled={index === components.length - 1}
              >
                <Ionicons 
                  name="chevron-down" 
                  size={sx(20)} 
                  color={index === components.length - 1 ? COLOR.divider : COLOR.ink} 
                />
              </Pressable>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: sy(20),
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.divider,
  },
  componentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: sx(12),
    padding: sx(4),
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
  },
  reorderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sx(4),
    marginLeft: sx(12),
  },
  arrowButton: {
    padding: sx(8),
    borderRadius: sx(6),
    backgroundColor: COLOR.bg,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  saveButtonContainer: {
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: COLOR.bg,
    borderTopWidth: 1,
    borderTopColor: COLOR.divider,
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
