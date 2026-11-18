// FILE: betaFeatureGate.test.ts
// Purpose: Verify the server host's shared Beta-only feature policy.
import { afterEach, expect, it, vi } from "vitest";
import {
  ZYRON_BETA_BUNDLE_ID,
  ZYRON_DESKTOP_BUNDLE_ID_ENV,
  ZYRON_PRODUCTION_BUNDLE_ID,
} from "@zyron/shared/desktopIdentity";
import { ACCOUNT_INBOX_BETA_FEATURE } from "@zyron/shared/betaFeatures";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it.each([
  [ZYRON_PRODUCTION_BUNDLE_ID, true],
  [ZYRON_BETA_BUNDLE_ID, true],
] as const)("allows saved Inbox recaps on the host bundle (%s)", async (bundleId, enabled) => {
  vi.stubEnv(ZYRON_DESKTOP_BUNDLE_ID_ENV, bundleId);
  vi.resetModules();
  const { isServerBetaFeatureEnabled } = await import("./betaFeatureGate");
  expect(isServerBetaFeatureEnabled(ACCOUNT_INBOX_BETA_FEATURE)).toBe(enabled);
});
