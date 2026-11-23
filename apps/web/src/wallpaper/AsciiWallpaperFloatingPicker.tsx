// FILE: AsciiWallpaperFloatingPicker.tsx
// Purpose: Interactive floating /theme ASCII wallpaper picker positioned above the chat composer.
// Layer: Web UI component

import { memo, useEffect, useRef, useCallback } from "react";
import { ASCII_WALLPAPERS, CARDS, type AsciiWallpaperKey } from "./asciiScenes";
import { useAsciiWallpaperStore } from "./asciiWallpaperStore";
import { CheckIcon } from "~/lib/icons";
import { cn } from "~/lib/utils";

function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export const AsciiWallpaperFloatingPicker = memo(function AsciiWallpaperFloatingPicker() {
  const isPickerOpen = useAsciiWallpaperStore((s) => s.isPickerOpen);
  const wallpaper = useAsciiWallpaperStore((s) => s.wallpaper);
  const setWallpaper = useAsciiWallpaperStore((s) => s.setWallpaper);
  const closePicker = useAsciiWallpaperStore((s) => s.closePicker);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isPickerOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePicker();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen, closePicker]);

  // Handle keyboard navigation (ArrowLeft, ArrowRight, Enter, Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPickerOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
        return;
      }

      const keys: AsciiWallpaperKey[] = ["off", ...ASCII_WALLPAPERS.map((item) => item.key)];
      const currentIndex = keys.indexOf(wallpaper);

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % keys.length;
        setWallpaper(keys[nextIndex] ?? "off");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
        setWallpaper(keys[prevIndex] ?? "off");
      } else if (e.key === "Enter") {
        e.preventDefault();
        closePicker();
      }
    },
    [isPickerOpen, wallpaper, setWallpaper, closePicker],
  );

  useEffect(() => {
    if (!isPickerOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPickerOpen, handleKeyDown]);

  if (!isPickerOpen) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-[700px]",
        "rounded-2xl border border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl p-3",
        "animate-in fade-in-0 zoom-in-95 duration-150 select-none",
      )}
      data-testid="ascii-wallpaper-floating-picker"
    >
      {/* Header row */}
      <div className="flex items-center justify-between pb-2.5 px-1 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-ui-xs font-semibold text-foreground/80">
            /wallpaper
          </span>
          <span className="text-ui-sm font-medium text-foreground">ASCII wallpapers</span>
        </div>
        <div className="flex items-center gap-2 text-ui-xs text-muted-foreground">
          <span>↵ apply</span>
          <span>·</span>
          <span>esc close</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex items-center gap-2.5 overflow-x-auto pt-2.5 pb-1 px-1 no-scrollbar">
        {/* Off Option */}
        <button
          type="button"
          onClick={() => {
            setWallpaper("off");
          }}
          className={cn(
            "group relative flex shrink-0 w-24 flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all text-left",
            "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0",
            wallpaper === "off"
              ? "bg-accent/80 text-foreground"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
          )}
          style={
            wallpaper === "off"
              ? {
                  boxShadow: `0 0 0 2px var(--color-foreground, #ffffff), 0 0 14px rgba(255,255,255,0.25)`,
                }
              : undefined
          }
        >
          <div
            className={cn(
              "relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 flex items-center justify-center bg-black/40",
              wallpaper === "off"
                ? "border-foreground ring-1 ring-foreground/20"
                : "border-border/50 group-hover:border-border",
            )}
          >
            <span className="text-ui-xs font-mono opacity-60">Off</span>
            {wallpaper === "off" && (
              <div className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-foreground text-background shadow">
                <CheckIcon className="size-2.5" />
              </div>
            )}
          </div>
          <span className="text-ui-xs font-medium text-center truncate w-full">Default</span>
        </button>

        {/* 8 Themes */}
        {ASCII_WALLPAPERS.map((item) => {
          const isSelected = wallpaper === item.key;
          const cardSvg = (CARDS as Record<string, string>)[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setWallpaper(item.key);
              }}
              className={cn(
                "group relative flex shrink-0 w-28 flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all text-left",
                "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0",
                isSelected
                  ? "bg-accent/80 text-foreground"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
              style={
                isSelected
                  ? {
                      borderColor: item.accent,
                      boxShadow: `0 0 0 2px ${item.accent}, 0 0 16px ${item.accent}55`,
                    }
                  : undefined
              }
            >
              <div
                className={cn(
                  "relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 flex items-center justify-center bg-black/70 transition-all",
                  isSelected ? "shadow-sm" : "border-border/50 group-hover:border-border",
                )}
                style={
                  isSelected
                    ? {
                        borderColor: item.accent,
                        boxShadow: `0 0 0 1px ${item.accent}, 0 2px 10px ${item.accent}40`,
                      }
                    : undefined
                }
              >
                <div
                  className="size-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                  dangerouslySetInnerHTML={cardSvg ? { __html: cardSvg } : undefined}
                />
                {isSelected && (
                  <div
                    className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full shadow"
                    style={{
                      backgroundColor: item.accent,
                      color: getContrastTextColor(item.accent),
                    }}
                  >
                    <CheckIcon className="size-2.5" />
                  </div>
                )}
              </div>
              <span
                className="text-ui-xs font-medium text-center truncate w-full transition-colors"
                style={{
                  color: isSelected ? item.accent : undefined,
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
