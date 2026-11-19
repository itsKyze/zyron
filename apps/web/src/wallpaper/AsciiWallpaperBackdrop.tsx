// FILE: AsciiWallpaperBackdrop.tsx
// Purpose: Live animated ASCII SVG backdrop layer spanning the full window behind chat & sidebar.
// Layer: Web UI component

import { memo } from "react";
import { SCENES } from "./asciiScenes";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";

/**
 * Bright/daylight scenes that need extra dark scrim in dark mode to keep
 * white/light typography legible and avoid washed-out contrast.
 */
const BRIGHT_SCENES = new Set(["clouds", "honu", "koiPond", "paperBoats"]);

export const AsciiWallpaperBackdrop = memo(function AsciiWallpaperBackdrop() {
  const wallpaper = useAsciiWallpaperStore((s) => s.wallpaper);

  if (wallpaper === "off" || !wallpaper) {
    return null;
  }

  const svgContent = (SCENES as Record<string, string>)[wallpaper];
  if (!svgContent) {
    return null;
  }

  const isBrightScene = BRIGHT_SCENES.has(wallpaper);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
      data-testid="ascii-wallpaper-backdrop"
    >
      <div
        className="h-full w-full transition-opacity duration-300 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {/* Dynamic dark scrim overlay to protect text contrast and prevent eye strain on bright scenes */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isBrightScene ? "bg-black/65 dark:bg-black/75" : "bg-black/30 dark:bg-black/45"
        }`}
      />
    </div>
  );
});
