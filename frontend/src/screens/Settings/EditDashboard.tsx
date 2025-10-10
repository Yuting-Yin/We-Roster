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
      <View style={styles.infoHeader}>
        <Ionicons name="information-circle-outline" size={sx(18)} color={COLOR.brand} />
        <Text style={styles.infoText}>Tap checkbox to show/hide • Use arrows to reorder</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
        {components.map((item, index) => (
          <View key={item.id} style={styles.componentItem}>
            {/* Order Number */}
            <View style={styles.orderBadge}>
              <Text style={styles.orderNumber}>{index + 1}</Text>
            </View>
            
            {/* Checkbox and Content */}
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
            
            {/* Reorder Controls */}
            <View style={styles.reorderSection}>
              <Text style={styles.reorderLabel}>Order</Text>
              <View style={styles.reorderButtons}>
                <Pressable 
                  style={[styles.arrowButton, index === 0 && styles.arrowButtonDisabled]} 
                  onPress={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <Ionicons 
                    name="chevron-up" 
                    size={sx(24)} 
                    color={index === 0 ? COLOR.divider : COLOR.brand} 
                  />
                </Pressable>
                <Pressable 
                  style={[styles.arrowButton, index === components.length - 1 && styles.arrowButtonDisabled]} 
                  onPress={() => moveDown(index)}
                  disabled={index === components.length - 1}
                >
                  <Ionicons 
                    name="chevron-down" 
                    size={sx(24)} 
                    color={index === components.length - 1 ? COLOR.divider : COLOR.brand} 
                  />
                </Pressable>
              </View>
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
    paddingBottom: sy(20),
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sx(16),
    paddingVertical: sy(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.divider,
    gap: sx(12),
  },
  orderBadge: {
    width: sx(32),
    height: sx(32),
    borderRadius: sx(16),
    backgroundColor: COLOR.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: sx(16),
    fontWeight: '700',
  },
  componentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: sx(8),
  },
  checkbox: {
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
    fontSize: sx(13),
    color: COLOR.label,
    lineHeight: sx(18),
  },
  reorderSection: {
    alignItems: 'center',
    paddingLeft: sx(12),
    borderLeftWidth: 1,
    borderLeftColor: COLOR.divider,
  },
  reorderLabel: {
    fontSize: sx(11),
    color: COLOR.label,
    fontWeight: '600',
    marginBottom: sy(4),
    textTransform: 'uppercase',
  },
  reorderButtons: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  arrowButton: {
    padding: sx(6),
    borderRadius: sx(6),
    backgroundColor: COLOR.subtleBlue,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
    backgroundColor: COLOR.bg,
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
