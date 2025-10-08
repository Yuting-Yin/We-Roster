import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { RootStackParamList } from "@/navigation/RootNavigator";

type EditDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditDashboard'>;

interface DashboardComponent {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export default function EditDashboard() {
  const navigation = useNavigation<EditDashboardNavigationProp>();
  
  const [components, setComponents] = useState<DashboardComponent[]>([
    {
      id: 'whos-on-duty',
      title: "Who's on duty",
      subtitle: "See who's on the duty based on your saved filter",
      enabled: true,
    },
    {
      id: 'upcoming-shifts',
      title: "Upcoming shifts",
      subtitle: "View your scheduled shifts for this week",
      enabled: true,
    },
    {
      id: 'upcoming-leaves',
      title: "Upcoming leaves",
      subtitle: "Track your approved and pending leaves for this month",
      enabled: true,
    },
    {
      id: 'open-shifts',
      title: "Open shifts",
      subtitle: "Browse available shifts you can apply for this week",
      enabled: true,
    },
  ]);

  const handleToggleComponent = (id: string) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
      )
    );
  };

  const handleSave = () => {
    // TODO: Implement saving dashboard preferences
    console.log('Saving dashboard components:', components);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {components.map((component) => (
          <View key={component.id} style={styles.componentItem}>
            <View style={styles.componentLeft}>
              <Pressable 
                style={styles.checkbox} 
                onPress={() => handleToggleComponent(component.id)}
              >
                <Ionicons 
                  name={component.enabled ? "checkbox" : "square-outline"} 
                  size={sx(20)} 
                  color={component.enabled ? COLOR.brand : COLOR.label} 
                />
              </Pressable>
              <View style={styles.textContainer}>
                <Text style={styles.componentTitle}>{component.title}</Text>
                <Text style={styles.componentSubtitle}>{component.subtitle}</Text>
              </View>
            </View>
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-three-outline" size={sx(20)} color={COLOR.label} />
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
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: COLOR.bg,
  },
  componentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: sx(12),
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
  },
  saveButtonContainer: {
    paddingHorizontal: sx(20),
    paddingVertical: sy(16),
    backgroundColor: COLOR.bg,
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
