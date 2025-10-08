// src/screens/Dashboard/styles.ts
import { StyleSheet } from "react-native";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { CARD_W, CARD_GAP, INITIALS_SIZE } from "./constants";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLOR.brand,
    paddingVertical: sy(16),
    paddingHorizontal: sx(18),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: sx(4) },
  headerTitle: { color: "#fff", fontSize: sx(20), marginHorizontal: sx(4) },

  // Section
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: sx(16),
    marginBottom: sy(8),
  },
  sectionTitle: { color: COLOR.text, fontSize: sx(14), flex: 1 },
  actionRow: { flexDirection: "row", alignItems: "center" },
  actionText: { color: COLOR.ink, fontSize: sx(12), marginRight: sx(6) },

  // Error banner
  errorBanner: {
    backgroundColor: COLOR.warnBg,
    borderColor: COLOR.warn,
    borderWidth: 1,
    margin: sx(16),
    padding: sx(12),
    borderRadius: sx(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: { color: COLOR.warn, fontSize: sx(12), flex: 1, marginRight: sx(12) },
  retryBtn: { backgroundColor: COLOR.warn, paddingVertical: sy(6), paddingHorizontal: sx(10), borderRadius: sx(6) },
  retryText: { color: "#fff", fontSize: sx(12) },

  // Cards shared
  card: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(16),
    paddingHorizontal: 0,
    marginRight: CARD_GAP,
    width: CARD_W,
    backgroundColor: COLOR.bg,
    justifyContent: "flex-start", // Align content to top
    minHeight: sy(180), // Ensure minimum height
  },
  cardContent: {
    flex: 1, // Take remaining space
    justifyContent: "center", // Center content vertically in remaining space
  },
  cardTopRow: { flexDirection: "row", marginBottom: sy(8), marginHorizontal: sx(16) },
  initials: {
    width: INITIALS_SIZE,
    height: INITIALS_SIZE,
    backgroundColor: COLOR.brand,
    borderRadius: sx(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(16),
    marginTop: sx(6),
  },
  initialsText: { color: "#fff", fontSize: sx(20), fontWeight: "600", lineHeight: sx(20) },
  cardName: { color: COLOR.text, fontSize: sx(16), marginBottom: sy(8), marginHorizontal: sx(16), fontWeight: "600" },
  cardDivider: { height: 1, backgroundColor: COLOR.brand, marginHorizontal: sx(16), marginBottom: sy(8) },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: sx(16) },

  // Shift card
  shiftCard: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    padding: sx(16),
    marginRight: CARD_GAP,
    minWidth: CARD_W,
    width: CARD_W,
    backgroundColor: COLOR.bg,
    minHeight: sy(180), // Ensure minimum height to prevent content overflow
    justifyContent: "flex-start", // Align content to top
  },
  shiftDate: { color: COLOR.ink, fontSize: sx(16), marginBottom: sy(4), fontWeight: "600" },
  shiftCardContent: {
    flex: 1, // Take remaining space
    justifyContent: "center", // Center content vertically in remaining space
  },
  bonusText: { color: COLOR.ink, fontSize: sx(16), fontWeight: "bold" },
  urgentBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.subtleBlue,
    borderColor: COLOR.brand,
    borderWidth: 1,
    borderRadius: sx(12),
    paddingVertical: sy(4),
    paddingHorizontal: sx(8),
    marginTop: sy(8),
    gap: sx(2),
  },
  urgentText: { color: COLOR.brand, fontSize: sx(12) },

  // Leave card
  leaveCard: {
    borderWidth: 1,
    borderColor: COLOR.brand,
    borderRadius: sx(8),
    paddingVertical: sy(16),
    paddingHorizontal: sx(16),
    marginRight: CARD_GAP,
    minWidth: Math.round(sx(260)),
    backgroundColor: COLOR.bg,
    justifyContent: "flex-start", // Align content to top
    minHeight: sy(180), // Ensure minimum height
  },
  leaveDate: { color: COLOR.ink, fontSize: sx(16), marginBottom: sy(8), fontWeight: "600" },
  leaveCardContent: {
    flex: 1, // Take remaining space
    justifyContent: "center", // Center content vertically in remaining space
  },
  stateBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: sx(12),
    borderWidth: 1,
    paddingVertical: sy(4),
    paddingHorizontal: sx(8),
    marginTop: sy(8),
  },
  stateApproved: { backgroundColor: COLOR.subtleBlue, borderColor: COLOR.brand },
  stateAwaiting: { backgroundColor: COLOR.warnBg, borderColor: COLOR.warn },
  stateDeclined: { backgroundColor: COLOR.redBg, borderColor: COLOR.red },
  stateText: { fontSize: sx(12) },

  // text
  meta12: { color: COLOR.ink, fontSize: sx(12) },

  // Empty state
  emptyContainer: {
    paddingVertical: sy(32),
    paddingHorizontal: sx(16),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLOR.ink,
    fontSize: sx(14),
    textAlign: "center",
  },
});
