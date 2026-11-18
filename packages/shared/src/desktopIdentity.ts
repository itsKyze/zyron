// FILE: desktopIdentity.ts
// Purpose: Defines the canonical desktop application identity across packaging and runtime.

export const ZYRON_DESKTOP_SCHEME = "zyron";
export const ZYRON_DESKTOP_ORIGIN = `${ZYRON_DESKTOP_SCHEME}://app`;
export const ZYRON_DESKTOP_ENTRY_URL = `${ZYRON_DESKTOP_ORIGIN}/index.html`;
export const ZYRON_DESKTOP_UPDATE_CHANNEL = "zyron";
export const ZYRON_PRODUCTION_BUNDLE_ID = "com.itskyze.zyron";
export const ZYRON_DEVELOPMENT_BUNDLE_ID = `${ZYRON_PRODUCTION_BUNDLE_ID}.dev`;
export const ZYRON_CANARY_BUNDLE_ID = `${ZYRON_PRODUCTION_BUNDLE_ID}.canary`;
/** Display/setup identity of the GUI host; this value does not confer native authority. */
export const ZYRON_DESKTOP_BUNDLE_ID_ENV = "ZYRON_DESKTOP_BUNDLE_ID";
export const ZYRON_CANARY_DESKTOP_SCHEME = "zyron-canary";
export const ZYRON_CANARY_DESKTOP_ORIGIN = `${ZYRON_CANARY_DESKTOP_SCHEME}://app`;
export const ZYRON_CANARY_DESKTOP_ENTRY_URL = `${ZYRON_CANARY_DESKTOP_ORIGIN}/index.html`;
export const ZYRON_CUA_BUNDLE_ID = `${ZYRON_PRODUCTION_BUNDLE_ID}.cua`;
export const ZYRON_CUA_DESKTOP_SCHEME = "zyron-cua";
export const ZYRON_CUA_DESKTOP_ORIGIN = `${ZYRON_CUA_DESKTOP_SCHEME}://app`;
export const ZYRON_CUA_DESKTOP_ENTRY_URL = `${ZYRON_CUA_DESKTOP_ORIGIN}/index.html`;
export const ZYRON_BETA_BUNDLE_ID = `${ZYRON_PRODUCTION_BUNDLE_ID}.beta`;
export const ZYRON_BETA_DESKTOP_SCHEME = "zyron-beta";
export const ZYRON_BETA_DESKTOP_ORIGIN = `${ZYRON_BETA_DESKTOP_SCHEME}://app`;
export const ZYRON_BETA_DESKTOP_ENTRY_URL = `${ZYRON_BETA_DESKTOP_ORIGIN}/index.html`;
export const ZYRON_REMOTE_BUNDLE_ID = `${ZYRON_PRODUCTION_BUNDLE_ID}.remote`;
export const ZYRON_REMOTE_DESKTOP_SCHEME = "zyron-remote";
export const ZYRON_REMOTE_DESKTOP_ORIGIN = `${ZYRON_REMOTE_DESKTOP_SCHEME}://app`;
export const ZYRON_REMOTE_DESKTOP_ENTRY_URL = `${ZYRON_REMOTE_DESKTOP_ORIGIN}/index.html`;
export const ZYRON_SOURCE_DESKTOP_BUILD_MARKER = "zyron-source-desktop-build-v2";
export const ZYRON_DESKTOP_SMOKE_USER_DATA_ENV = "ZYRON_DESKTOP_SMOKE_USER_DATA";

export type ZyronDesktopFlavor =
  | "production"
  | "development"
  | "canary"
  | "cua"
  | "beta"
  | "remote";
export const ZYRON_PACKAGED_DESKTOP_FLAVORS = [
  "production",
  "canary",
  "cua",
  "beta",
  "remote",
] as const;
export type ZyronPackagedDesktopFlavor = (typeof ZYRON_PACKAGED_DESKTOP_FLAVORS)[number];

/**
 * electron-updater matches the update channel against the release tag's
 * prerelease identifier. Beta and Remote each follow their own lane;
 * neither may fall through to the Stable payload.
 *
 * The channel stays architecture-independent: electron-updater derives
 * `<channel>-linux[-arch]` (`zyron-linux.yml` for x64, `zyron-linux-arm64.yml`
 * for arm64), and the release pipeline publishes those names beside
 * electron-builder's `latest-linux[-arm64].yml`.
 */
export function desktopUpdateChannel(flavor: ZyronDesktopFlavor): string {
  return flavor === "beta" || flavor === "remote" ? flavor : ZYRON_DESKTOP_UPDATE_CHANNEL;
}

export interface ZyronDesktopIdentity {
  readonly flavor: ZyronDesktopFlavor;
  readonly displayName: string;
  readonly bundleId: string;
  readonly scheme: string;
  readonly origin: string;
  readonly entryUrl: string;
  readonly userDataDirectoryName: string;
  readonly defaultHomeDirectoryName: string;
  /** Hosted account service for this flavor, unless the operator explicitly overrides it. */
  readonly defaultAccountUrl?: string;
  readonly usesScriptedUpdates: boolean;
}

export function resolveZyronDesktopFlavor(input: {
  readonly isDevelopment: boolean;
  readonly requestedFlavor?: string | undefined;
  readonly allowDevelopmentOverride?: boolean | undefined;
}): ZyronDesktopFlavor {
  const requestedFlavor = input.requestedFlavor?.trim().toLowerCase();
  if (requestedFlavor === "cua") {
    return "cua";
  }
  if (requestedFlavor === "canary") {
    return "canary";
  }
  if (requestedFlavor === "beta" || requestedFlavor === "remote") {
    return requestedFlavor;
  }
  if (
    requestedFlavor === "development" &&
    (input.isDevelopment || input.allowDevelopmentOverride === true)
  ) {
    return "development";
  }
  return input.isDevelopment ? "development" : "production";
}

/** Packaged identity is fixed when the artifact is staged, before it is signed. */
export function resolveZyronDesktopRuntimeFlavor(input: {
  readonly isPackaged: boolean;
  readonly isDevelopment: boolean;
  readonly packagedFlavor?: unknown;
  readonly requestedFlavor?: string | undefined;
  readonly allowDevelopmentOverride?: boolean | undefined;
}): ZyronDesktopFlavor {
  if (input.isPackaged && input.packagedFlavor !== undefined) {
    const flavor = input.packagedFlavor;
    if (
      flavor === "production" ||
      flavor === "canary" ||
      flavor === "cua" ||
      flavor === "beta" ||
      flavor === "remote"
    ) {
      return flavor;
    }
    throw new Error("The packaged Zyron desktop flavor is invalid. Rebuild the application.");
  }
  // Source launchers also use an app bundle on macOS. Their build marker keeps
  // the existing environment-based routing, while legacy packaged apps remain
  // Stable even when a developer shell happens to export a different flavor.
  if (input.isPackaged && input.allowDevelopmentOverride !== true) {
    return "production";
  }
  return resolveZyronDesktopFlavor(input);
}

export function canOverrideDesktopSmokeUserData(input: {
  readonly packagedFlavor?: unknown;
  readonly sourceBuildMarker?: string | undefined;
}): boolean {
  return (
    input.packagedFlavor === "cua" ||
    input.packagedFlavor === "beta" ||
    input.packagedFlavor === "remote" ||
    (input.packagedFlavor === undefined &&
      input.sourceBuildMarker === ZYRON_SOURCE_DESKTOP_BUILD_MARKER)
  );
}

export function zyronDesktopIdentity(flavor: ZyronDesktopFlavor): ZyronDesktopIdentity {
  if (flavor === "cua") {
    return {
      flavor,
      displayName: "Zyron Cua",
      bundleId: ZYRON_CUA_BUNDLE_ID,
      scheme: ZYRON_CUA_DESKTOP_SCHEME,
      origin: ZYRON_CUA_DESKTOP_ORIGIN,
      entryUrl: ZYRON_CUA_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-cua",
      defaultHomeDirectoryName: ".zyron-cua",
      usesScriptedUpdates: true,
    };
  }
  if (flavor === "canary") {
    return {
      flavor,
      displayName: "Zyron Canary",
      bundleId: ZYRON_CANARY_BUNDLE_ID,
      scheme: ZYRON_CANARY_DESKTOP_SCHEME,
      origin: ZYRON_CANARY_DESKTOP_ORIGIN,
      entryUrl: ZYRON_CANARY_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-canary",
      defaultHomeDirectoryName: ".zyron-canary",
      usesScriptedUpdates: true,
    };
  }
  if (flavor === "beta") {
    return {
      flavor,
      displayName: "Zyron Beta",
      bundleId: ZYRON_BETA_BUNDLE_ID,
      scheme: ZYRON_BETA_DESKTOP_SCHEME,
      origin: ZYRON_BETA_DESKTOP_ORIGIN,
      entryUrl: ZYRON_BETA_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-beta",
      defaultHomeDirectoryName: ".zyron-beta",
      usesScriptedUpdates: false,
    };
  }
  if (flavor === "remote") {
    return {
      flavor,
      displayName: "Zyron Remote",
      bundleId: ZYRON_REMOTE_BUNDLE_ID,
      scheme: ZYRON_REMOTE_DESKTOP_SCHEME,
      origin: ZYRON_REMOTE_DESKTOP_ORIGIN,
      entryUrl: ZYRON_REMOTE_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-remote",
      defaultHomeDirectoryName: ".zyron-remote",
      defaultAccountUrl: "https://zyron-account-api-trial.zyron-orgs.workers.dev",
      usesScriptedUpdates: false,
    };
  }
  if (flavor === "development") {
    return {
      flavor,
      displayName: "Zyron (Dev)",
      bundleId: ZYRON_DEVELOPMENT_BUNDLE_ID,
      scheme: ZYRON_DESKTOP_SCHEME,
      origin: ZYRON_DESKTOP_ORIGIN,
      entryUrl: ZYRON_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-dev",
      defaultHomeDirectoryName: ".zyron-dev",
      usesScriptedUpdates: false,
    };
  }
  return {
    flavor,
    displayName: "Zyron",
    bundleId: ZYRON_PRODUCTION_BUNDLE_ID,
    scheme: ZYRON_DESKTOP_SCHEME,
    origin: ZYRON_DESKTOP_ORIGIN,
    entryUrl: ZYRON_DESKTOP_ENTRY_URL,
    userDataDirectoryName: "zyron",
    defaultHomeDirectoryName: ".zyron",
    usesScriptedUpdates: false,
  };
}

/**
 * Source launches run an ad-hoc signed Electron copy. Sharing an installed
 * release's identifier makes macOS check that release's privacy grants against
 * the wrong signature, and the launcher's re-sign reset clears them, so source
 * copies of the separately installed Beta and Remote apps get their own.
 */
export function zyronSourceDesktopIdentity(identity: ZyronDesktopIdentity): ZyronDesktopIdentity {
  if (identity.flavor !== "beta" && identity.flavor !== "remote") return identity;
  return {
    ...identity,
    displayName: `${identity.displayName} (Source)`,
    bundleId: `${identity.bundleId}.source`,
  };
}
