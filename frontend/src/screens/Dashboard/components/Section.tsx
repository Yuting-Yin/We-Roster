import React, { memo, RefObject, useMemo } from "react";
import { View, Text, Pressable, FlatList, FlatListProps, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { styles } from "../styles";
import { MoreCardsIndicator } from "./MoreCardsIndicator";

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
  maxCards?: number; // Maximum number of cards to show
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
  maxCards,
}: Props<T>) {
  // Calculate displayed data and hidden count
  const { displayedData, hiddenCount } = useMemo(() => {
    if (!maxCards || data.length <= maxCards) {
      return { displayedData: data, hiddenCount: 0 };
    }
    return {
      displayedData: data.slice(0, maxCards),
      hiddenCount: data.length - maxCards,
    };
  }, [data, maxCards]);

  // Custom render item that adds the "more" indicator at the end
  const renderItemWithMore = useMemo(() => {
    if (!renderItem) return undefined;
    
    return ({ item, index }: { item: T; index: number }) => {
      const itemElement = renderItem({ item, index } as any);
      
      // If this is the last displayed item and there are hidden cards, add the more indicator
      if (index === displayedData.length - 1 && hiddenCount > 0) {
        return (
          <>
            {itemElement}
            <MoreCardsIndicator count={hiddenCount} />
          </>
        );
      }
      
      return itemElement;
    };
  }, [renderItem, displayedData.length, hiddenCount]);

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
          data={displayedData}
          keyExtractor={keyExtractor as any}
          renderItem={renderItemWithMore as any}
          contentContainerStyle={[{ paddingBottom: 16 }, contentContainerStyle as any]}
          {...(flatListProps as any)}
        />
      )}
      {footer}
    </View>
  );
}) as <T>(p: Props<T>) => React.ReactElement;
