// FILE: mac-update-zip.test.ts
// Purpose: Locks down macOS update zip validation and latest-mac.yml patching.
// Layer: Release/build tests
// Depends on: scripts/lib/mac-update-zip.ts.

import { assert, describe, it } from "@effect/vitest";

import {
  assertMacUpdateManifestZipMetadata,
  buildMacUpdateZipSymlinkEntries,
  isZipInfoSymlink,
  resolveMacUpdateManifestFileNames,
  resolveSingleMacUpdateZipFileName,
  resolveSingleTopLevelMacAppBundle,
  updateMacUpdateManifestZipEntry,
} from "./lib/mac-update-zip.ts";

describe("mac-update-zip", () => {
  it("detects symlink entries from unzip verbose metadata", () => {
    assert.equal(
      isZipInfoSymlink(
        `  Unix file attributes (120755 octal):            lrwxr-xr-x
  MS-DOS file attributes (00 hex):                none
`,
      ),
      true,
    );
    assert.equal(
      isZipInfoSymlink(
        `  Unix file attributes (100755 octal):            -rwxr-xr-x
  MS-DOS file attributes (00 hex):                none
`,
      ),
      false,
    );
  });

  it("builds Electron framework symlink paths for the top-level app bundle", () => {
    assert.deepStrictEqual(buildMacUpdateZipSymlinkEntries("Zyron.app"), [
      "Zyron.app/Contents/Frameworks/Electron Framework.framework/Electron Framework",
      "Zyron.app/Contents/Frameworks/Electron Framework.framework/Helpers",
      "Zyron.app/Contents/Frameworks/Electron Framework.framework/Libraries",
      "Zyron.app/Contents/Frameworks/Electron Framework.framework/Resources",
      "Zyron.app/Contents/Frameworks/Electron Framework.framework/Versions/Current",
    ]);
  });

  it("resolves exactly one top-level .app from update zip entries", () => {
    assert.equal(
      resolveSingleTopLevelMacAppBundle([
        "__MACOSX/Zyron.app/Contents/Info.plist",
        "Zyron.app/Contents/Info.plist",
        "Zyron.app/Contents/MacOS/Zyron",
      ]),
      "Zyron.app",
    );

    assert.throws(
      () =>
        resolveSingleTopLevelMacAppBundle([
          "Zyron.app/Contents/Info.plist",
          "Other.app/Contents/Info.plist",
        ]),
      /Expected one top-level \.app bundle/,
    );
  });

  it("resolves exactly one macOS update zip artifact", () => {
    assert.equal(
      resolveSingleMacUpdateZipFileName([
        "Zyron-0.1.5-arm64.dmg",
        "Zyron-0.1.5-arm64.zip",
        "latest-mac.yml",
      ]),
      "Zyron-0.1.5-arm64.zip",
    );

    assert.throws(
      () => resolveSingleMacUpdateZipFileName(["Zyron-0.1.5-arm64.zip", "Zyron-0.1.5-x64.zip"]),
      /Expected one macOS update zip artifact/,
    );
  });

  it("requires at least one macOS update manifest", () => {
    assert.deepStrictEqual(
      resolveMacUpdateManifestFileNames([
        "Zyron-0.1.5-arm64.dmg",
        "Zyron-0.1.5-arm64.zip",
        "latest-mac.yml",
      ]),
      ["latest-mac.yml"],
    );

    assert.throws(
      () => resolveMacUpdateManifestFileNames(["Zyron-0.1.5-arm64.dmg"]),
      /Expected at least one macOS update manifest/,
    );
  });

  it("allows a missing manifest only for an explicitly scripted-update artifact", () => {
    const artifacts = ["Zyron-Cua-0.8.4-arm64.zip"];
    assert.deepStrictEqual(resolveMacUpdateManifestFileNames(artifacts, { required: false }), []);
    assert.throws(() => resolveMacUpdateManifestFileNames(artifacts, { required: true }));
    assert.throws(() => resolveMacUpdateManifestFileNames(artifacts));
  });

  it("still returns present manifests for validation when a feed is optional", () => {
    assert.deepStrictEqual(
      resolveMacUpdateManifestFileNames(["Zyron-Cua-0.8.4-arm64.zip", "latest-mac.yml"], {
        required: false,
      }),
      ["latest-mac.yml"],
    );
  });

  it.each([false, true])(
    "updates zip metadata and preserves dmg fields (blockmaps: %s)",
    (withBlockmaps) => {
      const manifest = `version: 0.1.4
files:
  - url: Zyron-0.1.4-arm64.zip
    sha512: oldzip
    size: 100
${withBlockmaps ? "    blockMapSize: 50\n" : ""}  - url: Zyron-0.1.4-arm64.dmg
    sha512: olddmg
    size: 200
${withBlockmaps ? "    blockMapSize: 75\n" : ""}path: 'Zyron-0.1.4-arm64.zip'
sha512: oldzip
releaseDate: '2026-06-07T12:00:00.000Z'
`;

      const updated = updateMacUpdateManifestZipEntry(manifest, "Zyron-0.1.4-arm64.zip", {
        sha512: "newzip",
        size: 12345,
      });

      assert.equal(
        updated,
        `version: 0.1.4
files:
  - url: Zyron-0.1.4-arm64.zip
    sha512: newzip
    size: 12345
  - url: Zyron-0.1.4-arm64.dmg
    sha512: olddmg
    size: 200
${withBlockmaps ? "    blockMapSize: 75\n" : ""}path: 'Zyron-0.1.4-arm64.zip'
sha512: newzip
releaseDate: '2026-06-07T12:00:00.000Z'
`,
      );
    },
  );

  it("rejects manifests missing the target zip entry", () => {
    assert.throws(
      () =>
        updateMacUpdateManifestZipEntry(
          `version: 0.1.4
files:
  - url: Zyron-0.1.4-arm64.dmg
    sha512: olddmg
    size: 200
releaseDate: '2026-06-07T12:00:00.000Z'
`,
          "Zyron-0.1.4-arm64.zip",
          {
            sha512: "newzip",
            size: 12345,
          },
        ),
      /Could not update Zyron-0.1.4-arm64.zip entry/,
    );
  });

  it("validates manifest metadata after zip repack", () => {
    const manifest = `version: 0.1.5
files:
  - url: Zyron-0.1.5-arm64.zip
    sha512: newzip
    size: 12345
path: Zyron-0.1.5-arm64.zip
sha512: newzip
releaseDate: '2026-06-07T12:00:00.000Z'
`;
    const metadata = { sha512: "newzip", size: 12345 };

    assert.deepStrictEqual(
      assertMacUpdateManifestZipMetadata(manifest, "Zyron-0.1.5-arm64.zip", metadata),
      {
        manifestHasZipPath: true,
        manifestHasZipSha: true,
        manifestHasZipSize: true,
      },
    );
  });
});
