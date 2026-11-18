import * as FS from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

import { describe, expect, it } from "vitest";

import {
  acknowledgeZyronStorageSnapshot,
  readZyronStorageSnapshot,
  ZYRON_STORAGE_SNAPSHOT_MAX_BYTES,
  validateZyronStorageSnapshot,
} from "./desktopStorageMigration";

const snapshot = () => ({
  version: 1 as const,
  exportedAt: "2026-07-09T00:00:00.000Z",
  entries: {
    "zyron:theme": "dark",
    "zyron.openUsage.enabled": "true",
  },
});

describe("desktopStorageMigration", () => {
  it("reads a legacy snapshot and removes it after acknowledgement", async () => {
    const directory = FS.mkdtempSync(Path.join(OS.tmpdir(), "zyron-storage-migration-"));
    const target = Path.join(directory, "snapshot.json");
    try {
      FS.writeFileSync(target, `${JSON.stringify(snapshot())}\n`);
      expect(readZyronStorageSnapshot(target)).toEqual(snapshot());

      await acknowledgeZyronStorageSnapshot(target);
      expect(readZyronStorageSnapshot(target)).toBeNull();
    } finally {
      FS.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects malformed, disallowed, and oversized snapshots", () => {
    expect(validateZyronStorageSnapshot({ version: 1 })).toBeNull();
    expect(
      validateZyronStorageSnapshot({
        ...snapshot(),
        entries: { "foreign:theme": "dark" },
      }),
    ).toBeNull();
    expect(
      validateZyronStorageSnapshot({
        ...snapshot(),
        entries: { "zyron:large": "x".repeat(ZYRON_STORAGE_SNAPSHOT_MAX_BYTES) },
      }),
    ).toBeNull();
  });

  it("accepts renderer snapshots containing large composer drafts", () => {
    const largeDraft = "x".repeat(2 * 1024 * 1024);

    expect(
      validateZyronStorageSnapshot({
        ...snapshot(),
        entries: { "zyron:composer-drafts:v1": largeDraft },
      })?.entries["zyron:composer-drafts:v1"],
    ).toBe(largeDraft);
  });

  it("treats missing and malformed files as absent", () => {
    const directory = FS.mkdtempSync(Path.join(OS.tmpdir(), "zyron-storage-migration-"));
    const target = Path.join(directory, "snapshot.json");
    try {
      expect(readZyronStorageSnapshot(target)).toBeNull();
      FS.writeFileSync(target, "not json");
      expect(readZyronStorageSnapshot(target)).toBeNull();
    } finally {
      FS.rmSync(directory, { recursive: true, force: true });
    }
  });
});
