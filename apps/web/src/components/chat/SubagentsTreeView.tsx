// FILE: SubagentsTreeView.tsx
// Purpose: Interactive visual DAG / Tree representation for subagents and task delegation.
//          Visualizes the root orchestrator thread connected to child subagent workers with
//          live status indicators, elapsed durations, and one-click navigation.
// Layer: Chat right-dock UI
// Exports: SubagentsTreeView

import type { ThreadId } from "@zyron/contracts";

import { IconButton } from "~/components/ui/icon-button";
import { BackgroundTrayIcon, StopIcon, WorkflowIcon } from "~/lib/icons";
import { formatRelativeTimeAgo } from "~/lib/relativeTime";
import { subagentStatusTextToneClassName } from "~/lib/subagentPresentation";
import { cn } from "~/lib/utils";
import { formatClockDuration } from "../../session-logic";
import type {
  EnvironmentSubagentRoster,
  EnvironmentSubagentRosterItem,
} from "./environment/EnvironmentSubagentsSection.logic";
import {
  environmentSubagentElapsedMs,
  formatEnvironmentSubagentMeta,
} from "./environment/EnvironmentSubagentsSection.logic";
import { PanelStateMessage } from "./PanelStateMessage";
import { SubagentAvatar } from "./SubagentAvatar";
import type { SubagentParentRow } from "./useSubagentStripSource";
import { useTranslation } from "~/i18n";

export interface SubagentsTreeViewProps {
  roster: EnvironmentSubagentRoster;
  parent: SubagentParentRow | null;
  nowMs: number;
  onOpen: (threadId: ThreadId) => void;
  onBackground?: (item: EnvironmentSubagentRosterItem) => void;
  onStop?: (item: EnvironmentSubagentRosterItem) => void;
}

export function SubagentsTreeView({
  roster,
  parent,
  nowMs,
  onOpen,
  onBackground,
  onStop,
}: SubagentsTreeViewProps) {
  const { t, formatLocale } = useTranslation();
  const { active, previous } = roster;
  const allSubagents = [...active, ...previous];

  if (allSubagents.length === 0 && !parent) {
    return <PanelStateMessage>{t("chat:noSubagentsInThisChatYet")}</PanelStateMessage>;
  }

  const rootLabel = parent?.label ?? t("chat:mainThread");
  const runningCount = active.filter((item) => item.statusKind === "running").length;

  return (
    <div className="flex flex-col p-2" data-testid="subagents-tree-view">
      {/* Root Host Orchestrator Node */}
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={() => (parent ? onOpen(parent.threadId) : undefined)}
          className={cn(
            "group flex w-full max-w-[280px] items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated-primary)] p-2.5 text-start transition-colors",
            parent
              ? "hover:border-[var(--color-text-accent)] hover:bg-[var(--color-background-elevated-secondary)]"
              : "cursor-default",
          )}
          data-testid="subagents-tree-root-node"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background-button-secondary)] text-[var(--color-text-accent)]">
            <WorkflowIcon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate font-medium text-ui text-[var(--color-text-primary)]">
                {rootLabel}
              </span>
              <span className="rounded bg-[var(--color-background-button-secondary)] px-1.5 py-0.5 text-ui-xs font-medium text-[var(--color-text-accent)]">
                Host
              </span>
            </div>
            <span className="text-ui-xs text-[var(--color-text-muted)]">
              {active.length > 0
                ? `${runningCount} active, ${previous.length} done`
                : `${previous.length} subagents spawned`}
            </span>
          </div>
        </button>

        {/* Vertical Trunk Line down from Root */}
        {allSubagents.length > 0 ? (
          <div className="h-4 w-px bg-[var(--color-border)]" aria-hidden />
        ) : null}
      </div>

      {/* Subagents Branching Tree / DAG Section */}
      {allSubagents.length > 0 ? (
        <div className="relative flex flex-col gap-2 pl-4">
          {/* Vertical connecting rail along the left */}
          <div
            className="absolute top-0 bottom-6 left-4 w-px bg-[var(--color-border)]"
            aria-hidden
          />

          {allSubagents.map((item) => {
            const isRunning = item.statusKind === "running";
            const elapsedMs = environmentSubagentElapsedMs(item, nowMs);
            const meta = formatEnvironmentSubagentMeta(item, false);
            const finishedAgo = item.settledAt
              ? formatRelativeTimeAgo(item.settledAt, nowMs, formatLocale, t)
              : null;
            const showBg = isRunning && !item.isBackground && onBackground;
            const showStop = isRunning && onStop;

            return (
              <div key={item.key} className="group/tree-node relative flex items-start pl-4">
                {/* Horizontal branch elbow line */}
                <div
                  className="absolute top-4 left-0 h-px w-4 bg-[var(--color-border)]"
                  aria-hidden
                />

                {/* Subagent Node Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(item.threadId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(item.threadId);
                    }
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 cursor-pointer flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated-primary)] p-2.5 transition-all hover:border-[var(--color-border-hover)] hover:bg-[var(--color-background-elevated-secondary)]",
                    item.isViewed &&
                      "border-[var(--color-text-accent)] bg-[var(--color-background-elevated-secondary)] shadow-sm",
                  )}
                  data-testid="subagents-tree-child-node"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <SubagentAvatar
                        seed={item.key}
                        accentColor={item.accentColor}
                        className="size-5 shrink-0"
                      />
                      <span className="truncate font-medium text-ui text-[var(--color-text-primary)]">
                        {item.primaryLabel}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isRunning ? (
                        <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-ui-xs font-medium text-emerald-400">
                          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                          {elapsedMs !== null
                            ? formatClockDuration(elapsedMs)
                            : t("chat:runStatus_running")}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-ui-xs font-medium",
                            subagentStatusTextToneClassName(item.statusKind),
                          )}
                        >
                          {item.statusLabel ??
                            (item.statusKind === "completed" ? "Done" : "Finished")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Context */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ui-xs text-[var(--color-text-muted)]">
                    {item.modelLabel ? <span>{item.modelLabel}</span> : null}
                    {meta ? (
                      <>
                        <span aria-hidden>&bull;</span>
                        <span>{meta}</span>
                      </>
                    ) : null}
                    {finishedAgo ? (
                      <>
                        <span aria-hidden>&bull;</span>
                        <span>{finishedAgo}</span>
                      </>
                    ) : null}
                  </div>

                  {/* Node Hover Controls for Active Runs */}
                  {isRunning && (showBg || showStop) ? (
                    <div className="flex items-center justify-end gap-1 border-t border-[var(--color-border)] pt-1.5">
                      {showBg ? (
                        <IconButton
                          label={t("chat:runInBackground", { value0: item.primaryLabel })}
                          tooltip={t("chat:runInBackgroundCtrlB")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBackground(item);
                          }}
                        >
                          <BackgroundTrayIcon className="size-3.5" />
                        </IconButton>
                      ) : null}
                      {showStop ? (
                        <IconButton
                          label={t("chat:stopSubagent2", { value0: item.primaryLabel })}
                          tooltip={t("chat:stopSubagent")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStop(item);
                          }}
                        >
                          <StopIcon className="size-3.5" />
                        </IconButton>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
