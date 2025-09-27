import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../styles";

export const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText} numberOfLines={2}>{message}</Text>
    <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
      <Text style={styles.retryText}>Retry</Text>
    </Pressable>
  </View>
);
