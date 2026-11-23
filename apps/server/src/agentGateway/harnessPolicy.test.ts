import { assert, describe, it } from "@effect/vitest";
import { AUTOMATION_AUTHORING_GUIDANCE } from "./automationAuthoringGuidance.ts";

import {
  renderZyronHarnessPolicy,
  ZYRON_HARNESS_POLICY_MARKER,
  takeZyronHarnessPolicyForProviderSession,
  takeZyronHarnessPolicyTextPartForProviderSession,
  takeZyronHarnessPolicyForSession,
} from "./harnessPolicy.ts";

describe("Zyron harness policy", () => {
  it("defers duplicate automation authoring text while preserving tool routing and run rules", () => {
    const inline = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    const deferred = renderZyronHarnessPolicy({
      gatewayControlAvailable: true,
      automationAuthoring: "tool-descriptions",
    });
    assert.equal(deferred, inline.replace(`${AUTOMATION_AUTHORING_GUIDANCE}\n`, ""));
    assert.include(deferred, "zyron_create_automation");
    assert.include(deferred, "zyron_view_automation");
    assert.include(deferred, "zyron_report_automation_result");
  });

  it("includes honest completion evidence and opt-in delegated E2E testing", () => {
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    for (const text of [
      "completion report",
      "artifactPath",
      "![Result description]",
      "explicitly asked",
      "zyron_e2e_review",
      "Do not load it for unrelated work",
    ]) {
      assert.include(policy, text);
    }
    assert.notInclude(
      renderZyronHarnessPolicy({ gatewayControlAvailable: false }),
      "browser_screenshot({kind:'proof'})",
    );
  });

  it("identifies Zyron and explains exact batch coordination when MCP is available", () => {
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    assert.include(policy, ZYRON_HARNESS_POLICY_MARKER);
    assert.include(policy, "Zyron is the host and harness");
    assert.include(policy, "one exact zyron_create_threads plan");
    assert.include(policy, "before returning an operationId");
    assert.include(policy, "zyron_wait_for_threads");
    assert.include(policy, "zyron_set_thread_pull_request");
    assert.include(policy, "for this thread's work");
    assert.include(policy, "links add up");
    assert.include(policy, "only read, review, or mention");
    assert.include(policy, "use browser_* autonomously");
    assert.include(policy, "canonical, complete control surface");
    assert.include(policy, "never substitute Chrome");
    assert.include(policy, "user's active chat");
    assert.include(policy, "Detailed rules live in each tool description");
    assert.notInclude(policy, "BrowserInterruptedByHuman");
    assert.notInclude(policy, "start with browser_open");
    assert.include(policy, "do not create Zyron threads");
    assert.include(policy, "specific 3–8 word outcome label");
    assert.include(policy, "Assume no chat context");
    assert.include(policy, "notify-versus-silent criteria");
    assert.include(policy, 'later manual follow-up such as "continue"');
    assert.include(policy, "Never call this tool for a manual follow-up turn");
  });

  it("asks agents to emit known absolute file URLs instead of invented relative links", () => {
    const gateway = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    const identityOnly = renderZyronHarnessPolicy({ gatewayControlAvailable: false });

    for (const policy of [gateway, identityOnly]) {
      assert.include(policy, "[config.ts](file:///absolute/path/config.ts)");
      assert.include(policy, "Relative links are only for the session working directory");
      assert.include(policy, "use plain text and never invent a path");
    }
  });

  it("keeps final answers self-contained when intermediate progress is collapsed", () => {
    const gateway = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    const identityOnly = renderZyronHarnessPolicy({ gatewayControlAvailable: false });

    for (const policy of [gateway, identityOnly]) {
      assert.include(policy, 'under "Worked for..."');
      assert.include(policy, "Final responses must restate every needed scope");
      assert.include(policy, 'Never request approval using "this", "the above"');
      assert.include(policy, "structured user-input tool");
      assert.include(policy, "include all decision context");
    }
  });

  it("never advertises gateway mutation to providers without scoped MCP", () => {
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: false });
    assert.include(policy, "Zyron MCP control is unavailable");
    assert.notInclude(policy, "one exact zyron_create_threads plan");
  });

  it("delivers a private host-context block once per provider session", () => {
    const state: { harnessPolicyDelivered?: boolean } = {};
    assert.include(
      takeZyronHarnessPolicyForSession(state, { gatewayControlAvailable: true }) ?? "",
      "<zyron_host_context>",
    );
    assert.isNull(takeZyronHarnessPolicyForSession(state, { gatewayControlAvailable: true }));

    // The text-part form ACP adapters inject obeys the same once-per-session latch.
    const partState: { harnessPolicyDelivered?: boolean } = {};
    const input = { provider: "cursor", scopedGatewayConnectionAvailable: true } as const;
    assert.include(
      takeZyronHarnessPolicyTextPartForProviderSession(partState, input)?.text ?? "",
      ZYRON_HARNESS_POLICY_MARKER,
    );
    assert.isNull(takeZyronHarnessPolicyTextPartForProviderSession(partState, input));
  });

  it("keeps OpenCode and Pi identity-only until scoped setup succeeds", () => {
    for (const provider of ["opencode", "pi"] as const) {
      const text =
        takeZyronHarnessPolicyForProviderSession(
          {},
          { provider, scopedGatewayConnectionAvailable: false },
        ) ?? "";
      assert.include(text, ZYRON_HARNESS_POLICY_MARKER, provider);
      assert.include(text, "Zyron MCP control is unavailable", provider);
      assert.notInclude(text, "one exact zyron_create_threads plan", provider);
    }
  });

  it("routes iOS work to device tools without embedding per-tool instructions", () => {
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    assert.include(policy, "any-language iOS app or simulator request");
    assert.include(policy, "call device_* directly and autonomously");
    assert.include(policy, "never use xcrun simctl");
    assert.include(policy, "open Simulator.app");
    assert.include(policy, "user watches the streamed pane");
    assert.notInclude(policy, "device_list first");
    assert.notInclude(policy, "com.apple.Preferences");
  });

  it("keeps hub roles out of reach of a worker without loosening normal conversations", () => {
    // Sessions with gateway control get the hub role line; sessions without it
    // are told nothing about hub routing they cannot perform anyway.
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: true });
    assert.include(policy, "Hub roles come from the server");
    assert.include(policy, "the coordinator routes assigned hub work and owns hub automations");
    assert.include(
      policy,
      "workers do their assigned work and cannot create threads or message other threads",
    );
    assert.include(policy, "Other conversations retain ordinary thread tools.");
    assert.notInclude(
      renderZyronHarnessPolicy({ gatewayControlAvailable: false }),
      "Hub roles come from the server",
    );
  });

  it("keeps the gateway policy below its prompt budget", () => {
    // Role guidance adds one line; keep the optional visual guidance in its own budget.
    assert.isAtMost(renderZyronHarnessPolicy({ gatewayControlAvailable: true }).length, 6_250);
    assert.isAtMost(
      renderZyronHarnessPolicy({ gatewayControlAvailable: true, inlineVisuals: true }).length,
      6_380,
    );
  });

  it("points to zyron_show_visual only when the session can call it", () => {
    const visualLine = "call zyron_show_visual and place its block in your reply";
    assert.include(
      renderZyronHarnessPolicy({ gatewayControlAvailable: true, inlineVisuals: true }),
      visualLine,
    );
    assert.notInclude(renderZyronHarnessPolicy({ gatewayControlAvailable: true }), visualLine);
    assert.notInclude(
      renderZyronHarnessPolicy({ gatewayControlAvailable: false, inlineVisuals: true }),
      visualLine,
    );
  });

  it("withholds device guidance from sessions with no gateway control", () => {
    const policy = renderZyronHarnessPolicy({ gatewayControlAvailable: false });

    // Promising tools this session cannot reach would be a lie.
    assert.notInclude(policy, "device_list");
    assert.notInclude(policy, "device_describe_ui");
  });

  it("includes Computer tool guidance only when the session can use Computer", () => {
    for (const gatewayControlAvailable of [true, false] as const) {
      for (const enableComputerControl of [true, false, undefined] as const) {
        const policy = renderZyronHarnessPolicy({
          gatewayControlAvailable,
          ...(enableComputerControl === undefined ? {} : { enableComputerControl }),
        });
        const scope = `${gatewayControlAvailable}/${enableComputerControl}`;
        if (gatewayControlAvailable && enableComputerControl === true) {
          assert.include(policy, "## Zyron computer use", scope);
          assert.include(policy, "The computer_* tools are live on this session", scope);
        } else {
          assert.notInclude(policy, "## Zyron computer use", scope);
          assert.notInclude(policy, "computer_", scope);
          assert.notInclude(policy, "turn Computer control on in Settings", scope);
        }
      }
    }
  });
});

it("adds Computer guidance only for an explicitly enabled scoped session across all providers", () => {
  const providers = [
    "codex",
    "claudeAgent",
    "cursor",
    "grok",
    "droid",
    "devin",
    "opencode",
    "pi",
    "antigravity",
  ] as const;
  for (const provider of providers) {
    const off = takeZyronHarnessPolicyForProviderSession(
      {},
      { provider, scopedGatewayConnectionAvailable: true },
    );
    const explicitOff = takeZyronHarnessPolicyForProviderSession(
      { enableComputerControl: false },
      { provider, scopedGatewayConnectionAvailable: true },
    );
    assert.strictEqual(off, explicitOff);
    assert.notInclude(off ?? "", "## Zyron computer use");
    assert.notInclude(off ?? "", "computer_", provider);
    const state = { enableComputerControl: true };
    const on =
      takeZyronHarnessPolicyForProviderSession(state, {
        provider,
        scopedGatewayConnectionAvailable: true,
      }) ?? "";
    assert.equal(on.split("## Zyron computer use").length - 1, 1, provider);
    assert.include(on, "never replay it");
    assert.isNull(
      takeZyronHarnessPolicyForProviderSession(state, {
        provider,
        scopedGatewayConnectionAvailable: true,
      }),
    );
    assert.notInclude(
      takeZyronHarnessPolicyForProviderSession(
        { enableComputerControl: true },
        { provider, scopedGatewayConnectionAvailable: false },
      ) ?? "",
      "## Zyron computer use",
    );
  }
});
