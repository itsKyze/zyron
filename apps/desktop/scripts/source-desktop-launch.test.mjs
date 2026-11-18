import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  ZYRON_DESKTOP_SMOKE_USER_DATA_ENV,
  ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
} from "@zyron/shared/desktopIdentity";
import { spawnSourceDesktop } from "./source-desktop-launch.mjs";

function captureSourceDesktopSpawn(environment, overrides = {}) {
  const child = { on: vi.fn() };
  const spawnProcess = vi.fn(() => child);

  const result = spawnSourceDesktop({
    desktopDirectory: "/workspace/apps/desktop",
    electronPath: "/runtime/electron",
    environment,
    homeDirectory: "/Users/tester",
    platform: "darwin",
    readBuiltMain: () => ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
    spawnProcess,
    ...overrides,
  });

  return { child, result, spawnProcess };
}

describe("source desktop launch", () => {
  it("launches normal macOS starts through LaunchServices without secrets in argv", () => {
    const { spawnProcess } = captureSourceDesktopSpawn(
      {
        ZYRON_HOME: "/tmp/isolated",
        ZYRON_AUTH_TOKEN: "synthetic-secret",
        ELECTRON_RUN_AS_NODE: "1",
      },
      { electronPath: "/runtime/Zyron (Dev).app/Contents/MacOS/Electron", launchViaMacOS: true },
    );
    expect(spawnProcess).toHaveBeenCalledWith(
      "/usr/bin/open",
      [
        "-W",
        "-n",
        "-a",
        "/runtime/Zyron (Dev).app",
        "--args",
        "/workspace/apps/desktop/dist-electron/main.js",
      ],
      expect.objectContaining({
        env: expect.objectContaining({
          ZYRON_HOME: "/tmp/isolated",
          ZYRON_AUTH_TOKEN: "synthetic-secret",
        }),
      }),
    );
    expect(spawnProcess.mock.calls[0][2].env).not.toHaveProperty("ELECTRON_RUN_AS_NODE");
    expect(JSON.stringify(spawnProcess.mock.calls[0][1])).not.toContain("synthetic-secret");
  });

  it.each([
    { platform: "linux", electronPath: "/runtime/Zyron.app/Contents/MacOS/Electron" },
    { platform: "darwin", electronPath: "/runtime/electron" },
  ])("rejects an invalid LaunchServices target before spawning", (overrides) => {
    expect(() => captureSourceDesktopSpawn({}, { ...overrides, launchViaMacOS: true })).toThrow(
      "macOS application bundle",
    );
  });

  it("spawns current source builds with an isolated development environment", () => {
    const environment = {
      ELECTRON_RUN_AS_NODE: "1",
      PATH: "/usr/bin",
    };

    const { child, result, spawnProcess } = captureSourceDesktopSpawn(environment);

    expect(result).toBe(child);
    expect(spawnProcess).toHaveBeenCalledWith("/runtime/electron", ["dist-electron/main.js"], {
      cwd: "/workspace/apps/desktop",
      env: {
        PATH: "/usr/bin",
        ZYRON_DESKTOP_FLAVOR: "development",
        ZYRON_HOME: join("/Users/tester", ".zyron-dev"),
        ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
      },
      stdio: "inherit",
    });
    expect(environment).toEqual({
      ELECTRON_RUN_AS_NODE: "1",
      PATH: "/usr/bin",
    });
  });

  it("preserves an explicit Zyron home", () => {
    const readWindowsEnvironment = vi.fn(() => ({
      ZYRON_HOME: "C:\\Users\\tester\\persisted-zyron-home",
    }));
    const { spawnProcess } = captureSourceDesktopSpawn(
      { ZYRON_HOME: "/tmp/custom-zyron-home" },
      { platform: "win32", readWindowsEnvironment },
    );

    expect(spawnProcess.mock.calls[0][2].env).toMatchObject({
      ZYRON_DESKTOP_FLAVOR: "development",
      ZYRON_HOME: "/tmp/custom-zyron-home",
    });
    expect(readWindowsEnvironment).not.toHaveBeenCalled();
  });

  it("preserves a persisted Windows Zyron home", () => {
    const { spawnProcess } = captureSourceDesktopSpawn(
      {},
      {
        platform: "win32",
        readWindowsEnvironment: () => ({
          Zyron_Home: "C:\\Users\\tester\\persisted-zyron-home",
        }),
      },
    );

    expect(spawnProcess.mock.calls[0][2].env.ZYRON_HOME).toBe(
      "C:\\Users\\tester\\persisted-zyron-home",
    );
  });

  it("preserves Canary flavor and storage defaults", () => {
    const { spawnProcess } = captureSourceDesktopSpawn({
      ZYRON_DESKTOP_FLAVOR: "canary",
    });

    expect(spawnProcess.mock.calls[0][2].env).toMatchObject({
      ZYRON_DESKTOP_FLAVOR: "canary",
      ZYRON_HOME: join("/Users/tester", ".zyron-canary"),
    });
  });

  it.each([undefined, "/tmp/custom-remote"])(
    "isolates Remote from inherited Stable and Beta homes (%s)",
    (remoteHome) => {
      const { spawnProcess } = captureSourceDesktopSpawn({
        ZYRON_DESKTOP_FLAVOR: "remote",
        ZYRON_HOME: "/tmp/stable-data",
        ZYRON_BETA_HOME: "/tmp/beta-data",
        ...(remoteHome ? { ZYRON_REMOTE_HOME: remoteHome } : {}),
      });
      const expectedHome = remoteHome ?? join("/Users/tester", ".zyron-remote");
      expect(spawnProcess.mock.calls[0][2].env).toMatchObject({
        ZYRON_DESKTOP_FLAVOR: "remote",
        ZYRON_HOME: expectedHome,
        ZYRON_REMOTE_HOME: expectedHome,
      });
    },
  );

  it("guards and spawns the smoke desktop with its isolated environment", () => {
    const smokeHome = "/tmp/zyron-desktop-smoke";
    const smokeUserData = join(smokeHome, "electron-user-data");
    const stdio = ["pipe", "pipe", "pipe"];
    const { spawnProcess } = captureSourceDesktopSpawn(
      {
        ZYRON_HOME: smokeHome,
        [ZYRON_DESKTOP_SMOKE_USER_DATA_ENV]: smokeUserData,
      },
      { stdio },
    );

    expect(spawnProcess.mock.calls[0][2].env).toMatchObject({
      ZYRON_HOME: smokeHome,
      [ZYRON_DESKTOP_SMOKE_USER_DATA_ENV]: smokeUserData,
    });
    expect(spawnProcess.mock.calls[0][2].stdio).toBe(stdio);
  });

  it("rejects stale built desktop output before spawning Electron", () => {
    const spawnProcess = vi.fn();

    expect(() =>
      spawnSourceDesktop({
        desktopDirectory: "/workspace/apps/desktop",
        electronPath: "/runtime/electron",
        environment: {},
        homeDirectory: "/Users/tester",
        platform: "darwin",
        readBuiltMain: () => "stale desktop output",
        spawnProcess,
      }),
    ).toThrow(/desktop build is stale/i);
    expect(spawnProcess).not.toHaveBeenCalled();
  });
});
