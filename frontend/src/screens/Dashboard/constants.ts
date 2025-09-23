// src/screens/Dashboard/constants.ts
import { Platform } from "react-native";
import { sx } from "@/theme/metrics";

export const IS_WEB = Platform.OS === "web";

export const CARD_W = Math.round(sx(280));
export const CARD_GAP = Math.round(sx(16));
export const LEFT_PAD = Math.round(sx(16));
export const SNAP = CARD_W + CARD_GAP;
export const INITIALS_SIZE = Math.round(sx(70));
