// FILE: desktopUpdateStore.ts
// Purpose: Centralized reactive store and actions for desktop app auto-updates.
// Layer: Web UI client store

import type { DesktopUpdateActionResult, DesktopUpdateState } from "@zyron/contracts";
import { useEffect } from "react";
import { create } from "zustand";
import {
  getDesktopUpdateActionError,
  getDesktopUpdateAlreadyCurrentNotice,
  getDesktopUpdateErrorSignature,
  isDesktopUpdateButtonDisabled,
  isDesktopUpdateInstallInFlight,
  resolveDesktopUpdateButtonAction,
  shouldRecommendManualDesktopDownload,
  shouldToastDesktopUpdateActionResult,
} from "./components/desktopUpdate.logic";
import { toastManager } from "./components/ui/toast";
import { isElectron } from "./env";
import { t } from "./i18n";
import { isMacNavigatorPlatform } from "./lib/utils";
import { persistAppStateNow } from "./store";

export interface DesktopUpdateStoreState {
  state: DesktopUpdateState | null;
  installing: boolean;
  setUpdateState: (state: DesktopUpdateState | null) => void;
  setInstalling: (installing: boolean) => void;
}

const INITIAL_DESKTOP_UPDATE_STORE_STATE: Pick<DesktopUpdateStoreState, "state" | "installing"> = {
  state: null,
  installing: false,
};

export const useDesktopUpdateStore = create<DesktopUpdateStoreState>((set) => ({
  ...INITIAL_DESKTOP_UPDATE_STORE_STATE,
  setUpdateState: (state) => set({ state }),
  setInstalling: (installing) => set({ installing }),
}));

let lastDesktopUpdateErrorToastSignature: string | null = null;

export function surfaceDesktopUpdateError(input: {
  title: string;
  description: string;
  state: DesktopUpdateState | null;
}): void {
  const signature = getDesktopUpdateErrorSignature(input.state) ?? `adhoc:${input.description}`;
  if (lastDesktopUpdateErrorToastSignature === signature) {
    return;
  }
  lastDesktopUpdateErrorToastSignature = signature;
  const releaseUrl = input.state?.releaseUrl ?? null;
  const recommendManualDownload = shouldRecommendManualDesktopDownload(input.state);
  const fallbackProps = releaseUrl
    ? {
        data: { copyText: releaseUrl },
        actionProps: {
          children: "Download manually",
          onClick: () => {
            void window.desktopBridge?.openExternal(releaseUrl);
          },
        },
      }
    : {};
  toastManager.add({
    type: "error",
    title: recommendManualDownload ? t("workspace:downloadTheUpdateManually") : input.title,
    description: recommendManualDownload
      ? t("workspace:automaticInstallationHasFailedTimesDownloadManuallyToFinish", {
          value0: input.state?.installFailureCount ?? 0,
          value1: input.state?.availableVersion ?? t("workspace:theUpdate"),
        })
      : input.description,
    ...fallbackProps,
  });
}

export function clearDesktopUpdateErrorSignature(): void {
  lastDesktopUpdateErrorToastSignature = null;
}

export function executeDesktopUpdateAction(): void {
  const bridge = window.desktopBridge;
  const current = useDesktopUpdateStore.getState();
  const desktopUpdateState = current.state;
  if (!bridge || !desktopUpdateState) return;

  const disabled = isDesktopUpdateButtonDisabled(desktopUpdateState) || current.installing;
  const action = resolveDesktopUpdateButtonAction(desktopUpdateState);
  if (disabled || action === "none") return;

  if (action === "check") {
    void bridge
      .checkForUpdates()
      .then((nextState) => {
        useDesktopUpdateStore.setState({ installing: false, state: nextState });
        if (nextState.status === "available") {
          toastManager.add({
            type: "info",
            title: t("workspace:desktopUpdate_preparingUpdate"),
            description: t("workspace:zyronIsPreparingVersionInTheBackground", {
              value0: nextState.availableVersion ?? t("chat:available2"),
            }),
          });
          return;
        }

        if (nextState.status === "downloading") {
          toastManager.add({
            type: "info",
            title: t("workspace:desktopUpdate_preparingUpdate"),
            description: t("workspace:desktopUpdate_downloadingUpdateDescription"),
          });
          return;
        }

        if (nextState.status === "downloaded") {
          toastManager.add({
            type: "success",
            title: t("workspace:desktopUpdate_updateReady"),
            description: t("workspace:clickUpdateWhenYouReReadyToRestartAnd"),
          });
          return;
        }

        if (nextState.status === "up-to-date") {
          toastManager.add({
            type: "info",
            title: t("workspace:youReUpToDate"),
            description: t("workspace:zyronIsAlreadyTheNewestVersion", {
              value0: nextState.currentVersion,
            }),
          });
          return;
        }

        if (nextState.status === "error") {
          surfaceDesktopUpdateError({
            title: t("workspace:desktopUpdate_couldNotCheckForUpdates"),
            description: nextState.message ?? t("workspace:desktopUpdate_unexpectedError"),
            state: nextState,
          });
        }
      })
      .catch((error) => {
        surfaceDesktopUpdateError({
          title: t("workspace:desktopUpdate_couldNotCheckForUpdates"),
          description:
            error instanceof Error ? error.message : t("workspace:desktopUpdate_unexpectedError"),
          state: desktopUpdateState,
        });
      });
    return;
  }

  if (action === "download") {
    void bridge
      .downloadUpdate()
      .then((result) => {
        useDesktopUpdateStore.setState({ installing: false, state: result.state });
        if (result.completed) {
          toastManager.add({
            type: "success",
            title: t("workspace:desktopUpdate_updateReady"),
            description: t("workspace:clickUpdateWhenYouReReadyToRestartAnd"),
          });
        }
        const alreadyCurrentNotice = getDesktopUpdateAlreadyCurrentNotice(result);
        if (alreadyCurrentNotice) {
          toastManager.add({
            type: "info",
            title: t("git:providerUpdates_unchanged"),
            description: alreadyCurrentNotice,
          });
          return;
        }
        if (!shouldToastDesktopUpdateActionResult(result)) return;
        const actionError = getDesktopUpdateActionError(result);
        if (!actionError) return;
        surfaceDesktopUpdateError({
          title: t("workspace:desktopUpdate_couldNotDownloadUpdate"),
          description: actionError,
          state: result.state,
        });
      })
      .catch((error) => {
        surfaceDesktopUpdateError({
          title: t("workspace:couldNotStartUpdateDownload"),
          description:
            error instanceof Error ? error.message : t("workspace:desktopUpdate_unexpectedError"),
          state: desktopUpdateState,
        });
      });
    return;
  }

  if (action === "install") {
    useDesktopUpdateStore.setState({ installing: true });
    persistAppStateNow();
    const preparationToastId = isMacNavigatorPlatform()
      ? toastManager.add({
          type: "loading",
          title: `${t("workspace:desktopUpdate_preparingUpdate")}…`,
          timeout: 0,
        })
      : null;
    void bridge
      .installUpdate()
      .then((result: DesktopUpdateActionResult) => {
        useDesktopUpdateStore.setState({
          state: result.state,
          installing: isDesktopUpdateInstallInFlight(result),
        });
        const alreadyCurrentNotice = getDesktopUpdateAlreadyCurrentNotice(result);
        if (alreadyCurrentNotice) {
          toastManager.add({
            type: "info",
            title: t("git:providerUpdates_unchanged"),
            description: alreadyCurrentNotice,
          });
          return;
        }
        if (!shouldToastDesktopUpdateActionResult(result)) return;
        const actionError = getDesktopUpdateActionError(result);
        if (!actionError) return;
        surfaceDesktopUpdateError({
          title: t("workspace:desktopUpdate_couldNotInstallUpdate"),
          description: actionError,
          state: result.state,
        });
      })
      .catch((error) => {
        useDesktopUpdateStore.setState({ installing: false });
        surfaceDesktopUpdateError({
          title: t("workspace:desktopUpdate_couldNotInstallUpdate"),
          description:
            error instanceof Error ? error.message : t("workspace:desktopUpdate_unexpectedError"),
          state: desktopUpdateState,
        });
      })
      .finally(() => {
        if (preparationToastId !== null) toastManager.close(preparationToastId);
      });
  }
}

/**
 * Global synchronization hook. Mount once at the application root (`__root.tsx`).
 */
export function useSyncDesktopUpdate(): void {
  useEffect(() => {
    if (!isElectron) return;
    const bridge = window.desktopBridge;
    if (
      !bridge ||
      typeof bridge.getUpdateState !== "function" ||
      typeof bridge.onUpdateState !== "function"
    ) {
      return;
    }

    let disposed = false;
    let receivedSubscriptionUpdate = false;
    const unsubscribe = bridge.onUpdateState((nextState) => {
      if (disposed) return;
      receivedSubscriptionUpdate = true;
      useDesktopUpdateStore.setState({ state: nextState });
    });

    void bridge
      .getUpdateState()
      .then((nextState) => {
        if (disposed || receivedSubscriptionUpdate) return;
        useDesktopUpdateStore.setState({ state: nextState });
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  const state = useDesktopUpdateStore((s) => s.state);

  useEffect(() => {
    if (!getDesktopUpdateErrorSignature(state)) {
      clearDesktopUpdateErrorSignature();
      return;
    }
    if (!state?.releaseUrl) {
      return;
    }
    surfaceDesktopUpdateError({
      title:
        state.errorContext === "install"
          ? t("workspace:couldnTFinishUpdating")
          : t("workspace:couldnTDownloadTheUpdate"),
      description: state.message ?? t("workspace:theInAppUpdateCouldNotCompleteYouCan"),
      state,
    });
  }, [state]);

  useEffect(() => {
    if (state?.status !== "downloaded" || state.errorContext === "install") {
      useDesktopUpdateStore.setState({ installing: false });
    }
  }, [state?.status, state?.errorContext]);
}
