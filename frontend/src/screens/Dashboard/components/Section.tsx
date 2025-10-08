import React, { memo, RefObject } from "react";
import { View, Text, Pressable, FlatList, FlatListProps, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { styles } from "../styles";

type Props<T> = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  data: ReadonlyArray<T>;
  keyExtractor: FlatListProps<T>["keyExtractor"];
  renderItem: FlatListProps<T>["renderItem"];
  contentContainerStyle?: ViewStyle | Record<string, unknown>;
  flatListProps?: Partial<FlatListProps<T>>;
  footer?: React.ReactNode;
  emptyText?: string;
  flatListRef?: RefObject<FlatList<T> | null>;
};

export const Section = memo(function Section<T>({
  title,
  actionLabel,
  onAction,
  data,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  flatListProps,
  footer,
  emptyText,
  flatListRef,
}: Props<T>) {
  return (
    <View style={{ marginTop: sx(16) }}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>{actionLabel}</Text>
              <Ionicons name="chevron-forward" size={sx(12)} color={COLOR.ink} />
            </View>
          </Pressable>
        ) : null}
      </View>

      {data.length === 0 && emptyText ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          data={data}
          keyExtractor={keyExtractor as any}
          renderItem={renderItem as any}
          contentContainerStyle={[{ paddingBottom: 16 }, contentContainerStyle as any]}
          {...(flatListProps as any)}
        />
      )}
      {footer}
    </View>
  );
}) as <T>(p: Props<T>) => React.ReactElement;
