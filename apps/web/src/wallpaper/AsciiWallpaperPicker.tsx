// FILE: AsciiWallpaperPicker.tsx
// Purpose: Interactive picker for ASCII animated wallpapers with live card previews.
// Layer: Settings view component

import { memo } from "react";
import { cn } from "~/lib/utils";
import { ASCII_WALLPAPERS, CARDS, type AsciiWallpaperKey } from "./asciiScenes";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";
import { CheckIcon } from "~/lib/icons";

function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export const AsciiWallpaperPicker = memo(function AsciiWallpaperPicker() {
  const wallpaper = useAsciiWallpaperStore((s) => s.wallpaper);
  const glassBlur = useAsciiWallpaperStore((s) => s.glassBlur);
  const glassTintOpacity = useAsciiWallpaperStore((s) => s.glassTintOpacity);
  const setWallpaper = useAsciiWallpaperStore((s) => s.setWallpaper);
  const setGlassBlur = useAsciiWallpaperStore((s) => s.setGlassBlur);
  const setGlassTintOpacity = useAsciiWallpaperStore((s) => s.setGlassTintOpacity);

  return (
    <div className="flex flex-col gap-4">
      {/* Grid of wallpaper cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Off option */}
        <button
          type="button"
          onClick={() => setWallpaper("off")}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-all",
            "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 hover:border-foreground/40 hover:bg-muted/30",
            wallpaper === "off"
              ? "border-foreground bg-foreground/10 shadow-sm ring-1 ring-foreground/20"
              : "border-border/60 bg-background/50",
          )}
          style={{ minHeight: "110px" }}
        >
          <div className="flex size-9 items-center justify-center rounded-full border border-dashed border-border/80 text-muted-foreground group-hover:border-foreground/50">
            {wallpaper === "off" ? (
              <CheckIcon className="size-4 text-foreground" />
            ) : (
              <span className="text-ui-xs font-mono">Ø</span>
            )}
          </div>
          <span className="mt-2 text-ui font-medium">Off</span>
          <span className="text-ui-xs text-muted-foreground">Solid theme</span>
        </button>

        {/* Wallpaper entries */}
        {ASCII_WALLPAPERS.map((item) => {
          const isSelected = wallpaper === item.key;
          const cardSvg = (CARDS as Record<string, string>)[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setWallpaper(item.key)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-lg border-2 text-start transition-all",
                "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 hover:border-foreground/40 hover:shadow-md",
                isSelected ? "shadow-sm" : "border-border/60 bg-card/60",
              )}
              style={
                isSelected
                  ? {
                      borderColor: item.accent,
                      boxShadow: `0 0 0 2px ${item.accent}, 0 0 16px ${item.accent}50, 0 2px 10px ${item.accent}30`,
                    }
                  : undefined
              }
            >
              {/* Thumbnail SVG container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 flex items-center justify-center">
                <div
                  className="size-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                  dangerouslySetInnerHTML={cardSvg ? { __html: cardSvg } : undefined}
                />
                {isSelected && (
                  <div
                    className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full shadow"
                    style={{
                      backgroundColor: item.accent,
                      color: getContrastTextColor(item.accent),
                    }}
                  >
                    <CheckIcon className="size-3" />
                  </div>
                )}
                {/* Accent line */}
                <div
                  className="absolute bottom-0 inset-x-0 h-0.5"
                  style={{ backgroundColor: item.accent }}
                />
              </div>

              {/* Title & description */}
              <div className="flex flex-col p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="text-ui font-medium leading-snug truncate transition-colors"
                    style={{ color: isSelected ? item.accent : undefined }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.accent }}
                    title={item.name}
                  />
                </div>
                <span className="mt-0.5 line-clamp-1 text-ui-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Adjustments: Glass Blur and Opacity */}
      {wallpaper !== "off" && (
        <div className="mt-2 flex flex-col sm:flex-row gap-4 rounded-lg border border-border/50 bg-muted/20 p-3.5">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-ui-sm">
              <span className="font-medium text-foreground">Frosted Glass Blur</span>
              <span className="font-mono text-ui-xs text-muted-foreground">{glassBlur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={glassBlur}
              onChange={(e) => setGlassBlur(Number(e.target.value))}
              className="accent-primary h-1.5 w-full cursor-pointer rounded-lg bg-muted"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-ui-sm">
              <span className="font-medium text-foreground">Glass Tint Opacity</span>
              <span className="font-mono text-ui-xs text-muted-foreground">
                {Math.round(glassTintOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={glassTintOpacity}
              onChange={(e) => setGlassTintOpacity(Number(e.target.value))}
              className="accent-primary h-1.5 w-full cursor-pointer rounded-lg bg-muted"
            />
          </div>
        </div>
      )}
    </div>
  );
});
