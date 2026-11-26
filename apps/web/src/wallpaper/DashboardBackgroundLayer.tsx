import { useDashboardBackgroundStore } from "~/wallpaper/dashboardBackgroundStore";

export function DashboardBackgroundLayer() {
  const { imageDataUrl, effect, brightness, blur, imageOpacity, bottomFade, overlayOpacity, crop } =
    useDashboardBackgroundStore();

  if (!imageDataUrl) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={imageDataUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
        style={{
          opacity: imageOpacity / 100,
          filter: `brightness(${brightness}%) blur(${blur}px)`,
          objectPosition: `${crop.offsetX}% ${crop.offsetY}%`,
          transform: `scale(${crop.scale})`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
          backgroundImage:
            effect === "vignette"
              ? "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.75) 100%)"
              : effect === "grain"
                ? "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)"
                : effect === "dither"
                  ? "radial-gradient(rgba(0,0,0,0.35) 1px, transparent 0)"
                  : undefined,
          backgroundSize: effect === "grain" || effect === "dither" ? "3px 3px" : undefined,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,${bottomFade / 100}), transparent)`,
        }}
      />
    </div>
  );
}
