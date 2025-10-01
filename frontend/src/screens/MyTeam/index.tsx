// src/screens/MyTeam/index.tsx
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { sx, sy } from "@/theme/metrics";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useFilterMetadata } from "@/hooks/useFilterMetadata";
import TeamFilter, { TeamFilterValue } from "@/components/overlays/TeamFilter";
import type { TeamMember } from "@/api/team";

export default function MyTeam() {
  const { members, loading, error, refresh } = useTeamMembers();
  const { metadata: filterMetadata } = useFilterMetadata();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<TeamFilterValue>({
    designations: [],
  });

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let result = members;

    // Apply designation filter
    if (filter.designations.length > 0) {
      result = result.filter(m => 
        m.designation && filter.designations.includes(m.designation)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        (m.email?.toLowerCase().includes(query)) ||
        (m.designation?.toLowerCase().includes(query)) ||
        (m.accreditation?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [members, filter, searchQuery]);

  const renderMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item.designation && (
          <View style={styles.designationRow}>
            <Ionicons name="briefcase-outline" size={sx(14)} color={COLOR.label} />
            <Text style={styles.designation}>{item.designation}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
        <Pressable onPress={() => {}} hitSlop={10}>
          <Ionicons name="notifications-outline" size={sx(20)} color="#fff" />
        </Pressable>
      </View>

      {/* Toolbar with filter and search */}
      <View style={styles.toolbar}>
        <Pressable 
          style={styles.iconBtn} 
          onPress={() => setFilterVisible(true)} 
          android_ripple={{ color: "#eaeaea" }}
        >
          <Ionicons name="options-outline" size={sx(18)} color={COLOR.ink} />
        </Pressable>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={sx(18)} color={COLOR.label} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, designation..."
            placeholderTextColor={COLOR.label}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={sx(18)} color={COLOR.label} />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.iconBtn} onPress={refresh} android_ripple={{ color: "#eaeaea" }}>
          {loading ? (
            <ActivityIndicator size="small" color={COLOR.brand} />
          ) : (
            <Ionicons name="refresh" size={sx(18)} color={COLOR.ink} />
          )}
        </Pressable>
      </View>

      {/* Members list */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={COLOR.brand} />
                <Text style={styles.emptyText}>Loading team members...</Text>
              </>
            ) : error ? (
              <>
                <Ionicons name="alert-circle-outline" size={sx(48)} color={COLOR.warn} />
                <Text style={styles.emptyText}>{error}</Text>
                <Pressable onPress={refresh} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Ionicons name="people-outline" size={sx(48)} color={COLOR.label} />
                <Text style={styles.emptyText}>No team members found</Text>
              </>
            )}
          </View>
        }
      />

      {/* Filter Overlay */}
      <TeamFilter
        visible={filterVisible}
        value={filter}
        onChange={setFilter}
        onApply={() => setFilterVisible(false)}
        onClear={() => setFilter({ designations: [] })}
        onClose={() => setFilterVisible(false)}
        designationOptions={filterMetadata.designations}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },
  
  header: {
    height: sy(56),
    backgroundColor: COLOR.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingTop: sy(8),
  },
  headerTitle: { color: "#fff", fontSize: sx(18), fontWeight: "700" },
  
  toolbar: {
    height: sy(56),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sx(10),
    gap: sx(8),
    backgroundColor: "#fff",
  },
  iconBtn: { 
    width: sx(36), 
    height: sy(36), 
    borderRadius: sx(8), 
    alignItems: "center", 
    justifyContent: "center" 
  },
  searchContainer: {
    flex: 1,
    height: sy(40),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.bg,
    borderRadius: sx(8),
    paddingHorizontal: sx(12),
    gap: sx(8),
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: sx(14),
    color: COLOR.ink,
    padding: 0,
  },
  
  list: { padding: sx(12) },
  
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: sx(12),
    padding: sx(14),
    marginBottom: sy(10),
    borderWidth: 1,
    borderColor: COLOR.divider,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: sx(48),
    height: sy(48),
    borderRadius: sx(24),
    backgroundColor: COLOR.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(12),
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: sx(16) },
  memberInfo: { flex: 1, gap: sy(4) },
  memberName: { color: COLOR.ink, fontWeight: "600", fontSize: sx(15) },
  designationRow: { flexDirection: "row", alignItems: "center", gap: sx(6) },
  designation: { color: COLOR.label, fontSize: sx(13) },
  
  emptyContainer: {
    padding: sx(32),
    alignItems: "center",
    marginTop: sy(60),
  },
  emptyText: { 
    color: COLOR.label, 
    marginTop: sy(12),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: sy(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(8),
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

