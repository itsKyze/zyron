// Renderer branding follows the packaged protocol defined by desktopIdentity.
import { ZYRON_REMOTE_DESKTOP_SCHEME } from "@zyron/shared/desktopIdentity";

export const APP_BASE_NAME = "Zyron";
const isCanaryDesktop =
  typeof window !== "undefined" && window.location?.protocol === "zyron-canary:";
const isBetaDesktop = typeof window !== "undefined" && window.location?.protocol === "zyron-beta:";
const isRemoteDesktop =
  typeof window !== "undefined" && window.location?.protocol === `${ZYRON_REMOTE_DESKTOP_SCHEME}:`;
/** Zyron Remote shares usage and diagnostics by default. */
export const IS_REMOTE_DESKTOP = isRemoteDesktop;
export const APP_DISPLAY_NAME = isRemoteDesktop
  ? "Zyron Remote"
  : isCanaryDesktop
    ? "Zyron Canary"
    : isBetaDesktop
      ? "Zyron Beta"
      : import.meta.env.DEV
        ? `${APP_BASE_NAME} (Dev)`
        : APP_BASE_NAME;
export const APP_VERSION = import.meta.env.APP_VERSION || "0.0.0";
