// Routes source Electron launches to their flavor-owned data home without exposing secrets in argv.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

import {
  resolveZyronDesktopFlavor,
  ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
  zyronDesktopIdentity,
} from "@zyron/shared/desktopIdentity";
import { readWindowsPersistentEnvironment } from "@zyron/shared/shell";

function environmentValue(environment, name, caseInsensitive) {
  const exactValue = environment[name];
  if (exactValue !== undefined || !caseInsensitive) return exactValue;

  const matchingName = Object.keys(environment).find(
    (candidate) => candidate.toUpperCase() === name,
  );
  return matchingName ? environment[matchingName] : undefined;
}

function configuredSourceDesktopHome(environment, platform, readWindowsEnvironment) {
  const isWindows = platform === "win32";
  const inheritedHome = environmentValue(environment, "ZYRON_HOME", isWindows)?.trim();
  if (inheritedHome) return inheritedHome;
  if (!isWindows) return undefined;

  try {
    return environmentValue(readWindowsEnvironment(), "ZYRON_HOME", true)?.trim();
  } catch {
    return undefined;
  }
}

export function createSourceDesktopEnvironment({
  environment = process.env,
  homeDirectory = homedir(),
  platform = process.platform,
  readWindowsEnvironment = readWindowsPersistentEnvironment,
} = {}) {
  const flavor = resolveZyronDesktopFlavor({
    isDevelopment: true,
    requestedFlavor: environment.ZYRON_DESKTOP_FLAVOR,
  });
  const identity = zyronDesktopIdentity(flavor);
  // Remote must never inherit Stable's data home, even in a developer shell.
  const configuredHome =
    flavor === "remote"
      ? environment.ZYRON_REMOTE_HOME?.trim()
      : configuredSourceDesktopHome(environment, platform, readWindowsEnvironment);
  const childEnvironment = {
    ...environment,
    ZYRON_DESKTOP_FLAVOR: flavor,
    ZYRON_HOME: configuredHome || join(homeDirectory, identity.defaultHomeDirectoryName),
    ZYRON_SOURCE_DESKTOP_BUILD_MARKER,
  };
  if (flavor === "remote") childEnvironment.ZYRON_REMOTE_HOME = childEnvironment.ZYRON_HOME;
  delete childEnvironment.ELECTRON_RUN_AS_NODE;
  return childEnvironment;
}

function assertCurrentSourceDesktopBuild(desktopDirectory, readBuiltMain) {
  const builtMainPath = join(desktopDirectory, "dist-electron/main.js");
  const builtMain = readBuiltMain(builtMainPath, "utf8");
  if (!builtMain.includes(ZYRON_SOURCE_DESKTOP_BUILD_MARKER)) {
    throw new Error(
      "Source desktop build is stale. Run `bun run build:desktop`, then launch it again.",
    );
  }
}

export function spawnSourceDesktop({
  desktopDirectory,
  electronPath,
  environment = process.env,
  homeDirectory = homedir(),
  platform = process.platform,
  readBuiltMain = readFileSync,
  readWindowsEnvironment = readWindowsPersistentEnvironment,
  spawnProcess,
  stdio = "inherit",
  launchViaMacOS = false,
}) {
  assertCurrentSourceDesktopBuild(desktopDirectory, readBuiltMain);
  let executable = electronPath;
  let args = ["dist-electron/main.js"];
  if (launchViaMacOS) {
    const macOSDirectory = dirname(electronPath);
    const contentsDirectory = dirname(macOSDirectory);
    const bundle = dirname(contentsDirectory);
    if (
      platform !== "darwin" ||
      basename(macOSDirectory) !== "MacOS" ||
      basename(contentsDirectory) !== "Contents" ||
      !bundle.endsWith(".app")
    ) {
      throw new Error("LaunchServices requires a macOS application bundle.");
    }
    // LaunchServices makes the app responsible for TCC access instead of the caller.
    // Keep secrets in the inherited environment, never in open's --env arguments.
    executable = "/usr/bin/open";
    args = ["-W", "-n", "-a", bundle, "--args", resolve(desktopDirectory, "dist-electron/main.js")];
  }
  return spawnProcess(executable, args, {
    cwd: desktopDirectory,
    env: createSourceDesktopEnvironment({
      environment,
      homeDirectory,
      platform,
      readWindowsEnvironment,
    }),
    stdio,
  });
}
