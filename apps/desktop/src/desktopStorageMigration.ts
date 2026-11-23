// FILE: desktopStorageMigration.ts
// Purpose: Reads and acknowledges a validated browser-storage handoff from older desktop builds.
// Layer: Desktop main-process utility

import * as FS from "node:fs";
import * as Path from "node:path";

import type { ZyronStorageSnapshot } from "@zyron/contracts";

export const ZYRON_STORAGE_SNAPSHOT_FILE_NAME = "zyron-storage-origin-v1.json";
export const ZYRON_STORAGE_SNAPSHOT_MAX_BYTES = 16 * 1024 * 1024;
export const ZYRON_STORAGE_SNAPSHOT_MAX_ENTRIES = 2_048;
export const ZYRON_STORAGE_SNAPSHOT_MAX_KEY_LENGTH = 512;
export const ZYRON_STORAGE_SNAPSHOT_MAX_VALUE_LENGTH = 16 * 1024 * 1024;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isZyronStorageKey(key: string): boolean {
  return key.startsWith("zyron:") || key.startsWith("zyron.");
}

export function validateZyronStorageSnapshot(value: unknown): ZyronStorageSnapshot | null {
  if (!isPlainRecord(value) || value.version !== 1 || !isPlainRecord(value.entries)) {
    return null;
  }
  if (typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt))) {
    return null;
  }

  const entries = Object.entries(value.entries);
  if (entries.length > ZYRON_STORAGE_SNAPSHOT_MAX_ENTRIES) {
    return null;
  }
  for (const [key, entryValue] of entries) {
    if (
      !isZyronStorageKey(key) ||
      key.length === 0 ||
      key.length > ZYRON_STORAGE_SNAPSHOT_MAX_KEY_LENGTH ||
      typeof entryValue !== "string" ||
      entryValue.length > ZYRON_STORAGE_SNAPSHOT_MAX_VALUE_LENGTH
    ) {
      return null;
    }
  }

  const snapshot = value as unknown as ZyronStorageSnapshot;
  try {
    if (Buffer.byteLength(JSON.stringify(snapshot), "utf8") > ZYRON_STORAGE_SNAPSHOT_MAX_BYTES) {
      return null;
    }
  } catch {
    return null;
  }
  return snapshot;
}

export function resolveZyronStorageSnapshotPath(userDataPath: string): string {
  return Path.join(userDataPath, ZYRON_STORAGE_SNAPSHOT_FILE_NAME);
}

export function readZyronStorageSnapshot(snapshotPath: string): ZyronStorageSnapshot | null {
  try {
    const stats = FS.statSync(snapshotPath);
    if (!stats.isFile() || stats.size > ZYRON_STORAGE_SNAPSHOT_MAX_BYTES) {
      return null;
    }
    return validateZyronStorageSnapshot(JSON.parse(FS.readFileSync(snapshotPath, "utf8")));
  } catch {
    return null;
  }
}

export async function acknowledgeZyronStorageSnapshot(snapshotPath: string): Promise<void> {
  await FS.promises.rm(snapshotPath, { force: true }).catch(() => undefined);
}
