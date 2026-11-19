// FILE: asciiWallpaperStore.ts
// Purpose: Reactive store and persistence for live ASCII animated chat wallpapers.
// Layer: Web UI wallpaper store

import { create } from "zustand";
import { type AsciiWallpaperKey } from "./asciiScenes";

const STORAGE_KEY = "zyron:ascii-wallpaper";
const DEFAULT_WALLPAPER: AsciiWallpaperKey = "koiPond";

export interface AsciiWallpaperState {
  wallpaper: AsciiWallpaperKey;
  glassBlur: number;
  glassTintOpacity: number;
  setWallpaper: (wallpaper: AsciiWallpaperKey) => void;
  setGlassBlur: (blur: number) => void;
  setGlassTintOpacity: (opacity: number) => void;
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

function updateDocumentAttribute(wallpaper: AsciiWallpaperKey): void {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.dataset.asciiWallpaper = wallpaper;
  }
}

const initialWallpaper = readStoredWallpaper();
updateDocumentAttribute(initialWallpaper);

export const useAsciiWallpaperStore = create<AsciiWallpaperState>((set) => ({
  wallpaper: initialWallpaper,
  glassBlur: 22,
  glassTintOpacity: 0.55,
  setWallpaper: (wallpaper) =>
    set((state) => {
      const next = { ...state, wallpaper };
      persistWallpaperState(next);
      updateDocumentAttribute(wallpaper);
      return next;
    }),
  setGlassBlur: (glassBlur) =>
    set((state) => {
      const next = { ...state, glassBlur };
      persistWallpaperState(next);
      return next;
    }),
  setGlassTintOpacity: (glassTintOpacity) =>
    set((state) => {
      const next = { ...state, glassTintOpacity };
      persistWallpaperState(next);
      return next;
    }),
}));
