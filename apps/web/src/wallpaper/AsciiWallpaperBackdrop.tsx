// FILE: AsciiWallpaperBackdrop.tsx
// Purpose: Live animated ASCII SVG backdrop layer behind the chat transcript.
// Layer: Web UI component

import { memo } from "react";
import { ASCII_WALLPAPERS, SCENES, type AsciiWallpaperKey } from "./asciiScenes";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";

export const AsciiWallpaperBackdrop = memo(function AsciiWallpaperBackdrop() {
  const wallpaper = useAsciiWallpaperStore((s) => s.wallpaper);
  const glassBlur = useAsciiWallpaperStore((s) => s.glassBlur);
  const glassTintOpacity = useAsciiWallpaperStore((s) => s.glassTintOpacity);

  if (wallpaper === "off" || !wallpaper) {
    return null;
  }

  const svgContent = (SCENES as Record<string, string>)[wallpaper];
  if (!svgContent) {
    return null;
  }

  const definition = ASCII_WALLPAPERS.find((w) => w.key === wallpaper);
  const isLight = definition?.tone === "light";
  const tintColor = isLight
    ? `rgba(250, 250, 248, ${glassTintOpacity})`
    : `rgba(12, 12, 12, ${glassTintOpacity})`;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
      data-testid="ascii-wallpaper-backdrop"
    >
      <div
        className="h-full w-full opacity-90 transition-opacity duration-300 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          backdropFilter: `blur(${glassBlur}px)`,
          WebkitBackdropFilter: `blur(${glassBlur}px)`,
          backgroundColor: tintColor,
        }}
      />
    </div>
  );
});
