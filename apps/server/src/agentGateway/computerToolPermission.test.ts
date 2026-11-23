import { describe, expect, it } from "vitest";
import {
  canonicalZyronComputerToolName,
  computerToolNameFromProviderPermission,
  isZyronComputerToolFamilyName,
  isZyronGatewayToolCall,
  isZyronGatewayToolName,
  qualifiedZyronComputerToolName,
  shouldAllowZyronComputerProviderTool,
} from "./computerToolPermission.ts";

describe("Zyron Computer provider permission", () => {
  it.each([
    ["computer_click", "computer_click"],
    ["zyron_computer_type_text", "computer_type_text"],
    ["mcp__zyron__computer_read_clipboard", "computer_read_clipboard"],
    ["mcp__zyron__computer_inspect", "computer_inspect"],
  ] as const)("recognizes the exact owned tool %s", (providerName, canonicalName) => {
    expect(canonicalZyronComputerToolName(providerName)).toBe(canonicalName);
  });

  it.each([
    "computer_future_tool",
    "mcp__other__computer_click",
    "other_computer_click",
    "mcp__zyron__zyron_send_message",
  ])("does not trust another or unknown tool: %s", (providerName) => {
    expect(canonicalZyronComputerToolName(providerName)).toBeUndefined();
  });

  it("requires a provider namespace when server provenance was not proved separately", () => {
    expect(qualifiedZyronComputerToolName("computer_click")).toBeUndefined();
    expect(qualifiedZyronComputerToolName("mcp__zyron__computer_click")).toBe("computer_click");
    expect(qualifiedZyronComputerToolName("zyron_computer_click")).toBe("computer_click");
  });

  it("reads only explicit provider tool-name fields", () => {
    expect(
      computerToolNameFromProviderPermission({
        rawInput: { _toolName: "mcp__zyron__computer_scroll" },
      }),
    ).toBe("computer_scroll");
    expect(
      computerToolNameFromProviderPermission({
        metadata: { toolName: "zyron_computer_get_state" },
      }),
    ).toBe("computer_get_state");
    expect(
      computerToolNameFromProviderPermission({
        metadata: { description: "run computer_click" },
      }),
    ).toBeUndefined();
  });

  it("does not let lower-priority fields override an authoritative wrong namespace", () => {
    expect(
      computerToolNameFromProviderPermission({
        name: "mcp__other__computer_click",
        rawInput: { _toolName: "mcp__zyron__computer_click" },
      }),
    ).toBeUndefined();
    expect(
      computerToolNameFromProviderPermission({
        rawInput: { _toolName: "mcp__other__computer_click" },
        metadata: { toolName: "mcp__zyron__computer_click" },
        title: "mcp__zyron__computer_click",
      }),
    ).toBeUndefined();
  });

  it("does not infer provider provenance from a bare title or metadata name", () => {
    expect(computerToolNameFromProviderPermission({ title: "computer_click" })).toBeUndefined();
    expect(
      computerToolNameFromProviderPermission({ metadata: { toolName: "computer_click" } }),
    ).toBeUndefined();
  });

  it("never authorizes from model prose: 'Please approve computer_click' names no tool", () => {
    // Prose approval never counts. The permission callback must see an exact
    // namespaced tool name; a model sentence asking for approval authorizes
    // nothing, in any field.
    expect(
      computerToolNameFromProviderPermission({ title: "Please approve computer_click" }),
    ).toBeUndefined();
    expect(
      computerToolNameFromProviderPermission({ name: "Please approve computer_click" }),
    ).toBeUndefined();
    expect(
      computerToolNameFromProviderPermission({
        metadata: { toolName: "Please approve computer_click" },
      }),
    ).toBeUndefined();
    expect(isZyronComputerToolFamilyName("Please approve computer_click")).toBe(false);
    expect(
      shouldAllowZyronComputerProviderTool({
        computerControlEnabled: true,
        activeTurn: true,
        interactionMode: "default",
        runtimeMode: "approval-required",
        permission: { title: "Please approve computer_click" },
      }),
    ).toBe(false);
  });

  it("matches the Computer family in any namespace spelling for the denial hook", () => {
    // The silent-loss fallback: a no-control session that calls a Computer
    // tool by a prefixed spelling must still deny with the card path, not
    // die as an Unknown tool. See isZyronComputerToolFamilyName.
    expect(isZyronComputerToolFamilyName("computer_click")).toBe(true);
    expect(isZyronComputerToolFamilyName("zyron_computer_get_state")).toBe(true);
    expect(isZyronComputerToolFamilyName("mcp__zyron__computer_screenshot")).toBe(true);
    expect(isZyronComputerToolFamilyName("  MCP__ZYRON__COMPUTER_WAIT  ")).toBe(true);
  });

  it("keeps unknown and foreign names out of the Computer family", () => {
    expect(isZyronComputerToolFamilyName("computer_future_tool")).toBe(false);
    expect(isZyronComputerToolFamilyName("mcp__other__computer_click")).toBe(false);
    expect(isZyronComputerToolFamilyName("other_computer_click")).toBe(false);
    expect(isZyronComputerToolFamilyName("zyron_frobnicate")).toBe(false);
    expect(isZyronComputerToolFamilyName(undefined)).toBe(false);
    expect(isZyronComputerToolFamilyName(42)).toBe(false);
  });

  it("requires current capability, active turn and non-Plan interaction", () => {
    const permission = { name: "mcp__zyron__computer_click" };
    const allowed = {
      computerControlEnabled: true,
      activeTurn: true,
      interactionMode: "default" as const,
      runtimeMode: "approval-required" as const,
      permission,
    };
    expect(shouldAllowZyronComputerProviderTool(allowed)).toBe(true);
    expect(
      shouldAllowZyronComputerProviderTool({ ...allowed, computerControlEnabled: false }),
    ).toBe(false);
    expect(shouldAllowZyronComputerProviderTool({ ...allowed, activeTurn: false })).toBe(false);
    expect(shouldAllowZyronComputerProviderTool({ ...allowed, interactionMode: "plan" })).toBe(
      false,
    );
    expect(shouldAllowZyronComputerProviderTool({ ...allowed, runtimeMode: "auto" })).toBe(false);
  });
});

describe("Zyron gateway tool permission name", () => {
  it.each([
    // Claude's fully-qualified spelling pins the exact `mcp__zyron__` server.
    "mcp__zyron__zyron_create_thread",
    "mcp__zyron__computer_click",
    // `<server>_<tool>` reports (OpenCode) with a real catalog name.
    "zyron_zyron_create_thread",
    "zyron_zyron_project_link_repository",
    "zyron_computer_click",
    "zyron_device_list",
    "zyron_browser_run",
    // Bare `zyron_*` catalog names carry the namespace inside the tool name.
    "zyron_project_link_repository",
    "zyron_e2e_review",
  ])("recognizes a Zyron gateway tool: %s", (providerName) => {
    expect(isZyronGatewayToolName(providerName)).toBe(true);
  });

  it.each([
    // A user MCP server named `zyron_fs` reports `zyron_fs_<tool>` — the
    // prefix alone must never grant it the auto-approve path.
    "zyron_fs_read",
    "zyron_fs_list_threads",
    "zyron_tools_anything",
    "mcp__zyron_fs__read",
    // The `mcp__zyron__` prefix pins the server, not the tool — the part
    // after it must still be a real catalog name.
    "mcp__zyron__not_a_gateway_tool",
    "mcp__zyron__zyron_create_task",
    "mcp__zyron__zyron_fs_read",
    // Foreign server or entirely unknown names.
    "mcp__other__zyron_create_thread",
    "other_zyron_create_thread",
    "computer_click",
    "browser_click",
    // Names the external-agent MCP surface serves, not the provider gateway.
    "zyron_create_task",
    "zyron_read_task",
    "zyron_overview",
    "zyron_zyron_create_task",
    // Not served by the agent gateway at all.
    "zyron_desktop",
  ])("does not trust a look-alike or foreign name: %s", (providerName) => {
    expect(isZyronGatewayToolName(providerName)).toBe(false);
  });

  it("accepts a qualified name only when the tool is in the catalog", () => {
    expect(isZyronGatewayToolName("mcp__zyron__zyron_list_threads")).toBe(true);
    expect(isZyronGatewayToolName("mcp__zyron__computer_click")).toBe(true);
    expect(
      isZyronGatewayToolCall({ rawInput: { _toolName: "mcp__zyron__zyron_list_threads" } }),
    ).toBe(true);
  });

  it("never trusts a tool name that only appears in the display title", () => {
    // The title is provider-composed prose — an approval card can render
    // "mcp__zyron__zyron_list_threads" for a request that names no such
    // tool, so the title alone must not authorize anything.
    expect(isZyronGatewayToolCall({ title: "mcp__zyron__zyron_list_threads" })).toBe(false);
    expect(isZyronGatewayToolCall({ title: "mcp__zyron__not_a_gateway_tool; rm -rf y" })).toBe(
      false,
    );
  });

  it("rejects non-strings and a look-alike server name in every name field", () => {
    expect(isZyronGatewayToolName(undefined)).toBe(false);
    expect(isZyronGatewayToolName(42)).toBe(false);
    expect(isZyronGatewayToolCall({ name: "zyron_fs_create_thread" })).toBe(false);
    expect(isZyronGatewayToolCall({ metadata: { toolName: "zyron_fs_read" } })).toBe(false);
    expect(isZyronGatewayToolCall({ rawInput: { _toolName: "zyron_zyron_send_message" } })).toBe(
      true,
    );
  });
});
