import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DashboardBackgroundEffect = "none" | "dither" | "grain" | "vignette";
export type DashboardBackgroundAspect =
  | "free"
  | "original"
  | "window"
  | "16:9"
  | "16:10"
  | "4:3"
  | "1:1";

export interface DashboardBackgroundCrop {
  scale: number;
  offsetX: number;
  offsetY: number;
  aspect: DashboardBackgroundAspect;
}

export interface DashboardBackgroundState {
  imageDataUrl: string | null;
  effect: DashboardBackgroundEffect;
  brightness: number;
  blur: number;
  imageOpacity: number;
  bottomFade: number;
  overlayOpacity: number;
  inputOpacity: number;
  crop: DashboardBackgroundCrop;
  setImageDataUrl: (url: string | null) => void;
  setEffect: (effect: DashboardBackgroundEffect) => void;
  setBrightness: (value: number) => void;
  setBlur: (value: number) => void;
  setImageOpacity: (value: number) => void;
  setBottomFade: (value: number) => void;
  setOverlayOpacity: (value: number) => void;
  setInputOpacity: (value: number) => void;
  setCrop: (crop: DashboardBackgroundCrop) => void;
  resetDefaults: () => void;
}

export const DEFAULT_DASHBOARD_BACKGROUND = {
  effect: "none" as DashboardBackgroundEffect,
  brightness: 100,
  blur: 0,
  imageOpacity: 100,
  bottomFade: 100,
  overlayOpacity: 0,
  inputOpacity: 100,
  crop: {
    scale: 1,
    offsetX: 50,
    offsetY: 50,
    aspect: "free" as DashboardBackgroundAspect,
  },
};

export const useDashboardBackgroundStore = create<DashboardBackgroundState>()(
  persist(
    (set) => ({
      imageDataUrl: null,
      ...DEFAULT_DASHBOARD_BACKGROUND,
      setImageDataUrl: (imageDataUrl) => set({ imageDataUrl }),
      setEffect: (effect) => set({ effect }),
      setBrightness: (brightness) => set({ brightness }),
      setBlur: (blur) => set({ blur }),
      setImageOpacity: (imageOpacity) => set({ imageOpacity }),
      setBottomFade: (bottomFade) => set({ bottomFade }),
      setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
      setInputOpacity: (inputOpacity) => set({ inputOpacity }),
      setCrop: (crop) => set({ crop }),
      resetDefaults: () => set({ ...DEFAULT_DASHBOARD_BACKGROUND }),
    }),
    {
      name: "zyron-dashboard-background",
    },
  ),
);
