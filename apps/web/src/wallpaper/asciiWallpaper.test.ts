// FILE: asciiWallpaper.test.ts
// Purpose: Unit tests for ASCII wallpaper store and definitions.
// Layer: Web UI unit test

import { describe, it, expect, beforeEach } from "vitest";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";
import { ASCII_WALLPAPERS, SCENES, CARDS } from "./asciiScenes";

describe("asciiWallpaper", () => {
  beforeEach(() => {
    useAsciiWallpaperStore.setState({
      wallpaper: "off",
      glassBlur: 22,
      glassTintOpacity: 0.55,
    });
  });

  it("initializes with off and updates wallpaper state", () => {
    expect(useAsciiWallpaperStore.getState().wallpaper).toBe("off");
    useAsciiWallpaperStore.getState().setWallpaper("koiPond");
    expect(useAsciiWallpaperStore.getState().wallpaper).toBe("koiPond");
    useAsciiWallpaperStore.getState().setWallpaper("honu");
    expect(useAsciiWallpaperStore.getState().wallpaper).toBe("honu");
    useAsciiWallpaperStore.getState().setWallpaper("off");
    expect(useAsciiWallpaperStore.getState().wallpaper).toBe("off");
  });

  it("updates frosted glass blur and tint opacity", () => {
    useAsciiWallpaperStore.getState().setGlassBlur(30);
    expect(useAsciiWallpaperStore.getState().glassBlur).toBe(30);

    useAsciiWallpaperStore.getState().setGlassTintOpacity(0.7);
    expect(useAsciiWallpaperStore.getState().glassTintOpacity).toBe(0.7);
  });

  it("contains 8 distinct ASCII wallpapers with valid SVG scenes and preview cards", () => {
    expect(ASCII_WALLPAPERS).toHaveLength(8);

    for (const item of ASCII_WALLPAPERS) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.accent.startsWith("#")).toBe(true);

      const sceneSvg = (SCENES as Record<string, string>)[item.key];
      expect(sceneSvg).toBeDefined();
      expect(sceneSvg?.startsWith("<svg")).toBe(true);
      expect(sceneSvg?.endsWith("</svg>")).toBe(true);

      const cardSvg = (CARDS as Record<string, string>)[item.key];
      expect(cardSvg).toBeDefined();
      expect(cardSvg?.startsWith("<svg")).toBe(true);
      expect(cardSvg?.endsWith("</svg>")).toBe(true);
    }
  });
});
