// FILE: AsciiWallpaperBackdrop.tsx
// Purpose: Live animated ASCII SVG backdrop layer spanning the full window behind chat & sidebar.
// Layer: Web UI component

import { memo } from "react";
import { SCENES } from "./asciiScenes";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";

export const AsciiWallpaperBackdrop = memo(function AsciiWallpaperBackdrop() {
  const wallpaper = useAsciiWallpaperStore((s) => s.wallpaper);

  if (wallpaper === "off" || !wallpaper) {
    return null;
  }

  const svgContent = (SCENES as Record<string, string>)[wallpaper];
  if (!svgContent) {
    return null;
  }

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
    </div>
  );
});
