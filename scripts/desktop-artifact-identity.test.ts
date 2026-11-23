import { describe, expect, it } from "vitest";

import {
  resolveZyronDesktopRuntimeFlavor,
  zyronDesktopIdentity,
} from "@zyron/shared/desktopIdentity";
import { createDesktopArtifactIdentity } from "./lib/desktop-artifact-identity.ts";

describe("desktop artifact identity", () => {
  it.each(["mac", "win"] as const)(
    "preserves the production %s package and artifact names",
    (platform) => {
      const result = createDesktopArtifactIdentity({ platform, flavor: "production" });
      expect(result.packageMetadata).toEqual({
        name: "zyron-desktop",
        productName: "Zyron",
        zyronDesktopFlavor: "production",
      });
      expect(result.buildConfig).toEqual({
        appId: "com.itskyze.zyron",
        productName: "Zyron",
        artifactName: "Zyron-${version}-${arch}.${ext}",
      });
      expect(result.releaseDirectoryName).toBe("release");
      expect(result.identity.usesScriptedUpdates).toBe(false);
    },
  );

  it.each(["canary", "cua"] as const)(
    "keeps packaged %s metadata, native identity, origin, storage and updater policy aligned",
    (flavor) => {
      const result = createDesktopArtifactIdentity({ platform: "mac", flavor });
      const packagedJson = JSON.parse(JSON.stringify(result.packageMetadata));
      const runtimeFlavor = resolveZyronDesktopRuntimeFlavor({
        isPackaged: true,
        isDevelopment: false,
        packagedFlavor: packagedJson.zyronDesktopFlavor,
        requestedFlavor: "production",
      });
      const runtimeIdentity = zyronDesktopIdentity(runtimeFlavor);
      expect(runtimeIdentity).toEqual(result.identity);
      expect(result.buildConfig.appId).toBe(runtimeIdentity.bundleId);
      expect(result.packageMetadata.productName).toBe(result.buildConfig.productName);
      expect(result.packageMetadata.name).toBe(`zyron-desktop-${flavor}`);
      expect(result.buildConfig.protocols).toEqual([
        { name: runtimeIdentity.displayName, schemes: [runtimeIdentity.scheme] },
      ]);
      expect(runtimeIdentity.userDataDirectoryName).toBe(`zyron-${flavor}`);
      expect(runtimeIdentity.defaultHomeDirectoryName).toBe(`.zyron-${flavor}`);
      expect(runtimeIdentity.usesScriptedUpdates).toBe(true);
      expect(result.releaseDirectoryName).toBe(`release-${flavor}`);
      expect(result.buildConfig.artifactName).not.toBe("Zyron-${version}-${arch}.${ext}");
    },
  );

  it.each(["mac", "win", "linux"] as const)(
    "carries Remote identity from the %s package into runtime",
    (platform) => {
      const result = createDesktopArtifactIdentity({ platform, flavor: "remote" });
      const runtimeFlavor = resolveZyronDesktopRuntimeFlavor({
        isPackaged: true,
        isDevelopment: false,
        packagedFlavor: result.packageMetadata.zyronDesktopFlavor,
        requestedFlavor: "production",
      });
      expect(zyronDesktopIdentity(runtimeFlavor)).toEqual(result.identity);
      expect(result.buildConfig).toMatchObject({
        appId: "com.itskyze.zyron.remote",
        productName: "Zyron Remote",
        artifactName: "Zyron-Remote-${version}-${arch}.${ext}",
        protocols: [{ name: "Zyron Remote", schemes: ["zyron-remote"] }],
      });
      expect(result.releaseDirectoryName).toBe("release-remote");
      expect(result.identity.usesScriptedUpdates).toBe(false);
    },
  );

  it.each(["canary", "cua"] as const)(
    "refuses %s on Windows until it has an isolated installer registration",
    (flavor) => {
      expect(() => createDesktopArtifactIdentity({ platform: "win", flavor })).toThrow(
        "macOS and Linux only",
      );
    },
  );
});
