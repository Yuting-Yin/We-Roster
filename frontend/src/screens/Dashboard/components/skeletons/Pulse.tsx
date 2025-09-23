import React from "react";
import { View } from "react-native";

export const Pulse = ({ style }: { style: any }) => <View style={[style, { opacity: 0.6 }]} />;
