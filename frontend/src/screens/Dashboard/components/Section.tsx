import React, { memo } from "react";
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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        data={data}
        keyExtractor={keyExtractor as any}
        renderItem={renderItem as any}
        contentContainerStyle={contentContainerStyle as any}
        {...(flatListProps as any)}
      />
      {footer}
    </View>
  );
}) as <T>(p: Props<T>) => JSX.Element;
