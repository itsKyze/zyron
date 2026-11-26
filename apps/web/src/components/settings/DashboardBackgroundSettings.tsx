import { useRef, useState } from "react";
import { SettingsRow } from "~/components/settings/SettingsPanelPrimitives";
import { SettingsSelectControl } from "~/components/settings/SettingControls";
import { Button } from "~/components/ui/button";
import { Dialog, DialogHeader, DialogPopup, DialogTitle } from "~/components/ui/dialog";
import { SelectItem } from "~/components/ui/select";
import { RotateCcwIcon, TrashCanIcon } from "~/lib/icons";
import { cn } from "~/lib/utils";
import {
  type DashboardBackgroundAspect,
  type DashboardBackgroundEffect,
  useDashboardBackgroundStore,
} from "~/wallpaper/dashboardBackgroundStore";

const EFFECT_OPTIONS: ReadonlyArray<{ value: DashboardBackgroundEffect; label: string }> = [
  { value: "none", label: "None" },
  { value: "dither", label: "Dither" },
  { value: "grain", label: "Grain" },
  { value: "vignette", label: "Vignette" },
];

const ASPECT_OPTIONS: ReadonlyArray<{ value: DashboardBackgroundAspect; label: string }> = [
  { value: "free", label: "Free" },
  { value: "original", label: "Original" },
  { value: "window", label: "Window" },
  { value: "16:9", label: "16:9" },
  { value: "16:10", label: "16:10" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
];

function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-ui text-foreground">{props.label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="h-1.5 w-36 cursor-pointer accent-primary"
        />
        <span className="w-12 text-right text-ui-xs tabular-nums text-muted-foreground">
          {props.value}
          {props.unit}
        </span>
      </div>
    </div>
  );
}

export function DashboardBackgroundSettings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const state = useDashboardBackgroundStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        state.setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col divide-y divide-border/60">
      <SettingsRow
        title="Dashboard background"
        description="Custom image or gif for home dashboard"
      >
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {state.imageDataUrl ? (
            <img
              src={state.imageDataUrl}
              alt="Dashboard background thumbnail"
              className="size-7 rounded-md border border-border object-cover"
            />
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Choose image or GIF"
          >
            <span>{state.imageDataUrl ? "Change" : "Upload"}</span>
          </Button>
          {state.imageDataUrl ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdjustOpen(true)}
                title="Adjust crop & position"
              >
                <span>Adjust</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => state.setImageDataUrl(null)}
                title="Remove background"
              >
                <TrashCanIcon className="size-3.5" />
              </Button>
            </>
          ) : null}
        </div>
      </SettingsRow>

      <SettingsRow title="Background effect" description="Visual overlay applied over the image">
        <SettingsSelectControl
          ariaLabel="Background effect"
          value={state.effect}
          valueContent={EFFECT_OPTIONS.find((o) => o.value === state.effect)?.label ?? "None"}
          onValueChange={(value) => {
            if (value) state.setEffect(value as DashboardBackgroundEffect);
          }}
        >
          {EFFECT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SettingsSelectControl>
      </SettingsRow>

      <div className="py-3">
        <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-background">
          {state.imageDataUrl ? (
            <img
              src={state.imageDataUrl}
              alt="Background preview"
              className="absolute inset-0 size-full object-cover"
              style={{
                opacity: state.imageOpacity / 100,
                filter: `brightness(${state.brightness}%) blur(${state.blur}px)`,
                objectPosition: `${state.crop.offsetX}% ${state.crop.offsetY}%`,
                transform: `scale(${state.crop.scale})`,
              }}
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${state.overlayOpacity / 100})`,
              backgroundImage:
                state.effect === "vignette"
                  ? "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.75) 100%)"
                  : state.effect === "grain"
                    ? "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)"
                    : state.effect === "dither"
                      ? "radial-gradient(rgba(0,0,0,0.35) 1px, transparent 0)"
                      : undefined,
              backgroundSize:
                state.effect === "grain" || state.effect === "dither" ? "3px 3px" : undefined,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,${state.bottomFade / 100}), transparent)`,
            }}
          />
          <div className="relative z-10 flex size-full items-center justify-center p-4">
            <div
              className="w-full max-w-xs rounded-xl border border-border/80 bg-card px-3 py-2.5 text-ui-xs text-muted-foreground shadow-sm"
              style={{ opacity: state.inputOpacity / 100 }}
            >
              Ask anything
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col py-1">
        <SliderRow
          label="Brightness"
          value={state.brightness}
          min={30}
          max={150}
          unit="%"
          onChange={state.setBrightness}
        />
        <SliderRow
          label="Blur"
          value={state.blur}
          min={0}
          max={24}
          unit="px"
          onChange={state.setBlur}
        />
        <SliderRow
          label="Image opacity"
          value={state.imageOpacity}
          min={0}
          max={100}
          unit="%"
          onChange={state.setImageOpacity}
        />
        <SliderRow
          label="Bottom fade"
          value={state.bottomFade}
          min={0}
          max={100}
          unit="%"
          onChange={state.setBottomFade}
        />
        <SliderRow
          label="Overlay opacity"
          value={state.overlayOpacity}
          min={0}
          max={90}
          unit="%"
          onChange={state.setOverlayOpacity}
        />
        <SliderRow
          label="Input opacity"
          value={state.inputOpacity}
          min={20}
          max={100}
          unit="%"
          onChange={state.setInputOpacity}
        />
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={state.resetDefaults}>
            <RotateCcwIcon className="size-3.5" />
            <span>Reset to defaults</span>
          </Button>
        </div>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogPopup className="max-w-lg p-5">
          <DialogHeader>
            <DialogTitle>Adjust dashboard background</DialogTitle>
          </DialogHeader>
          {state.imageDataUrl ? (
            <div className="flex flex-col gap-4">
              <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-black">
                <img
                  src={state.imageDataUrl}
                  alt="Adjust background"
                  className="size-full object-cover"
                  style={{
                    objectPosition: `${state.crop.offsetX}% ${state.crop.offsetY}%`,
                    transform: `scale(${state.crop.scale})`,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={state.crop.aspect === opt.value ? "default" : "outline"}
                    size="xs"
                    onClick={() => state.setCrop({ ...state.crop, aspect: opt.value })}
                    className={cn(state.crop.aspect === opt.value && "font-medium")}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <SliderRow
                label="Zoom"
                value={Math.round(state.crop.scale * 100)}
                min={100}
                max={200}
                unit="%"
                onChange={(v) => state.setCrop({ ...state.crop, scale: v / 100 })}
              />
              <SliderRow
                label="Vertical position"
                value={state.crop.offsetY}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => state.setCrop({ ...state.crop, offsetY: v })}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    state.setCrop({ scale: 1, offsetX: 50, offsetY: 50, aspect: "free" })
                  }
                >
                  Reset
                </Button>
                <Button size="sm" onClick={() => setAdjustOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          ) : null}
        </DialogPopup>
      </Dialog>
    </div>
  );
}
