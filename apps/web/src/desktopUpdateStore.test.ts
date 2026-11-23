import { describe, expect, it, beforeEach } from "vitest";
import type { DesktopUpdateState } from "@zyron/contracts";
import { useDesktopUpdateStore } from "./desktopUpdateStore";

const testState: DesktopUpdateState = {
  enabled: true,
  status: "available",
  currentVersion: "1.6.2",
  availableVersion: "1.6.3",
  downloadedVersion: null,
  downloadPercent: null,
  checkedAt: null,
  message: null,
  errorContext: null,
  canRetry: false,
  installFailureCount: 0,
  flavor: "production",
  releaseUrl: "https://github.com/itsKyze/zyron/releases/tag/v1.6.3",
  hostArch: "arm64",
  appArch: "arm64",
  runningUnderArm64Translation: false,
};

describe("desktopUpdateStore", () => {
  beforeEach(() => {
    useDesktopUpdateStore.setState(useDesktopUpdateStore.getInitialState(), true);
  });

  it("stores and updates desktop update state", () => {
    expect(useDesktopUpdateStore.getState().state).toBeNull();
    expect(useDesktopUpdateStore.getState().installing).toBe(false);

    useDesktopUpdateStore.getState().setUpdateState(testState);
    expect(useDesktopUpdateStore.getState().state?.availableVersion).toBe("1.6.3");

    useDesktopUpdateStore.getState().setInstalling(true);
    expect(useDesktopUpdateStore.getState().installing).toBe(true);
  });
});
