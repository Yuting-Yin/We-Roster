import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DashboardSection>) => {
    return (
      <ScaleDecorator>
        <View style={[styles.componentItem, isActive && styles.componentItemActive]}>
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
          <Pressable 
            style={styles.dragHandle} 
            onPressIn={drag}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="reorder-three-outline" size={sx(28)} color={COLOR.label} />
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={components}
        onDragEnd={({ data }) => setComponents(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      
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
  componentItemActive: {
    backgroundColor: COLOR.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
  dragHandle: {
    marginLeft: sx(12),
    padding: sx(8),
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
