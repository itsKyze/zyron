import { ThreadId } from "@zyron/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  runningSubagentRosterItem,
  subagentRosterItem,
} from "./environment/subagentRosterFixtures";
import { SubagentsTreeView } from "./SubagentsTreeView";

const noop = () => undefined;

describe("SubagentsTreeView", () => {
  it("renders visual DAG tree with root host node and child subagents", () => {
    const markup = renderToStaticMarkup(
      <SubagentsTreeView
        roster={{
          active: [
            runningSubagentRosterItem("ScoutWorker", {
              lastToolName: "Grep",
              totalTokens: 15_000,
            }),
          ],
          previous: [
            subagentRosterItem("VerifierWorker", {
              statusLabel: "Done",
              statusKind: "completed",
            }),
          ],
        }}
        parent={{ threadId: ThreadId.makeUnsafe("parent-thread"), label: "Main Orchestrator" }}
        nowMs={Date.parse("2026-10-10T10:02:00.000Z")}
        onOpen={noop}
        onBackground={noop}
        onStop={noop}
      />,
    );

    expect(markup).toContain('data-testid="subagents-tree-view"');
    expect(markup).toContain("Main Orchestrator");
    expect(markup).toContain("Host");
    expect(markup).toContain("1 active, 1 done");
    expect(markup).toContain("ScoutWorker");
    expect(markup).toContain("VerifierWorker");
    expect(markup).toContain("Stop subagent ScoutWorker");
  });

  it("renders empty state gracefully when no subagents exist", () => {
    const markup = renderToStaticMarkup(
      <SubagentsTreeView
        roster={{ active: [], previous: [] }}
        parent={null}
        nowMs={0}
        onOpen={noop}
      />,
    );

    expect(markup).toContain("No subagents in this chat yet.");
  });
});
