import { existsSync } from "node:fs";
import { join } from "node:path";
import { resolveConfiguredAccountUrl } from "@zyron/shared/account";
import { desktopFlavorFromBundleId } from "@zyron/shared/betaFeatures";

export const REMOTE_IMPORT_SUSPENSION_FILE = "remote-suspended-after-import.json";

/** TLS/owner-pairing component and packaged Electron gates passed; release qualification is separate. */
const REMOTE_V2_QUALIFIED = true;

export function remoteConnectionsUnavailableReason(stateDir?: string): string | undefined {
  const flavor = desktopFlavorFromBundleId(process.env.ZYRON_DESKTOP_BUNDLE_ID);
  if (flavor === "production") {
    // Stable needs both an explicit opt-in and a configured HTTPS account origin.
    const configuredAccountUrl = resolveConfiguredAccountUrl({});
    const accountUrl = configuredAccountUrl ? URL.parse(configuredAccountUrl) : null;
    if (
      process.env.ZYRON_REMOTE_CONNECTIONS !== "1" ||
      accountUrl?.protocol !== "https:" ||
      (configuredAccountUrl !== accountUrl.origin &&
        configuredAccountUrl !== `${accountUrl.origin}/`)
    )
      return "Remote connections are unavailable in Stable.";
  }
  if (process.versions.bun || Number(process.versions.node.split(".")[0]) !== 24)
    return "Remote connections require the Node 24 server runtime.";
  if (flavor === "unknown" && process.env.ZYRON_REMOTE_CONNECTIONS !== "1")
    return "Set ZYRON_REMOTE_CONNECTIONS=1 to opt in to remote connections.";
  if (stateDir && existsSync(join(stateDir, REMOTE_IMPORT_SUSPENSION_FILE)))
    return "Reconnect this installation after the data import.";
  if (!REMOTE_V2_QUALIFIED)
    return "Remote protocol v2 and owner pairing are not qualified in this build.";
  return undefined;
}

// Keep existing non-Stable reporting behavior while applying the Stable rollout policy.
export function accountLiveActivityEnabled(stateDir?: string): boolean {
  const flavor = desktopFlavorFromBundleId(process.env.ZYRON_DESKTOP_BUNDLE_ID);
  return flavor !== "production" || remoteConnectionsUnavailableReason(stateDir) === undefined;
}

export function requireRemoteConnections(stateDir?: string): void {
  const reason = remoteConnectionsUnavailableReason(stateDir);
  if (reason) throw new Error(reason);
}

export function accountProfileSyncUnavailableReason(): string | undefined {
  const flavor = desktopFlavorFromBundleId(process.env.ZYRON_DESKTOP_BUNDLE_ID);
  // Stable and Remote offer account profiles on sign-in. Other hosts retain
  // operator opt-in, and an explicit opt-out is honored in every flavor.
  const enabled =
    process.env.ZYRON_ACCOUNT_PROFILE_SYNC === "1" ||
    ((flavor === "production" || flavor === "remote") &&
      process.env.ZYRON_ACCOUNT_PROFILE_SYNC === undefined);
  if (!enabled)
    return "Account profile sync is unavailable until ZYRON_ACCOUNT_PROFILE_SYNC=1 is set.";
  return undefined;
}

export function requireAccountProfileSync(): void {
  const reason = accountProfileSyncUnavailableReason();
  if (reason) throw new Error(reason);
}

export function requireHostSecretsSync(): void {
  throw new Error("Host secrets sync is unavailable in this build.");
}
