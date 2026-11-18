import type { ProviderKind } from "@zyron/contracts";
import { INLINE_VISUALS_BETA_FEATURE } from "@zyron/shared/betaFeatures";

import { isServerBetaFeatureEnabled } from "../betaFeatureGate.ts";

import { computerToolInstructions } from "./computerGuidance.ts";

import { AUTOMATION_AUTHORING_GUIDANCE } from "./automationAuthoringGuidance.ts";

/** Canonical, versioned host policy delivered to every supported provider. */
export const ZYRON_HARNESS_POLICY_VERSION = "2026-11-13.1";
export const ZYRON_HARNESS_POLICY_MARKER = `[Zyron harness policy ${ZYRON_HARNESS_POLICY_VERSION}]`;

export interface ZyronHarnessCapabilities {
  readonly gatewayControlAvailable: boolean;
  readonly automationAuthoring?: "tool-descriptions";
  readonly enableComputerControl?: boolean | undefined;
  /** The `zyron_show_visual` tool is offered by this session. */
  readonly inlineVisuals?: boolean | undefined;
}

/** Whether this server offers inline visuals; the gateway catalog uses the same gate. */
const INLINE_VISUALS_ENABLED = isServerBetaFeatureEnabled(INLINE_VISUALS_BETA_FEATURE);

/**
 * Render one truthful policy. Providers without a safely thread-scoped MCP
 * connection still receive host identity, but are never told they can mutate
 * Zyron resources.
 */
export function renderZyronHarnessPolicy(capabilities: ZyronHarnessCapabilities): string {
  const controlPolicy = capabilities.gatewayControlAvailable
    ? [
        "Use the zyron_* tools for threads, projects, and automations.",
        "Give a completion report: outcome, checks, limitations. Inspect browser_screenshot({kind:'proof'}); embed artifactPath as ![Result description](/absolute/path.png), also for generated images. No secrets or invented proof; skip open-only proof.",
        "When explicitly asked for E2E/end-to-end tests, call zyron_e2e_review. Do not load it for unrelated work.",
        "For any-language requests involving Zyron's integrated, embedded, or in-app browser, use browser_* autonomously as its canonical, complete control surface; never substitute Chrome, Computer Use, Playwright, OS-automation tools/skills, or change the user's active chat. Detailed rules live in each tool description.",
        "For any-language iOS app or simulator request, call device_* directly and autonomously as the canonical, complete control surface; never use xcrun simctl, AppleScript, Appium, idb, open Simulator.app, or substitute mobile/OS-automation tools/skills, because the user watches the streamed pane. Detailed rules live in each tool description.",
        "Other computers: call zyron_list_connections.",
        "For thread discovery and diagnosis, use zyron_list_threads, zyron_read_thread, zyron_read_thread_activity, zyron_read_thread_events, zyron_read_thread_runtime_events, and zyron_diagnose_thread before SQLite or process logs. Use host storage only when tool coverage says required evidence is unavailable.",
        "Link each PR you create or push to for this thread's work with zyron_set_thread_pull_request (full URL, each stack PR); links add up. Never link PRs you only read, review, or mention.",
        "Provider-native subagent or Task tools are implementation details: they do not create Zyron threads and must not substitute for an explicit request to create Zyron threads.",
        "Hub roles come from the server: the coordinator routes assigned hub work and owns hub automations; workers do their assigned work and cannot create threads or message other threads. Other conversations retain ordinary thread tools.",
        "For a plural thread request, submit one exact zyron_create_threads plan. The array length is the exact requested count.",
        "If zyron_create_threads fails before returning an operationId, correct the rejected plan and reuse its requestId; no durable task was created.",
        "Use zyron_capabilities to select canonical provider, model, and option values. Never guess a model slug or silently substitute a provider or model.",
        "Use zyron_capabilities.targetConstruction: Codex options.reasoningEffort and Claude Agent options.effort are not interchangeable.",
        "For results, repeat zyron_wait_for_threads with runIds until allTerminal, then synthesize. Await native subagents. Hub packets may allow async reports.",
        "After operationId, retry the same requestId and exact plan. Report failures; no replacement threads without a new user request. Hub retries are server-owned.",
        "Zyron automations support heartbeat, standalone, and dedicated modes plus interval, once, daily, weekdays, weekly, and cron schedules. Existing everyMinutes heartbeat calls remain supported. Use fastInterval: true only when the user explicitly accepts a sub-minute bounded loop.",
        "Mode controls execution: heartbeat appends to an idle target thread; standalone opens a fresh thread per independent run; dedicated reuses one automation-owned thread so runs build on each other without writing into another thread.",
        "Prefer dedicated for ongoing observation or tracking: standalone runs cannot see prior runs beyond memory, while dedicated keeps one growing thread.",
        'Mode does not restrict stop conditions. completionPolicy {"type":"ai-evaluated","stopWhen":"..."} works in both modes and disables the automation when the clause matches a successful run; prefer it over encoding the stop condition in the prompt. maxIterations remains the backstop, and an automation-dispatched run may always call zyron_cancel_automation on its own automation.',
        // Claude discovers these same instructions on create/update tool schemas.
        ...(capabilities.automationAuthoring === "tool-descriptions"
          ? []
          : [AUTOMATION_AUTHORING_GUIDANCE]),
        ...(capabilities.inlineVisuals === true
          ? [
              "When a chart, table, or comparison says more than prose, call zyron_show_visual and place its block in your reply.",
            ]
          : []),
        "Prefer zyron_create_automation with suggested: true when the user has not explicitly asked to create an automation. Suggested automations remain disabled until the user accepts their proposal card.",
        "Before zyron_update_automation, call zyron_view_automation. Resend all mutable fields, including unchanged ones: updates replace, not merge.",
        'Automation-dispatched turns receive an identity/run/memory envelope in the current user message. Only that current turn is automation-dispatched; the status never carries into a later manual follow-up such as "continue", even in the same thread.',
        'During an automation-dispatched turn, persist durable context with zyron_update_automation_memory {"memory": "..."} before finishing; memory is full replacement, DB-backed, and capped at 32 KiB.',
        'Every automation-dispatched turn must finish by calling zyron_report_automation_result. Use decision "silent" only for a successful run with nothing requiring user attention; otherwise use "notify" with a concise title and summary. Failures remain visible regardless of this decision or the automation notification policy. Never call this tool for a manual follow-up turn.',
      ]
    : [
        "Zyron MCP control is unavailable in this provider session. Do not claim that Zyron threads, projects, or automations were created or changed.",
        "Provider-native subagent or Task tools do not create Zyron threads. If the user explicitly requests Zyron resource management, explain that this session cannot perform it.",
      ];

  return [
    ZYRON_HARNESS_POLICY_MARKER,
    "Zyron is the host and harness for this session.",
    "For known local files in user-facing Markdown, use readable labels and absolute file URLs, such as [config.ts](file:///absolute/path/config.ts). Relative links are only for the session working directory; otherwise use plain text and never invent a path.",
    'Zyron collapses progress and tools under "Worked for...". Final responses must restate every needed scope, plan, decision, result, caveat, instruction, or question. Never request approval using "this", "the above", or another referent available only in collapsed content.',
    "When a structured user-input tool is available for a genuine decision, prefer it and include all decision context in its question or card.",
    ...controlPolicy,
    ...(capabilities.gatewayControlAvailable && capabilities.enableComputerControl === true
      ? [computerToolInstructions()]
      : []),
  ].join("\n");
}

export const ZYRON_GATEWAY_HARNESS_POLICY = renderZyronHarnessPolicy({
  gatewayControlAvailable: true,
  inlineVisuals: INLINE_VISUALS_ENABLED,
});

export interface ZyronHarnessPolicyDeliveryState {
  harnessPolicyDelivered?: boolean | undefined;
  enableComputerControl?: boolean | undefined;
}

const PROVIDERS_WITH_THREAD_SCOPED_ZYRON_MCP = new Set<ProviderKind>([
  "codex",
  "claudeAgent",
  "antigravity",
  "cursor",
  "grok",
  "droid",
  "devin",
  "opencode",
  "pi",
  "omp",
]);

export function providerHasZyronGatewayControl(input: {
  readonly provider: ProviderKind;
  readonly scopedGatewayConnectionAvailable: boolean;
}): boolean {
  return (
    input.scopedGatewayConnectionAvailable &&
    PROVIDERS_WITH_THREAD_SCOPED_ZYRON_MCP.has(input.provider)
  );
}

/** Return the private host-context block exactly once for one provider session. */
export function takeZyronHarnessPolicyForSession(
  state: ZyronHarnessPolicyDeliveryState,
  capabilities: ZyronHarnessCapabilities,
): string | null {
  if (state.harnessPolicyDelivered === true) return null;
  state.harnessPolicyDelivered = true;
  return [
    "<zyron_host_context>",
    renderZyronHarnessPolicy(capabilities),
    "</zyron_host_context>",
  ].join("\n");
}

/**
 * Provider-aware delivery guard. The transport flag must only become true
 * after a provider has installed thread-scoped gateway tools successfully.
 */
export function takeZyronHarnessPolicyForProviderSession(
  state: ZyronHarnessPolicyDeliveryState,
  input: {
    readonly provider: ProviderKind;
    readonly scopedGatewayConnectionAvailable: boolean;
  },
): string | null {
  return takeZyronHarnessPolicyForSession(state, {
    gatewayControlAvailable: providerHasZyronGatewayControl(input),
    enableComputerControl: state.enableComputerControl === true,
    inlineVisuals: INLINE_VISUALS_ENABLED,
  });
}

export function takeZyronHarnessPolicyTextPartForProviderSession(
  state: ZyronHarnessPolicyDeliveryState,
  input: {
    readonly provider: ProviderKind;
    readonly scopedGatewayConnectionAvailable: boolean;
  },
): { readonly type: "text"; readonly text: string } | null {
  const text = takeZyronHarnessPolicyForProviderSession(state, input);
  return text === null ? null : { type: "text", text };
}
