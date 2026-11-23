// FILE: asciiWallpaperStore.ts
// Purpose: Reactive store and persistence for live ASCII animated chat wallpapers.
// Layer: Web UI wallpaper store

import { create } from "zustand";
import { type AsciiWallpaperKey } from "./asciiScenes";

const STORAGE_KEY = "zyron:ascii-wallpaper";
const DEFAULT_WALLPAPER: AsciiWallpaperKey = "off";

export interface AsciiWallpaperState {
  wallpaper: AsciiWallpaperKey;
  glassBlur: number;
  glassTintOpacity: number;
  isPickerOpen: boolean;
  setWallpaper: (wallpaper: AsciiWallpaperKey) => void;
  setGlassBlur: (blur: number) => void;
  setGlassTintOpacity: (opacity: number) => void;
  openPicker: () => void;
  closePicker: () => void;
  togglePicker: () => void;
}

function readStoredWallpaper(): AsciiWallpaperKey {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_WALLPAPER;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WALLPAPER;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed as AsciiWallpaperKey;
    if (parsed && typeof parsed.wallpaper === "string") {
      return parsed.wallpaper as AsciiWallpaperKey;
    }
  } catch {
    // fallback
  }
  return DEFAULT_WALLPAPER;
}

function persistWallpaperState(state: {
  wallpaper: AsciiWallpaperKey;
  glassBlur: number;
  glassTintOpacity: number;
}): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function updateDocumentAttribute(
  wallpaper: AsciiWallpaperKey,
  glassBlur = 16,
  glassTintOpacity = 0.35,
): void {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.dataset.asciiWallpaper = wallpaper;
    document.documentElement.style.setProperty("--ascii-glass-blur", `${glassBlur}px`);
    document.documentElement.style.setProperty("--ascii-glass-tint", `${glassTintOpacity}`);
  }
}

const initialWallpaper = readStoredWallpaper();
updateDocumentAttribute(initialWallpaper, 16, 0.35);

export const useAsciiWallpaperStore = create<AsciiWallpaperState>((set) => ({
  wallpaper: initialWallpaper,
  glassBlur: 16,
  glassTintOpacity: 0.35,
  isPickerOpen: false,
  setWallpaper: (wallpaper) =>
    set((state) => {
      const next = { ...state, wallpaper };
      persistWallpaperState(next);
      updateDocumentAttribute(wallpaper, next.glassBlur, next.glassTintOpacity);
      return next;
    }),
  setGlassBlur: (glassBlur) =>
    set((state) => {
      const next = { ...state, glassBlur };
      persistWallpaperState(next);
      updateDocumentAttribute(next.wallpaper, glassBlur, next.glassTintOpacity);
      return next;
    }),
  setGlassTintOpacity: (glassTintOpacity) =>
    set((state) => {
      const next = { ...state, glassTintOpacity };
      persistWallpaperState(next);
      updateDocumentAttribute(next.wallpaper, next.glassBlur, glassTintOpacity);
      return next;
    }),
  openPicker: () => set({ isPickerOpen: true }),
  closePicker: () => set({ isPickerOpen: false }),
  togglePicker: () => set((state) => ({ isPickerOpen: !state.isPickerOpen })),
}));

if (typeof window !== "undefined") {
  (
    window as unknown as { __asciiWallpaperStore?: typeof useAsciiWallpaperStore }
  ).__asciiWallpaperStore = useAsciiWallpaperStore;
}
