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

  const moveToTop = (index: number) => {
    if (index > 0) {
      const newComponents = [...components];
      const item = newComponents.splice(index, 1)[0];
      newComponents.unshift(item);
      setComponents(newComponents);
    }
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

  const moveToBottom = (index: number) => {
    if (index < components.length - 1) {
      const newComponents = [...components];
      const item = newComponents.splice(index, 1)[0];
      newComponents.push(item);
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
        <Text style={styles.infoText}>Tap buttons to reorder sections • Checkbox to show/hide</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
        {components.map((item, index) => (
          <View key={item.id} style={styles.sectionWrapper}>
            <View style={styles.componentItem}>
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
            </View>
            
            {/* Reorder Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable 
                style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]} 
                onPress={() => moveToTop(index)}
                disabled={index === 0}
              >
                <Ionicons name="arrow-up-circle-outline" size={sx(18)} color={index === 0 ? COLOR.label : COLOR.brand} />
                <Text style={[styles.actionButtonText, index === 0 && styles.actionButtonTextDisabled]}>Move to Top</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]} 
                onPress={() => moveUp(index)}
                disabled={index === 0}
              >
                <Ionicons name="arrow-up-outline" size={sx(18)} color={index === 0 ? COLOR.label : COLOR.brand} />
                <Text style={[styles.actionButtonText, index === 0 && styles.actionButtonTextDisabled]}>Move Up</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.actionButton, index === components.length - 1 && styles.actionButtonDisabled]} 
                onPress={() => moveDown(index)}
                disabled={index === components.length - 1}
              >
                <Ionicons name="arrow-down-outline" size={sx(18)} color={index === components.length - 1 ? COLOR.label : COLOR.brand} />
                <Text style={[styles.actionButtonText, index === components.length - 1 && styles.actionButtonTextDisabled]}>Move Down</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.actionButton, index === components.length - 1 && styles.actionButtonDisabled]} 
                onPress={() => moveToBottom(index)}
                disabled={index === components.length - 1}
              >
                <Ionicons name="arrow-down-circle-outline" size={sx(18)} color={index === components.length - 1 ? COLOR.label : COLOR.brand} />
                <Text style={[styles.actionButtonText, index === components.length - 1 && styles.actionButtonTextDisabled]}>Move to Bottom</Text>
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
  sectionWrapper: {
    backgroundColor: '#FFFFFF',
    marginBottom: sy(12),
    borderRadius: sx(8),
    marginHorizontal: sx(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sx(16),
    paddingVertical: sy(14),
    gap: sx(12),
  },
  orderBadge: {
    width: sx(36),
    height: sx(36),
    borderRadius: sx(18),
    backgroundColor: COLOR.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: sx(18),
    fontWeight: '700',
  },
  componentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: sx(10),
  },
  checkbox: {
    padding: sx(4),
  },
  textContainer: {
    flex: 1,
  },
  componentTitle: {
    fontSize: sx(16),
    fontWeight: '600',
    color: COLOR.ink,
    marginBottom: sy(2),
  },
  componentSubtitle: {
    fontSize: sx(13),
    color: COLOR.label,
    lineHeight: sx(18),
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sx(8),
    paddingHorizontal: sx(16),
    paddingBottom: sy(12),
    paddingTop: sy(4),
    borderTopWidth: 1,
    borderTopColor: COLOR.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sx(6),
    paddingHorizontal: sx(12),
    paddingVertical: sy(8),
    backgroundColor: COLOR.subtleBlue,
    borderRadius: sx(6),
    borderWidth: 1,
    borderColor: COLOR.brand,
  },
  actionButtonDisabled: {
    opacity: 0.4,
    borderColor: COLOR.divider,
    backgroundColor: COLOR.bg,
  },
  actionButtonText: {
    fontSize: sx(13),
    fontWeight: '500',
    color: COLOR.brand,
  },
  actionButtonTextDisabled: {
    color: COLOR.label,
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
