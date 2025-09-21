import { Dimensions } from "react-native";

const HI_FI_WIDTH = 412;
const HI_FI_HEIGHT = 917;

export const { width: W, height: H } = Dimensions.get("window");
export const sx = (x: number) => (x / HI_FI_WIDTH) * W;
export const sy = (y: number) => (y / HI_FI_HEIGHT) * H;