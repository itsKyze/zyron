// Protects packaged app identity, immutable flavor routing and separate storage contracts.
import { describe, expect, it } from "vitest";

import {
  desktopUpdateChannel,
  resolveZyronDesktopFlavor,
  resolveZyronDesktopRuntimeFlavor,
  canOverrideDesktopSmokeUserData,
  ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
  ZYRON_BETA_BUNDLE_ID,
  ZYRON_BETA_DESKTOP_ENTRY_URL,
  ZYRON_BETA_DESKTOP_ORIGIN,
  ZYRON_CANARY_BUNDLE_ID,
  ZYRON_CANARY_DESKTOP_ENTRY_URL,
  ZYRON_CANARY_DESKTOP_ORIGIN,
  ZYRON_CUA_BUNDLE_ID,
  ZYRON_CUA_DESKTOP_ENTRY_URL,
  ZYRON_CUA_DESKTOP_ORIGIN,
  ZYRON_DESKTOP_ENTRY_URL,
  ZYRON_DESKTOP_ORIGIN,
  ZYRON_DESKTOP_UPDATE_CHANNEL,
  ZYRON_DEVELOPMENT_BUNDLE_ID,
  ZYRON_PRODUCTION_BUNDLE_ID,
  ZYRON_REMOTE_BUNDLE_ID,
  zyronDesktopIdentity,
  zyronSourceDesktopIdentity,
} from "./desktopIdentity";

describe("desktopIdentity", () => {
  it("uses the exact canonical production and development bundle IDs", () => {
    expect(ZYRON_PRODUCTION_BUNDLE_ID).toBe("com.itskyze.zyron");
    expect(ZYRON_DEVELOPMENT_BUNDLE_ID).toBe("com.itskyze.zyron.dev");
    expect(zyronDesktopIdentity("production").bundleId).toBe(ZYRON_PRODUCTION_BUNDLE_ID);
    expect(zyronDesktopIdentity("development").bundleId).toBe(ZYRON_DEVELOPMENT_BUNDLE_ID);
  });

  it("keeps source Beta and Remote launches off the installed apps' privacy identity", () => {
    const remote = zyronSourceDesktopIdentity(zyronDesktopIdentity("remote"));
    expect(remote).toEqual({
      ...zyronDesktopIdentity("remote"),
      displayName: "Zyron Remote (Source)",
      bundleId: `${ZYRON_REMOTE_BUNDLE_ID}.source`,
    });
    expect(zyronSourceDesktopIdentity(zyronDesktopIdentity("beta")).bundleId).toBe(
      `${ZYRON_BETA_BUNDLE_ID}.source`,
    );
    for (const flavor of ["development", "canary", "cua"] as const) {
      expect(zyronSourceDesktopIdentity(zyronDesktopIdentity(flavor))).toEqual(
        zyronDesktopIdentity(flavor),
      );
    }
  });

  it("uses the exact packaged renderer origin and entry URL", () => {
    expect(ZYRON_DESKTOP_ORIGIN).toBe("zyron://app");
    expect(ZYRON_DESKTOP_ENTRY_URL).toBe("zyron://app/index.html");
  });

  it("matches the beta update channel to prerelease tags and keeps zyron otherwise", () => {
    expect(desktopUpdateChannel("beta")).toBe("beta");
    expect(desktopUpdateChannel("remote")).toBe("remote");
    expect(desktopUpdateChannel("production")).toBe(ZYRON_DESKTOP_UPDATE_CHANNEL);
    expect(desktopUpdateChannel("canary")).toBe(ZYRON_DESKTOP_UPDATE_CHANNEL);
    expect(desktopUpdateChannel("development")).toBe(ZYRON_DESKTOP_UPDATE_CHANNEL);
  });

  it("gives Canary a fully separate desktop identity and storage profile", () => {
    expect(ZYRON_CANARY_BUNDLE_ID).toBe("com.itskyze.zyron.canary");
    expect(ZYRON_CANARY_DESKTOP_ORIGIN).toBe("zyron-canary://app");
    expect(ZYRON_CANARY_DESKTOP_ENTRY_URL).toBe("zyron-canary://app/index.html");
    expect(zyronDesktopIdentity("canary")).toEqual({
      flavor: "canary",
      displayName: "Zyron Canary",
      bundleId: ZYRON_CANARY_BUNDLE_ID,
      scheme: "zyron-canary",
      origin: ZYRON_CANARY_DESKTOP_ORIGIN,
      entryUrl: ZYRON_CANARY_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-canary",
      defaultHomeDirectoryName: ".zyron-canary",
      usesScriptedUpdates: true,
    });
  });

  it("gives Cua a fully separate desktop identity and storage profile", () => {
    expect(ZYRON_CUA_BUNDLE_ID).toBe("com.itskyze.zyron.cua");
    expect(ZYRON_CUA_DESKTOP_ORIGIN).toBe("zyron-cua://app");
    expect(ZYRON_CUA_DESKTOP_ENTRY_URL).toBe("zyron-cua://app/index.html");
    expect(zyronDesktopIdentity("cua")).toEqual({
      flavor: "cua",
      displayName: "Zyron Cua",
      bundleId: ZYRON_CUA_BUNDLE_ID,
      scheme: "zyron-cua",
      origin: ZYRON_CUA_DESKTOP_ORIGIN,
      entryUrl: ZYRON_CUA_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-cua",
      defaultHomeDirectoryName: ".zyron-cua",
      usesScriptedUpdates: true,
    });
  });

  it("gives Beta a fully separate desktop identity and storage profile", () => {
    expect(ZYRON_BETA_BUNDLE_ID).toBe("com.itskyze.zyron.beta");
    expect(ZYRON_BETA_DESKTOP_ORIGIN).toBe("zyron-beta://app");
    expect(ZYRON_BETA_DESKTOP_ENTRY_URL).toBe("zyron-beta://app/index.html");
    expect(zyronDesktopIdentity("beta")).toEqual({
      flavor: "beta",
      displayName: "Zyron Beta",
      bundleId: ZYRON_BETA_BUNDLE_ID,
      scheme: "zyron-beta",
      origin: ZYRON_BETA_DESKTOP_ORIGIN,
      entryUrl: ZYRON_BETA_DESKTOP_ENTRY_URL,
      userDataDirectoryName: "zyron-beta",
      defaultHomeDirectoryName: ".zyron-beta",
      usesScriptedUpdates: false,
    });
  });

  it("gives Remote its own app, account service, protocol, storage and updater identity", () => {
    expect(zyronDesktopIdentity("remote")).toEqual({
      flavor: "remote",
      displayName: "Zyron Remote",
      bundleId: "com.itskyze.zyron.remote",
      scheme: "zyron-remote",
      origin: "zyron-remote://app",
      entryUrl: "zyron-remote://app/index.html",
      userDataDirectoryName: "zyron-remote",
      defaultHomeDirectoryName: ".zyron-remote",
      defaultAccountUrl: "https://zyron-account-api-trial.zyron-orgs.workers.dev",
      usesScriptedUpdates: false,
    });
    expect(ZYRON_REMOTE_BUNDLE_ID).toBe("com.itskyze.zyron.remote");
    expect(resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: "remote" })).toBe(
      "remote",
    );
  });

  it("selects explicit source flavors without changing packaged Stable", () => {
    expect(resolveZyronDesktopFlavor({ isDevelopment: false })).toBe("production");
    expect(resolveZyronDesktopFlavor({ isDevelopment: true })).toBe("development");
    expect(
      resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: "development" }),
    ).toBe("production");
    expect(
      resolveZyronDesktopFlavor({
        isDevelopment: false,
        requestedFlavor: "development",
        allowDevelopmentOverride: true,
      }),
    ).toBe("development");
    expect(resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: " canary " })).toBe(
      "canary",
    );
    expect(resolveZyronDesktopFlavor({ isDevelopment: true, requestedFlavor: "canary" })).toBe(
      "canary",
    );
    expect(resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: "cua" })).toBe("cua");
    expect(resolveZyronDesktopFlavor({ isDevelopment: true, requestedFlavor: "CUA" })).toBe("cua");
    expect(resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: "beta" })).toBe(
      "beta",
    );
    expect(resolveZyronDesktopFlavor({ isDevelopment: false, requestedFlavor: " beta " })).toBe(
      "beta",
    );
    expect(resolveZyronDesktopFlavor({ isDevelopment: true, requestedFlavor: "beta" })).toBe(
      "beta",
    );
  });

  it("isolates development and Canary homes from packaged Stable", () => {
    expect(zyronDesktopIdentity("development").defaultHomeDirectoryName).toBe(".zyron-dev");
    expect(zyronDesktopIdentity("canary").defaultHomeDirectoryName).toBe(".zyron-canary");
    expect(zyronDesktopIdentity("cua").defaultHomeDirectoryName).toBe(".zyron-cua");
    expect(zyronDesktopIdentity("beta").defaultHomeDirectoryName).toBe(".zyron-beta");
    expect(zyronDesktopIdentity("production").defaultHomeDirectoryName).toBe(".zyron");
  });

  it.each(["production", "canary", "cua", "beta", "remote"] as const)(
    "uses the immutable %s package flavor despite inherited source settings",
    (packagedFlavor) => {
      expect(
        resolveZyronDesktopRuntimeFlavor({
          isPackaged: true,
          isDevelopment: true,
          packagedFlavor,
          requestedFlavor: "development",
          allowDevelopmentOverride: true,
        }),
      ).toBe(packagedFlavor);
    },
  );

  it("keeps legacy packaged Stable independent from a source shell's flavor", () => {
    expect(
      resolveZyronDesktopRuntimeFlavor({
        isPackaged: true,
        isDevelopment: false,
        requestedFlavor: "cua",
      }),
    ).toBe("production");
  });

  it("preserves source launcher routing, including its bundled macOS bootstrap", () => {
    expect(
      resolveZyronDesktopRuntimeFlavor({
        isPackaged: true,
        isDevelopment: false,
        requestedFlavor: "development",
        allowDevelopmentOverride: true,
      }),
    ).toBe("development");
    expect(
      resolveZyronDesktopRuntimeFlavor({
        isPackaged: false,
        isDevelopment: true,
        requestedFlavor: "canary",
      }),
    ).toBe("canary");
  });

  it.each(["development", "CUA", null])(
    "rejects malformed packaged identity %j before opening any profile",
    (packagedFlavor) => {
      expect(() =>
        resolveZyronDesktopRuntimeFlavor({
          isPackaged: true,
          isDevelopment: false,
          packagedFlavor,
        }),
      ).toThrow("packaged Zyron desktop flavor is invalid");
    },
  );

  it("isolates smoke profiles only for source launches or isolated packages", () => {
    expect(canOverrideDesktopSmokeUserData({ packagedFlavor: "cua" })).toBe(true);
    expect(canOverrideDesktopSmokeUserData({ packagedFlavor: "beta" })).toBe(true);
    expect(canOverrideDesktopSmokeUserData({ packagedFlavor: "remote" })).toBe(true);
    expect(
      canOverrideDesktopSmokeUserData({
        sourceBuildMarker: ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
      }),
    ).toBe(true);
    for (const packagedFlavor of ["production", "canary", "development", null]) {
      expect(
        canOverrideDesktopSmokeUserData({
          packagedFlavor,
          sourceBuildMarker: ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
        }),
      ).toBe(false);
    }
    expect(canOverrideDesktopSmokeUserData({})).toBe(false);
  });
});
