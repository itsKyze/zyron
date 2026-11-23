import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const { chromium } = require(
  path.join(ROOT, "apps", "marketing", "node_modules", "@playwright/test"),
);

const TMP_DIR = "/tmp/zyron-captures";
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

let itsKyzeAvatarDataUrl = "https://github.com/itsKyze.png";
try {
  if (fs.existsSync("/tmp/itsKyze-avatar.png")) {
    const avatarBuf = fs.readFileSync("/tmp/itsKyze-avatar.png");
    itsKyzeAvatarDataUrl = `data:image/png;base64,${avatarBuf.toString("base64")}`;
  }
} catch (e) {
  console.warn("Could not read /tmp/itsKyze-avatar.png:", e.message);
}

const COMMON_STORAGE = {
  "zyron:project-import-announcement:v1": JSON.stringify([
    "/tmp/zyron-screenshot-home/worktrees",
    "all",
    "/home/kyzedev/.zyron/worktrees",
    "installations",
  ]),
  "zyron:app-tour:v1": JSON.stringify([
    "/tmp/zyron-screenshot-home/worktrees",
    "all",
    "/home/kyzedev/.zyron/worktrees",
    "installations",
  ]),
  "zyron:activity-onboarding:v1": "seen",
  "zyron:tasks-onboarding:v1": "seen",
  "zyron:coachmark:tasks": "seen",
  "zyron:coachmark:editor": "seen",
  "zyron:coachmark:skills": "seen",
  "zyron:sponsor-landing-banner:dismissed:v1": "true",
};

async function createCaptureContext(
  browser,
  mode,
  viewport = { width: 1512, height: 949 },
  deviceScaleFactor = 2,
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
  });

  await context.addInitScript(
    ({ storage, themeMode }) => {
      for (const [k, v] of Object.entries(storage)) {
        localStorage.setItem(k, v);
      }
      localStorage.setItem("zyron:theme", JSON.stringify({ mode: themeMode }));
    },
    { storage: COMMON_STORAGE, themeMode: mode },
  );

  return context;
}

async function addTrafficLights(page) {
  await page.evaluate(() => {
    if (document.getElementById("mock-traffic-lights")) return;
    const tl = document.createElement("div");
    tl.id = "mock-traffic-lights";
    tl.style.cssText = `
      position: fixed;
      top: 14px;
      left: 18px;
      display: flex;
      gap: 8px;
      z-index: 999999;
      pointer-events: none;
    `;
    tl.innerHTML = `
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #FF5F56; border: 0.5px solid rgba(0,0,0,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #FFBD2E; border: 0.5px solid rgba(0,0,0,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #27C93F; border: 0.5px solid rgba(0,0,0,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
    `;
    document.body.appendChild(tl);
  });
}

async function applyCleanVisualOverrides(page) {
  await page.addStyleTag({
    content: `
      [role="alert"],
      .pt-3:has([role="alert"]),
      [data-slot*="coachmark"],
      [class*="coachmark"],
      [data-onboarding],
      [data-testid="sponsor-landing-banner"],
      .group\\/landing-banner,
      [role="dialog"] {
        display: none !important;
      }
    `,
  });
}

async function dismissAnyOverlay(page) {
  try {
    const notNow = page.getByRole("button", { name: /Not now/i });
    if (await notNow.isVisible({ timeout: 400 })) {
      await notNow.click();
      await page.waitForTimeout(200);
    }
  } catch {}

  try {
    const skipBtn = page.getByRole("button", { name: /Skip intro/i });
    if (await skipBtn.isVisible({ timeout: 400 })) {
      await skipBtn.click();
      await page.waitForTimeout(200);
    }
  } catch {}
}

async function seedAppState(page, avatarUrl = itsKyzeAvatarDataUrl) {
  await page.evaluate(
    async ({ avatarUrl }) => {
      const { useStore } = await import("/src/store.ts");
      const { ensureNativeApi } = await import("/src/nativeApi.ts");
      const now = new Date().toISOString();

      const api = ensureNativeApi();
      const detailData = {
        projectId: "proj-zyron",
        projectTitle: "zyron-core",
        workspaceRoot: "/home/kyzedev/zyron",
        repository: "itsKyze/zyron",
        number: 1260,
        title: "fix(stream): optimize multi-provider zero-copy serialization and multiplexing",
        body: "### What Changed\n- Replaced slice-and-copy buffers with shared ArrayBuffer pools in `packages/contracts/src/stream.ts`.\n- Streamlined WebSocket frame serialization in `apps/server/src/runtime/streamingPipeline.ts`.\n- Eliminated post-connect hydration lag in `apps/web/src/core/multiProviderEvents.ts`.\n\n### Verification\n- `bun test` passed (184 unit and integration tests, 0 failures).\n- P99 stream latency reduced from 14.2ms to 1.8ms under 100 concurrent agent turns.",
        url: "https://github.com/itsKyze/zyron/pull/1260",
        author: {
          login: "itsKyze",
          name: "itsKyze",
          avatarUrl: avatarUrl,
          url: "https://github.com/itsKyze",
        },
        state: "merged",
        isDraft: false,
        mergeable: "mergeable",
        mergeability: "mergeable",
        mergeStateStatus: "clean",
        reviewDecision: "approved",
        additions: 204,
        deletions: 18,
        changedFiles: 8,
        headBranch: "itsKyze/streaming-zero-copy",
        baseBranch: "main",
        createdAt: now,
        updatedAt: now,
        mergedAt: now,
        closedAt: null,
        maintainerCanModify: true,
        reviewers: [],
        labels: [{ id: "l1", name: "streaming", color: "2563eb", description: "" }],
        checks: [
          {
            name: "test suite",
            status: "completed",
            conclusion: "success",
            url: "https://github.com/itsKyze/zyron/actions",
          },
        ],
        comments: [],
        commentsTruncated: false,
        commentsIncomplete: false,
        commits: [],
        mergeCapabilities: { canMerge: false, method: "squash", availableMethods: ["squash"] },
        stack: null,
        stackMetadataIncomplete: false,
      };
      api.pullRequests.detail = async () => detailData;
      window.nativeApi = api;

      const readModel = {
        snapshotSequence: 999999,
        updatedAt: now,
        spaces: [],
        projects: [
          {
            id: "proj-zyron",
            kind: "project",
            title: "zyron-core",
            workspaceRoot: "/home/kyzedev/zyron",
            defaultModelSelection: { provider: "claudeAgent", model: "claude-3-7-sonnet" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
          {
            id: "proj-api",
            kind: "project",
            title: "api-gateway",
            workspaceRoot: "/home/kyzedev/api-gateway",
            defaultModelSelection: { provider: "codex", model: "gpt-5-codex" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
          {
            id: "proj-openbot",
            kind: "project",
            title: "openbot-workspace",
            workspaceRoot: "/home/kyzedev/openbot",
            defaultModelSelection: { provider: "antigravity", model: "gemini-2.5-flash" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
        ],
        threads: [
          {
            id: "thread-main",
            projectId: "proj-zyron",
            title: "Optimize Multi-Provider Streaming",
            modelSelection: { provider: "claudeAgent", model: "claude-3-7-sonnet" },
            runtimeMode: "full-access",
            interactionMode: "default",
            envMode: "local",
            branch: "main",
            worktreePath: null,
            forkSourceThreadId: null,
            sidechatSourceThreadId: null,
            latestTurn: {
              turnId: "turn-1",
              state: "completed",
              requestedAt: now,
              startedAt: now,
              completedAt: now,
              assistantMessageId: "msg-assistant-1",
            },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            handoff: null,
            messages: [],
            activities: [],
            proposedPlans: [],
            checkpoints: [],
            session: null,
          },
          {
            id: "thread-split-1",
            projectId: "proj-zyron",
            title: "PR Review Agreement",
            modelSelection: { provider: "claudeAgent", model: "claude-3-7-sonnet" },
            runtimeMode: "full-access",
            interactionMode: "default",
            envMode: "local",
            branch: "main",
            worktreePath: null,
            forkSourceThreadId: null,
            sidechatSourceThreadId: null,
            latestTurn: {
              turnId: "turn-s1",
              state: "completed",
              requestedAt: now,
              startedAt: now,
              completedAt: now,
              assistantMessageId: "msg-s1-a",
            },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            handoff: null,
            messages: [],
            activities: [],
            proposedPlans: [],
            checkpoints: [],
            session: null,
          },
          {
            id: "thread-split-2",
            projectId: "proj-api",
            title: "Optimize App Startup",
            modelSelection: { provider: "codex", model: "gpt-5-codex" },
            runtimeMode: "full-access",
            interactionMode: "default",
            envMode: "local",
            branch: "main",
            worktreePath: null,
            forkSourceThreadId: null,
            sidechatSourceThreadId: null,
            latestTurn: {
              turnId: "turn-s2",
              state: "completed",
              requestedAt: now,
              startedAt: now,
              completedAt: now,
              assistantMessageId: "msg-s2-a",
            },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            handoff: null,
            messages: [],
            activities: [],
            proposedPlans: [],
            checkpoints: [],
            session: null,
          },
          {
            id: "thread-browser",
            projectId: "proj-openbot",
            title: "E2E Browser Automation & Verification",
            modelSelection: { provider: "antigravity", model: "gemini-2.5-flash" },
            runtimeMode: "full-access",
            interactionMode: "default",
            envMode: "local",
            branch: "main",
            worktreePath: null,
            forkSourceThreadId: null,
            sidechatSourceThreadId: null,
            latestTurn: {
              turnId: "turn-b1",
              state: "completed",
              requestedAt: now,
              startedAt: now,
              completedAt: now,
              assistantMessageId: "msg-b2",
            },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            handoff: null,
            messages: [],
            activities: [],
            proposedPlans: [],
            checkpoints: [],
            session: null,
          },
        ],
      };

      useStore.getState().syncServerReadModel(readModel);

      // Thread 1: Main Coding Session (thread-main)
      useStore.getState().syncServerThreadDetail({
        id: "thread-main",
        projectId: "proj-zyron",
        title: "Optimize Multi-Provider Streaming",
        modelSelection: { provider: "claudeAgent", model: "claude-3-7-sonnet" },
        runtimeMode: "full-access",
        interactionMode: "default",
        envMode: "local",
        branch: "main",
        worktreePath: null,
        forkSourceThreadId: null,
        sidechatSourceThreadId: null,
        latestTurn: {
          turnId: "turn-1",
          state: "completed",
          requestedAt: now,
          startedAt: now,
          completedAt: now,
          assistantMessageId: "msg-assistant-1",
        },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        handoff: null,
        messages: [
          {
            id: "msg-user-1",
            role: "user",
            text: "Optimize the multi-provider streaming pipeline for zero-copy frame serialization and verify test suite.",
            streaming: false,
            source: "native",
            turnId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "msg-assistant-1",
            role: "assistant",
            text: "Implemented the multi-provider streaming pipeline optimizations and verified test coverage.\n\n### What changed:\n- **Zero-Copy Buffering**: Replaced slice-and-copy buffers with shared ArrayBuffer pools in `packages/contracts/src/stream.ts`.\n- **Latency Optimization**: Streamlined WebSocket frame framing in `apps/server/src/runtime.ts`.\n- **Event Multiplexing**: Eliminated post-connect hydration lag in `apps/web/src/core/pipeline.ts`.\n\n### Verification:\n- `bun test` passed (184 tests, 0 failures).\n- P99 stream latency reduced from 14.2ms to 1.8ms under 100 concurrent agent turns.",
            streaming: false,
            source: "native",
            turnId: "turn-1",
            createdAt: now,
            updatedAt: now,
          },
        ],
        turnDiffSummaries: [
          {
            turnId: "turn-1",
            status: "ready",
            completedAt: now,
            files: [
              {
                path: "apps/web/src/core/pipeline.ts",
                kind: "modified",
                additions: 60,
                deletions: 34,
              },
              { path: "apps/server/src/runtime.ts", kind: "modified", additions: 63, deletions: 0 },
              {
                path: "packages/contracts/src/stream.ts",
                kind: "modified",
                additions: 6,
                deletions: 1,
              },
            ],
            checkpointRef: "checkpoint-turn-1",
            checkpointTurnCount: 1,
            assistantMessageId: "msg-assistant-1",
          },
        ],
        activities: [
          {
            id: "act-1",
            tone: "info",
            kind: "tool.completed",
            summary: "Running Bash: bun test",
            payload: { toolName: "Bash", command: "bun test" },
            turnId: "turn-1",
            createdAt: now,
          },
          {
            id: "act-2",
            tone: "info",
            kind: "tool.completed",
            summary: "Read packages/contracts/src/stream.ts",
            payload: { toolName: "read_file", path: "packages/contracts/src/stream.ts" },
            turnId: "turn-1",
            createdAt: now,
          },
        ],
        proposedPlans: [],
        checkpoints: [],
        session: null,
      });

      // Thread 2: Split Left (thread-split-1)
      useStore.getState().syncServerThreadDetail({
        id: "thread-split-1",
        projectId: "proj-zyron",
        title: "PR Review Agreement",
        modelSelection: { provider: "claudeAgent", model: "claude-3-7-sonnet" },
        runtimeMode: "full-access",
        interactionMode: "default",
        envMode: "local",
        branch: "main",
        worktreePath: null,
        forkSourceThreadId: null,
        sidechatSourceThreadId: null,
        latestTurn: {
          turnId: "turn-s1",
          state: "completed",
          requestedAt: now,
          startedAt: now,
          completedAt: now,
          assistantMessageId: "msg-s1-a",
        },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        handoff: null,
        messages: [
          {
            id: "msg-s1-u",
            role: "user",
            text: "Review PR #199 for provider contracts compliance and check schema deciders.",
            streaming: false,
            source: "native",
            turnId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "msg-s1-a",
            role: "assistant",
            text: "Confirmed: the `thread.create` decider schema enforces strict validation on incoming commands.\n\nAll provider test harnesses passed without regression. Verified zero discrepancies with Codex CLI.",
            streaming: false,
            source: "native",
            turnId: "turn-s1",
            createdAt: now,
            updatedAt: now,
          },
        ],
        turnDiffSummaries: [
          {
            turnId: "turn-s1",
            status: "ready",
            completedAt: now,
            files: [
              {
                path: "packages/contracts/src/ipc.ts",
                kind: "modified",
                additions: 18,
                deletions: 4,
              },
              {
                path: "apps/server/src/runtime.ts",
                kind: "modified",
                additions: 35,
                deletions: 12,
              },
            ],
            checkpointRef: "checkpoint-s1",
            checkpointTurnCount: 1,
            assistantMessageId: "msg-s1-a",
          },
        ],
        activities: [
          {
            id: "act-s1-1",
            tone: "info",
            kind: "tool.completed",
            summary: "Read threadCreatePromotion.ts",
            payload: { toolName: "read_file", path: "threadCreatePromotion.ts" },
            turnId: "turn-s1",
            createdAt: now,
          },
        ],
        proposedPlans: [],
        checkpoints: [],
        session: null,
      });

      // Thread 3: Split Right (thread-split-2)
      useStore.getState().syncServerThreadDetail({
        id: "thread-split-2",
        projectId: "proj-api",
        title: "Optimize App Startup",
        modelSelection: { provider: "codex", model: "gpt-5-codex" },
        runtimeMode: "full-access",
        interactionMode: "default",
        envMode: "local",
        branch: "main",
        worktreePath: null,
        forkSourceThreadId: null,
        sidechatSourceThreadId: null,
        latestTurn: {
          turnId: "turn-s2",
          state: "completed",
          requestedAt: now,
          startedAt: now,
          completedAt: now,
          assistantMessageId: "msg-s2-a",
        },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        handoff: null,
        messages: [
          {
            id: "msg-s2-u",
            role: "user",
            text: "Optimize app startup performance and hydrate sidebar threads in parallel.",
            streaming: false,
            source: "native",
            turnId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "msg-s2-a",
            role: "assistant",
            text: "Implemented the fixes and the cleanup refactors.\n\n**What changed:**\n- Removed duplicate post-connect thread hydration in `CodexService+Connection.swift`.\n- Overlapped sidebar presentation startup with background project loading.\n\n**Verification:**\n- `git diff --check` passed.\n- `node --test ./test/codex-transport.test.js` passed.",
            streaming: false,
            source: "native",
            turnId: "turn-s2",
            createdAt: now,
            updatedAt: now,
          },
        ],
        turnDiffSummaries: [
          {
            turnId: "turn-s2",
            status: "ready",
            completedAt: now,
            files: [
              {
                path: "CodexMobile/Views/SidebarView.swift",
                kind: "modified",
                additions: 60,
                deletions: 34,
              },
              {
                path: "CodexMobile/CodexMobileTests/CodexServiceThreadListTests.swift",
                kind: "modified",
                additions: 6,
                deletions: 1,
              },
              {
                path: "CodexMobile/CodexMobileTests/SidebarThreadGroupingTests.swift",
                kind: "modified",
                additions: 63,
                deletions: 0,
              },
            ],
            checkpointRef: "checkpoint-s2",
            checkpointTurnCount: 1,
            assistantMessageId: "msg-s2-a",
          },
        ],
        activities: [
          {
            id: "act-s2-1",
            tone: "info",
            kind: "tool.completed",
            summary: "Running Bash: node --test ./test/codex-transport.test.js",
            payload: { toolName: "Bash", command: "node --test" },
            turnId: "turn-s2",
            createdAt: now,
          },
        ],
        proposedPlans: [],
        checkpoints: [],
        session: null,
      });

      // Thread 4: Browser Thread
      useStore.getState().syncServerThreadDetail({
        id: "thread-browser",
        projectId: "proj-openbot",
        title: "E2E Browser Automation & Verification",
        modelSelection: { provider: "antigravity", model: "gemini-2.5-flash" },
        runtimeMode: "full-access",
        interactionMode: "default",
        envMode: "local",
        branch: "main",
        worktreePath: null,
        forkSourceThreadId: null,
        sidechatSourceThreadId: null,
        latestTurn: {
          turnId: "turn-b1",
          state: "completed",
          requestedAt: now,
          startedAt: now,
          completedAt: now,
          assistantMessageId: "msg-b2",
        },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        handoff: null,
        messages: [
          {
            id: "msg-b1",
            role: "user",
            text: "Inspect the deployed web application at localhost:5733 and verify responsive navigation.",
            streaming: false,
            source: "native",
            turnId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "msg-b2",
            role: "assistant",
            text: "Connected embedded browser sandbox. All accessibility attributes, ARIA landmarks, and keyboard shortcuts pass compliance tests.",
            streaming: false,
            source: "native",
            turnId: "turn-b1",
            createdAt: now,
            updatedAt: now,
          },
        ],
        activities: [],
        proposedPlans: [],
        checkpoints: [],
        session: null,
      });

      // Populate turnDiffIds and summaries in store state for diff cards
      useStore.setState((state) => ({
        ...state,
        turnDiffIdsByThreadId: {
          ...(state.turnDiffIdsByThreadId || {}),
          "thread-main": ["turn-1"],
          "thread-split-1": ["turn-s1"],
          "thread-split-2": ["turn-s2"],
        },
        turnDiffSummaryByThreadId: {
          ...(state.turnDiffSummaryByThreadId || {}),
          "thread-main": {
            "turn-1": {
              turnId: "turn-1",
              status: "ready",
              completedAt: now,
              files: [
                {
                  path: "apps/web/src/core/pipeline.ts",
                  kind: "modified",
                  additions: 60,
                  deletions: 34,
                },
                {
                  path: "apps/server/src/runtime.ts",
                  kind: "modified",
                  additions: 63,
                  deletions: 0,
                },
                {
                  path: "packages/contracts/src/stream.ts",
                  kind: "modified",
                  additions: 6,
                  deletions: 1,
                },
              ],
              checkpointRef: "checkpoint-turn-1",
              checkpointTurnCount: 1,
              assistantMessageId: "msg-assistant-1",
            },
          },
          "thread-split-1": {
            "turn-s1": {
              turnId: "turn-s1",
              status: "ready",
              completedAt: now,
              files: [
                {
                  path: "packages/contracts/src/ipc.ts",
                  kind: "modified",
                  additions: 18,
                  deletions: 4,
                },
                {
                  path: "apps/server/src/runtime.ts",
                  kind: "modified",
                  additions: 35,
                  deletions: 12,
                },
              ],
              checkpointRef: "checkpoint-s1",
              checkpointTurnCount: 1,
              assistantMessageId: "msg-s1-a",
            },
          },
          "thread-split-2": {
            "turn-s2": {
              turnId: "turn-s2",
              status: "ready",
              completedAt: now,
              files: [
                {
                  path: "CodexMobile/Views/SidebarView.swift",
                  kind: "modified",
                  additions: 60,
                  deletions: 34,
                },
                {
                  path: "CodexMobile/CodexMobileTests/CodexServiceThreadListTests.swift",
                  kind: "modified",
                  additions: 6,
                  deletions: 1,
                },
                {
                  path: "CodexMobile/CodexMobileTests/SidebarThreadGroupingTests.swift",
                  kind: "modified",
                  additions: 63,
                  deletions: 0,
                },
              ],
              checkpointRef: "checkpoint-s2",
              checkpointTurnCount: 1,
              assistantMessageId: "msg-s2-a",
            },
          },
        },
      }));

      useStore.getState().setAllProjectsExpanded(true);
    },
    { avatarUrl },
  );
}

async function captureAll() {
  const browser = await chromium.launch({ headless: true });

  console.log("[1/9] Capturing Dark Mode Main Stage (3024x1898)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1512, height: 949 }, 2);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { appHistory } = await import("/src/appNavigation.ts");
      appHistory.push("/thread-main");
    });
    await page.waitForTimeout(2000);

    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/dark-stage.png` });
    await context.close();
  }

  console.log("[2/9] Capturing Light Mode Main Stage (3024x1898)...");
  {
    const context = await createCaptureContext(browser, "light", { width: 1512, height: 949 }, 2);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { appHistory } = await import("/src/appNavigation.ts");
      appHistory.push("/thread-main");
    });
    await page.waitForTimeout(2000);

    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/light-stage.png` });
    await context.close();
  }

  console.log("[3/9] Capturing Wide Light Mode for Readme Back-Window (3456x2168)...");
  {
    const context = await createCaptureContext(browser, "light", { width: 1728, height: 1084 }, 2);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      await import("/src/components/pullRequest/PullRequestDockPane.tsx");
      await import("/src/components/pullRequest/PullRequestDetailPanel.tsx");

      const { useRightDockStore } = await import("/src/rightDockStore.ts");
      const { appHistory } = await import("/src/appNavigation.ts");

      useRightDockStore.getState().openPane("thread-main", {
        kind: "pullRequest",
        pullRequestProjectId: "proj-zyron",
        pullRequestRepository: "itsKyze/zyron",
        pullRequestNumber: 1260,
        pullRequestInitialTab: "summary",
      });
      useRightDockStore.getState().setDockOpen("thread-main", true);
      appHistory.push("/thread-main");
    });
    await page.waitForTimeout(3000);

    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/light-stage-wide.png` });
    await context.close();
  }

  console.log("[4/9] Capturing Split View Dark Mode (3024x1898)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1512, height: 949 }, 2);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { useSplitViewStore } = await import("/src/splitViewStore.ts");
      const { appHistory } = await import("/src/appNavigation.ts");

      const splitId = useSplitViewStore.getState().createFromDrop({
        sourceThreadId: "thread-split-1",
        droppedThreadId: "thread-split-2",
        direction: "horizontal",
        side: "second",
      });
      appHistory.push("/thread-split-1?splitViewId=" + splitId);
    });
    await page.waitForTimeout(2500);
    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/split-view.png` });
    await context.close();
  }

  console.log("[5/9] Capturing Browser Dock Dark Mode (3024x1898)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1512, height: 949 }, 2);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { useRightDockStore } = await import("/src/rightDockStore.ts");
      const { appHistory } = await import("/src/appNavigation.ts");

      appHistory.push("/thread-browser");
      useRightDockStore.getState().openPane("thread-browser", { kind: "browser" });
      useRightDockStore.getState().setDockOpen("thread-browser", true);
    });
    await page.waitForTimeout(2500);
    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/browser-dock.png` });
    await context.close();
  }

  console.log("[6/9] Capturing Appearance Settings Dialog (1280x803)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1280, height: 803 }, 1);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { appHistory } = await import("/src/appNavigation.ts");
      appHistory.push("/settings?section=appearance");
    });
    await page.waitForTimeout(2500);
    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/appearance.png` });
    await context.close();
  }

  console.log("[7/9] Capturing Split View 1280x803...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1280, height: 803 }, 1);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { useSplitViewStore } = await import("/src/splitViewStore.ts");
      const { appHistory } = await import("/src/appNavigation.ts");

      const splitId = useSplitViewStore.getState().createFromDrop({
        sourceThreadId: "thread-split-1",
        droppedThreadId: "thread-split-2",
        direction: "horizontal",
        side: "second",
      });
      appHistory.push("/thread-split-1?splitViewId=" + splitId);
    });
    await page.waitForTimeout(2500);
    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/split-view-small.png` });
    await context.close();
  }

  console.log("[8/9] Capturing Projects Sidebar closeup (516x480)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1440, height: 900 }, 1);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { appHistory } = await import("/src/appNavigation.ts");
      appHistory.push("/thread-main");
    });
    await page.waitForTimeout(1500);

    const sidebar =
      (await page.$('[data-slot="sidebar-wrapper"]')) ||
      (await page.$("aside")) ||
      (await page.$("nav"));
    if (sidebar) {
      await sidebar.screenshot({ path: `${TMP_DIR}/projects-sidebar.png` });
    } else {
      await page.screenshot({
        path: `${TMP_DIR}/projects-sidebar.png`,
        clip: { x: 0, y: 0, width: 320, height: 480 },
      });
    }
    await context.close();
  }

  console.log("[9/9] Capturing Hero Fullscreen Dark Mode (1920x1080)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1920, height: 1080 }, 1);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await seedAppState(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { appHistory } = await import("/src/appNavigation.ts");
      appHistory.push("/thread-main");
    });
    await page.waitForTimeout(2000);

    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/hero-fullscreen.png` });
    await context.close();
  }

  console.log("[10/10] Capturing Marketing Screenshot Landing (1800x1100)...");
  {
    const context = await createCaptureContext(browser, "dark", { width: 1800, height: 1100 }, 1);
    const page = await context.newPage();
    await page.goto("http://localhost:5733/");
    await page.waitForTimeout(1000);

    await dismissAnyOverlay(page);
    await applyCleanVisualOverrides(page);

    await page.evaluate(async () => {
      const { useStore } = await import("/src/store.ts");
      const { useRightDockStore } = await import("/src/rightDockStore.ts");
      const { appHistory } = await import("/src/appNavigation.ts");
      const { ensureNativeApi } = await import("/src/nativeApi.ts");

      // Patch listModels to immediately supply GPT-5.5 Codex
      const api = ensureNativeApi();
      api.provider.listModels = async ({ provider }) => {
        return {
          models: [
            { slug: "gpt-5.5", name: "GPT-5.5", defaultEffort: "medium" },
            { slug: "gpt-5.4", name: "GPT-5.4", defaultEffort: "high" },
          ],
          source: "codex-app-server",
        };
      };

      const now = new Date().toISOString();
      const readModel = {
        snapshotSequence: 999999,
        updatedAt: now,
        spaces: [],
        projects: [
          {
            id: "proj-zyron",
            kind: "project",
            title: "zyron",
            workspaceRoot: "/home/kyzedev/zyron",
            defaultModelSelection: { provider: "codex", model: "gpt-5.5" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
          {
            id: "proj-api",
            kind: "project",
            title: "api-gateway",
            workspaceRoot: "/home/kyzedev/api-gateway",
            defaultModelSelection: { provider: "codex", model: "gpt-5.5" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
          {
            id: "proj-openbot",
            kind: "project",
            title: "openbot-workspace",
            workspaceRoot: "/home/kyzedev/openbot",
            defaultModelSelection: { provider: "antigravity", model: "gemini-2.5-flash" },
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            scripts: [],
            spaceId: null,
          },
        ],
        threads: [
          {
            id: "thread-landing",
            projectId: "proj-zyron",
            title: "New thread",
            modelSelection: { provider: "codex", model: "gpt-5.5" },
            runtimeMode: "full-access",
            interactionMode: "default",
            envMode: "local",
            branch: "codex/zyron-identity-cutover",
            worktreePath: "/home/kyzedev/zyron/worktrees/cutover",
            forkSourceThreadId: null,
            sidechatSourceThreadId: null,
            latestTurn: null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            handoff: null,
            messages: [],
            activities: [],
            proposedPlans: [],
            checkpoints: [],
            session: null,
          },
        ],
      };

      useStore.getState().syncServerReadModel(readModel);
      useStore.getState().syncServerThreadDetail({
        id: "thread-landing",
        projectId: "proj-zyron",
        title: "New thread",
        modelSelection: { provider: "codex", model: "gpt-5.5" },
        runtimeMode: "full-access",
        interactionMode: "default",
        envMode: "local",
        branch: "codex/zyron-identity-cutover",
        worktreePath: "/home/kyzedev/zyron/worktrees/cutover",
        forkSourceThreadId: null,
        sidechatSourceThreadId: null,
        latestTurn: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        handoff: null,
        messages: [],
        activities: [],
        proposedPlans: [],
        checkpoints: [],
        session: null,
      });

      useStore.getState().setAllProjectsExpanded(true);
      useRightDockStore.getState().setDockOpen("thread-landing", false);

      appHistory.push("/thread-landing");
    });

    await page.waitForTimeout(2000);
    await dismissAnyOverlay(page);
    await addTrafficLights(page);

    await page.screenshot({ path: `${TMP_DIR}/screenshot-landing.png` });
    await context.close();
  }

  await browser.close();
  console.log("All captures completed cleanly with 100% solid, rich authentic Zyron UI!");
}

captureAll().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
