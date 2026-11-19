// FILE: DesktopUpdatePill.tsx
// Purpose: Prominent top-right interactive status pill for desktop app updates.
// Layer: Chat / Shell header component

import { executeDesktopUpdateAction, useDesktopUpdateStore } from "~/desktopUpdateStore";
import { isElectron } from "~/env";
import { UpdateDownloadIcon, CheckIcon, CircleAlertIcon, RefreshCwIcon } from "~/lib/icons";
import { cn } from "~/lib/utils";
import {
  getDesktopUpdateButtonTooltip,
  getDesktopUpdatePillLabel,
  getDesktopUpdatePillTone,
  isDesktopUpdateButtonDisabled,
  shouldShowDesktopUpdateButton,
} from "../desktopUpdate.logic";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

export function DesktopUpdatePill() {
  const state = useDesktopUpdateStore((s) => s.state);
  const installing = useDesktopUpdateStore((s) => s.installing);

  if (!isElectron || !state || !shouldShowDesktopUpdateButton(state)) {
    return null;
  }

  const disabled = isDesktopUpdateButtonDisabled(state) || installing;
  const label = getDesktopUpdatePillLabel(state, { installing });
  const tooltip = getDesktopUpdateButtonTooltip(state, { installing });
  const tone = getDesktopUpdatePillTone(state);

  const toneClass = {
    emerald:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25 active:bg-emerald-500/30 animate-pulse",
    amber:
      "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 active:bg-amber-500/25",
    sky: "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/20 active:bg-sky-500/25",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 active:bg-rose-500/25",
  }[tone];

  const IconComponent =
    state.status === "downloaded"
      ? CheckIcon
      : state.status === "downloading"
        ? RefreshCwIcon
        : state.status === "error"
          ? CircleAlertIcon
          : UpdateDownloadIcon;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            onClick={() => executeDesktopUpdateAction()}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-ui-xs font-medium leading-none transition-all duration-150 select-none",
              toneClass,
              disabled && "cursor-not-allowed opacity-75",
            )}
          >
            <IconComponent
              className={cn("size-3.5 shrink-0", state.status === "downloading" && "animate-spin")}
            />
            <span className="truncate">{label}</span>
          </button>
        }
      />
      <TooltipPopup side="bottom">{tooltip}</TooltipPopup>
    </Tooltip>
  );
}
