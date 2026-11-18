// FILE: toolCallLabel.ts
// Purpose: Normalizes generic tool-call titles and humanizes command executions for timeline rows.
// Layer: UI utility
// Exports: deriveReadableToolTitle, deriveReadableCommandDisplay, deriveFriendlyCommandTarget, command icon classifiers, deriveInlineCommandCall, deriveLiteralCommand, deriveCommandReadTargets, normalizeCompactToolLabel, isGenericToolTitle, extractWebFetchUrl
// Depends on: @zyron/contracts tool lifecycle item types

import type { ToolLifecycleItemType } from "@zyron/contracts";
import { t } from "~/i18n";
import { BROWSER_TOOL_TITLES } from "@zyron/shared/browserAutomationPresentation";
import {
  COMPUTER_TOOL_TITLE_KEYS,
  computerToolName,
  type ComputerToolName,
} from "./computerToolPresentation";
import { basenameOfPath } from "../file-icons";
import { extractToolArgumentField } from "./toolArgumentSummary";

export function normalizeCompactToolLabel(value: string): string {
  return value
    .trimEnd()
    .replace(/\s(?:complete|completed|done|finished|success|succeeded|started|running)$/i, "")
    .trim();
}

// Canonical form for comparing tool display strings (heading vs preview vs
// label): ignores case, whitespace runs, and trailing status words so dedup
// decisions behave identically in the work-log builder and the timeline rows.
export function normalizeToolTextForComparison(value: string | undefined): string {
  return normalizeCompactToolLabel(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Web-fetch tool calls (e.g. Claude's `WebFetch`) arrive as generic dynamic tool
// calls whose detail is the raw `ToolName: {json}` argument summary. Recognizing
// them lets the timeline surface the target site (favicon + URL) instead of the
// raw JSON arguments.
const WEB_FETCH_TOOL_NAMES = new Set(["webfetch", "fetch", "urlfetch", "fetchurl", "httpfetch"]);

function isWebFetchToolName(toolName: string | null | undefined): boolean {
  if (!toolName) {
    return false;
  }
  const normalized = toolName.toLowerCase().replace(/[^a-z]/g, "");
  if (WEB_FETCH_TOOL_NAMES.has(normalized)) {
    return true;
  }
  return (
    normalized.includes("fetch") &&
    (normalized.includes("web") || normalized.includes("url") || normalized.includes("http"))
  );
}

// Pulls the first http(s) URL out of a web-fetch tool call's argument summary.
// Prefers the JSON `url`/`uri` field (the actual shape) and falls back to a bare
// URL token so a slightly different summary still resolves. Returns null for
// non-fetch tools or when no usable URL is present, so callers fall back to the
// generic tool-call rendering.
export function extractWebFetchUrl(input: {
  readonly toolName?: string | null | undefined;
  readonly detail?: string | null | undefined;
}): string | null {
  if (!isWebFetchToolName(input.toolName)) {
    return null;
  }
  const detail = input.detail;
  if (!detail) {
    return null;
  }
  const candidate =
    extractToolArgumentField(detail, ["url", "uri"]) ??
    /https?:\/\/[^\s"'<>)\]}]+/i.exec(detail)?.[0]?.replace(/[.,;:!?]+$/, "");
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  return null;
}

// Turns internal MCP identifiers into readable inline labels for timeline rows.
function humanizeMcpToolIdentifier(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("mcp__")) {
    return null;
  }

  const [, server, tool, ...rest] = trimmed.split("__");
  const normalizedServer = humanizeMcpToken(server);
  const normalizedTool = [tool, ...rest]
    .map((part) => humanizeMcpToken(part))
    .filter((part) => part.length > 0)
    .join(" ");

  if (!normalizedServer || !normalizedTool) {
    return null;
  }
  return `${normalizedServer}: ${normalizedTool}`;
}

function humanizeMcpServerTool(server: string, tool: string): string | null {
  const normalizedServer = humanizeMcpToken(server);
  const normalizedTool = humanizeMcpToken(tool);
  if (!normalizedServer || !normalizedTool) {
    return null;
  }
  return `${normalizedServer}: ${normalizedTool}`;
}

export interface ReadableToolTitleInput {
  readonly title?: string | null;
  readonly fallbackLabel: string;
  readonly itemType?: ToolLifecycleItemType | undefined;
  readonly requestKind?:
    | "command"
    | "file-read"
    | "file-change"
    | "permissions"
    | "tool"
    | undefined;
  readonly command?: string | null;
  readonly payload?: Record<string, unknown> | null;
  readonly isRunning?: boolean;
}

interface ZyronMcpToolSourcePresentation {
  readonly running: string;
  readonly completed: string;
  readonly failed: string;
}

type ZyronMcpToolPresentation = Readonly<Record<ZyronMcpToolStatus, string>>;

// Historical messages still contain retired tools; presentation does not expose them to agents.
const BROWSER_HISTORY_TITLES = {
  ...BROWSER_TOOL_TITLES,
  browser_snapshot: "Snapshot browser page",
  browser_webmcp_tools: "Discover page WebMCP tools",
  browser_webmcp_call: "Call page WebMCP tool",
  browser_click: "Click browser target",
  browser_hover: "Hover browser target",
  browser_drag: "Drag between browser targets",
  browser_type: "Type into browser target",
  browser_select: "Select browser options",
  browser_press: "Press browser keys",
  browser_scroll: "Scroll browser page",
  browser_wait: "Wait for browser condition",
  browser_evaluate: "Evaluate browser expression",
} as const;
type BrowserHistoryToolName = keyof typeof BROWSER_HISTORY_TITLES;
type ZyronBrowserToolName = `zyron_${BrowserHistoryToolName}`;
const BROWSER_HISTORY_TOOL_NAMES = Object.keys(BROWSER_HISTORY_TITLES) as BrowserHistoryToolName[];
const BROWSER_TOOL_NAME_SET = new Set<string>(BROWSER_HISTORY_TOOL_NAMES);

const ZYRON_BROWSER_TOOL_PRESENTATIONS = Object.fromEntries(
  BROWSER_HISTORY_TOOL_NAMES.map((toolName) => {
    const title = BROWSER_HISTORY_TITLES[toolName];
    return [`zyron_${toolName}`, { running: title, completed: title, failed: title }];
  }),
) as Record<ZyronBrowserToolName, ZyronMcpToolSourcePresentation>;

/**
 * The desktop tools, spoken. Every browser tool had a curated presentation and
 * every computer tool had none, so the most consequential rows in the
 * transcript — an agent moving a pointer on the user's own machine — fell
 * through to the invented "Zyron is handling computer click" fallback.
 *
 * The wording deliberately keeps the machine in the sentence ("this computer's
 * desktop") rather than saying "the desktop", because on the backends that
 * matter it is the user's own.
 */
const ZYRON_COMPUTER_TOOL_PRESENTATIONS = {
  zyron_computer_screenshot: presentComputerTool("taking a screenshot", "took a screenshot"),
  zyron_computer_get_state: presentComputerTool("reading the screen", "read the screen"),
  zyron_computer_get_screen_size: presentComputerTool(
    "measuring the screen",
    "measured the screen",
  ),
  zyron_computer_list_windows: presentComputerTool("listing windows", "listed the windows"),
  zyron_computer_list_apps: presentComputerTool("listing apps", "listed the apps"),
  zyron_computer_verify_state: presentComputerTool(
    "checking desktop state",
    "checked desktop state",
  ),
  zyron_computer_zoom: presentComputerTool("zooming into a window", "zoomed into a window"),
  zyron_computer_get_accessibility_tree: presentComputerTool(
    "listing apps and windows",
    "listed apps and windows",
  ),
  zyron_computer_get_cursor_position: presentComputerTool(
    "reading the cursor position",
    "read the cursor position",
  ),
  zyron_computer_help: presentComputerTool(
    "reading the Computer playbook",
    "read the Computer playbook",
  ),
  zyron_computer_click: presentComputerTool("clicking the desktop", "clicked the desktop"),
  zyron_computer_move_cursor: presentComputerTool("moving the cursor", "moved the cursor"),
  zyron_computer_drag: presentComputerTool("dragging on the desktop", "dragged on the desktop"),
  zyron_computer_scroll: presentComputerTool("scrolling the desktop", "scrolled the desktop"),
  zyron_computer_type_text: presentComputerTool("typing on the desktop", "typed on the desktop"),
  zyron_computer_press_key: presentComputerTool("pressing a key", "pressed a key"),
  zyron_computer_set_value: presentComputerTool("setting a field", "set a field"),
  zyron_computer_select_text: presentComputerTool("selecting text", "selected text"),
  zyron_computer_perform_action: presentComputerTool("activating a control", "activated a control"),
  zyron_computer_launch_app: presentComputerTool("opening an app", "opened an app"),
  zyron_computer_activate_window: presentComputerTool("activating a window", "activated a window"),
  zyron_computer_set_window_frame: presentComputerTool(
    "moving or resizing a window",
    "moved or resized a window",
  ),
  zyron_computer_invoke_menu: presentComputerTool("invoking a menu item", "invoked a menu item"),
  zyron_computer_kill_app: presentComputerTool("force-quitting an app", "force-quit an app"),
  zyron_computer_set_window_minimized: presentComputerTool(
    "changing a window's visibility",
    "changed a window's visibility",
  ),
  zyron_computer_set_app_visibility: presentComputerTool(
    "changing an app's visibility",
    "changed an app's visibility",
  ),
  zyron_computer_wait: presentComputerTool("waiting for the desktop", "waited for the desktop"),
  zyron_computer_read_clipboard: presentComputerTool("reading the clipboard", "read the clipboard"),
  zyron_computer_write_clipboard: presentComputerTool(
    "writing to the clipboard",
    "wrote to the clipboard",
  ),
  zyron_computer_paste: presentComputerTool("pasting text", "pasted text"),
  zyron_computer_run: presentComputerTool("running a desktop sequence", "ran a desktop sequence"),
  zyron_computer_inspect: presentComputerTool("inspecting the computer", "inspected the computer"),
  zyron_computer_spaces: presentComputerTool(
    "inspecting desktop Spaces",
    "inspected desktop Spaces",
  ),
  zyron_computer_browser_state: presentComputerTool(
    "reading the browser page",
    "read the browser page",
  ),
  zyron_computer_browser_prepare: presentComputerTool("preparing a browser", "prepared a browser"),
  zyron_computer_browser_navigate: presentComputerTool(
    "opening a browser page",
    "opened a browser page",
  ),
  zyron_computer_browser_click: presentComputerTool(
    "clicking in the browser",
    "clicked in the browser",
  ),
  zyron_computer_browser_type: presentComputerTool(
    "typing in a browser field",
    "typed in a browser field",
  ),
  zyron_computer_browser_dialog: presentComputerTool(
    "handling a browser dialog",
    "handled a browser dialog",
  ),
  zyron_computer_browser_upload: presentComputerTool(
    "attaching files in the browser",
    "attached files in the browser",
  ),
  zyron_computer_browser_download: presentComputerTool("downloading a file", "downloaded a file"),
  zyron_computer_browser_pointer: presentComputerTool(
    "using the pointer in the browser",
    "used the pointer in the browser",
  ),
  zyron_computer_browser_press: presentComputerTool(
    "pressing Enter in the browser",
    "pressed Enter in the browser",
  ),
} as const satisfies Record<`zyron_${ComputerToolName}`, ZyronMcpToolSourcePresentation>;

function presentComputerTool(present: string, past: string): ZyronMcpToolSourcePresentation {
  return {
    running: `Zyron is ${present}`,
    completed: `Zyron ${past}`,
    failed: `Zyron couldn't finish ${present}`,
  };
}

const ZYRON_MCP_TOOL_PRESENTATIONS = {
  zyron_context: {
    running: "Zyron is checking its context",
    completed: "Zyron checked its context",
    failed: "Zyron couldn't check its context",
  },
  zyron_capabilities: {
    running: "Zyron is checking available agents",
    completed: "Zyron checked available agents",
    failed: "Zyron couldn't check available agents",
  },
  zyron_overview: {
    running: "Zyron is gathering an overview",
    completed: "Zyron gathered an overview",
    failed: "Zyron couldn't gather an overview",
  },
  zyron_list_allowed_projects: {
    running: "Zyron is listing allowed projects",
    completed: "Zyron listed allowed projects",
    failed: "Zyron couldn't list allowed projects",
  },
  zyron_create_task: {
    running: "Zyron is creating a task",
    completed: "Zyron created a task",
    failed: "Zyron couldn't create a task",
  },
  zyron_wait_for_task: {
    running: "Zyron is waiting for a task",
    completed: "Zyron finished waiting for a task",
    failed: "Zyron couldn't wait for a task",
  },
  zyron_read_task: {
    running: "Zyron is reading a task",
    completed: "Zyron read a task",
    failed: "Zyron couldn't read a task",
  },
  zyron_list_projects: {
    running: "Zyron is listing projects",
    completed: "Zyron listed projects",
    failed: "Zyron couldn't list projects",
  },
  zyron_list_threads: {
    running: "Zyron is listing threads",
    completed: "Zyron listed threads",
    failed: "Zyron couldn't list threads",
  },
  zyron_read_thread: {
    running: "Zyron is reading a thread",
    completed: "Zyron read a thread",
    failed: "Zyron couldn't read a thread",
  },
  zyron_read_thread_activity: {
    running: "Zyron is reading thread activity",
    completed: "Zyron read thread activity",
    failed: "Zyron couldn't read thread activity",
  },
  zyron_read_thread_events: {
    running: "Zyron is reading thread events",
    completed: "Zyron read thread events",
    failed: "Zyron couldn't read thread events",
  },
  zyron_read_thread_runtime_events: {
    running: "Zyron is reading thread runtime events",
    completed: "Zyron read thread runtime events",
    failed: "Zyron couldn't read thread runtime events",
  },
  zyron_diagnose_thread: {
    running: "Zyron is diagnosing a thread",
    completed: "Zyron diagnosed a thread",
    failed: "Zyron couldn't diagnose a thread",
  },
  zyron_create_thread: {
    running: "Zyron is creating a thread",
    completed: "Zyron created a thread",
    failed: "Zyron couldn't create a thread",
  },
  zyron_create_threads: {
    running: "Zyron is creating threads",
    completed: "Zyron created threads",
    failed: "Zyron couldn't create threads",
  },
  zyron_wait_for_threads: {
    running: "Zyron is waiting for threads",
    completed: "Zyron finished waiting for threads",
    failed: "Zyron couldn't wait for threads",
  },
  zyron_send_message: {
    running: "Zyron is sending a message",
    completed: "Zyron sent a message",
    failed: "Zyron couldn't send a message",
  },
  zyron_read_kanban_board: {
    running: "Zyron is reading the board",
    completed: "Zyron read the board",
    failed: "Zyron couldn't read the board",
  },
  zyron_read_kanban_card: {
    running: "Zyron is reading a board card",
    completed: "Zyron read a board card",
    failed: "Zyron couldn't read a board card",
  },
  zyron_create_kanban_task: {
    running: "Zyron is creating a board task",
    completed: "Zyron created a board task",
    failed: "Zyron couldn't create a board task",
  },
  zyron_move_kanban_card: {
    running: "Zyron is moving a board card",
    completed: "Zyron moved a board card",
    failed: "Zyron couldn't move a board card",
  },
  zyron_show_visual: {
    running: "Zyron is showing a visual",
    completed: "Zyron showed a visual",
    failed: "Zyron couldn't show a visual",
  },
  zyron_create_todo: {
    running: "Zyron is adding a to-do",
    completed: "Zyron added a to-do",
    failed: "Zyron couldn't add a to-do",
  },
  zyron_list_todos: {
    running: "Zyron is reading your to-dos",
    completed: "Zyron read your to-dos",
    failed: "Zyron couldn't read your to-dos",
  },
  zyron_update_todo: {
    running: "Zyron is updating a to-do",
    completed: "Zyron updated a to-do",
    failed: "Zyron couldn't update a to-do",
  },
  zyron_interrupt_thread: {
    running: "Zyron is interrupting a thread",
    completed: "Zyron interrupted a thread",
    failed: "Zyron couldn't interrupt a thread",
  },
  zyron_set_thread_title: {
    running: "Zyron is renaming a thread",
    completed: "Zyron renamed a thread",
    failed: "Zyron couldn't rename a thread",
  },
  zyron_set_thread_archived: {
    running: "Zyron is updating a thread",
    completed: "Zyron updated a thread",
    failed: "Zyron couldn't update a thread",
  },
  zyron_create_automation: {
    running: "Zyron is creating an automation",
    completed: "Zyron created an automation",
    failed: "Zyron couldn't create an automation",
  },
  zyron_list_automations: {
    running: "Zyron is listing automations",
    completed: "Zyron listed automations",
    failed: "Zyron couldn't list automations",
  },
  zyron_view_automation: {
    running: "Zyron is viewing an automation",
    completed: "Zyron viewed an automation",
    failed: "Zyron couldn't view an automation",
  },
  zyron_update_automation: {
    running: "Zyron is updating an automation",
    completed: "Zyron updated an automation",
    failed: "Zyron couldn't update an automation",
  },
  zyron_update_automation_memory: {
    running: "Zyron is updating automation memory",
    completed: "Zyron updated automation memory",
    failed: "Zyron couldn't update automation memory",
  },
  zyron_report_automation_result: {
    running: "Zyron is reporting an automation result",
    completed: "Zyron reported an automation result",
    failed: "Zyron couldn't report an automation result",
  },
  zyron_cancel_automation: {
    running: "Zyron is stopping an automation",
    completed: "Zyron stopped an automation",
    failed: "Zyron couldn't stop an automation",
  },
  ...ZYRON_BROWSER_TOOL_PRESENTATIONS,
  ...ZYRON_COMPUTER_TOOL_PRESENTATIONS,
} as const satisfies Record<string, ZyronMcpToolSourcePresentation>;

// Semantic presentation IDs are separate from the source titles used to classify historical events.
const ZYRON_MCP_TOOL_PRESENTATION_KEYS = {
  zyron_computer_screenshot: {
    running: "common:zyronIsTakingAScreenshot",
    completed: "common:zyronTookAScreenshot",
    failed: "common:zyronCouldnTFinishTakingAScreenshot",
    cancelled: "common:zyronStoppedTakingAScreenshot",
  },
  zyron_computer_get_state: {
    running: "common:zyronIsReadingTheScreen",
    completed: "common:zyronReadTheScreen",
    failed: "common:zyronCouldnTFinishReadingTheScreen",
    cancelled: "common:zyronStoppedReadingTheScreen",
  },
  zyron_computer_get_screen_size: {
    running: "common:zyronIsMeasuringTheScreen",
    completed: "common:zyronMeasuredTheScreen",
    failed: "common:zyronCouldnTFinishMeasuringTheScreen",
    cancelled: "common:zyronStoppedMeasuringTheScreen",
  },
  zyron_computer_list_windows: {
    running: "common:zyronIsListingWindows",
    completed: "common:zyronListedTheWindows",
    failed: "common:zyronCouldnTFinishListingWindows",
    cancelled: "common:zyronStoppedListingWindows",
  },
  zyron_computer_list_apps: {
    running: "common:zyronIsListingApps",
    completed: "common:zyronListedTheApps",
    failed: "common:zyronCouldnTFinishListingApps",
    cancelled: "common:zyronStoppedListingApps",
  },
  zyron_computer_verify_state: {
    running: "common:zyronIsCheckingDesktopState",
    completed: "common:zyronCheckedDesktopState",
    failed: "common:zyronCouldnTFinishCheckingDesktopState",
    cancelled: "common:zyronStoppedCheckingDesktopState",
  },
  zyron_computer_zoom: {
    running: "common:zyronIsZoomingIntoAWindow",
    completed: "common:zyronZoomedIntoAWindow",
    failed: "common:zyronCouldnTFinishZoomingIntoAWindow",
    cancelled: "common:zyronStoppedZoomingIntoAWindow",
  },
  zyron_computer_get_accessibility_tree: {
    running: "common:zyronIsListingAppsAndWindows",
    completed: "common:zyronListedAppsAndWindows",
    failed: "common:zyronCouldnTFinishListingAppsAndWindows",
    cancelled: "common:zyronStoppedListingAppsAndWindows",
  },
  zyron_computer_get_cursor_position: {
    running: "common:zyronIsReadingTheCursorPosition",
    completed: "common:zyronReadTheCursorPosition",
    failed: "common:zyronCouldnTFinishReadingTheCursorPosition",
    cancelled: "common:zyronStoppedReadingTheCursorPosition",
  },
  zyron_computer_help: {
    running: "common:zyronIsReadingTheComputerPlaybook",
    completed: "common:zyronReadTheComputerPlaybook",
    failed: "common:zyronCouldnTFinishReadingTheComputerPlaybook",
    cancelled: "common:zyronStoppedReadingTheComputerPlaybook",
  },
  zyron_computer_click: {
    running: "common:zyronIsClickingTheDesktop",
    completed: "common:zyronClickedTheDesktop",
    failed: "common:zyronCouldnTFinishClickingTheDesktop",
    cancelled: "common:zyronStoppedClickingTheDesktop",
  },
  zyron_computer_move_cursor: {
    running: "common:zyronIsMovingTheCursor",
    completed: "common:zyronMovedTheCursor",
    failed: "common:zyronCouldnTFinishMovingTheCursor",
    cancelled: "common:zyronStoppedMovingTheCursor",
  },
  zyron_computer_drag: {
    running: "common:zyronIsDraggingOnTheDesktop",
    completed: "common:zyronDraggedOnTheDesktop",
    failed: "common:zyronCouldnTFinishDraggingOnTheDesktop",
    cancelled: "common:zyronStoppedDraggingOnTheDesktop",
  },
  zyron_computer_scroll: {
    running: "common:zyronIsScrollingTheDesktop",
    completed: "common:zyronScrolledTheDesktop",
    failed: "common:zyronCouldnTFinishScrollingTheDesktop",
    cancelled: "common:zyronStoppedScrollingTheDesktop",
  },
  zyron_computer_type_text: {
    running: "common:zyronIsTypingOnTheDesktop",
    completed: "common:zyronTypedOnTheDesktop",
    failed: "common:zyronCouldnTFinishTypingOnTheDesktop",
    cancelled: "common:zyronStoppedTypingOnTheDesktop",
  },
  zyron_computer_press_key: {
    running: "common:zyronIsPressingAKey",
    completed: "common:zyronPressedAKey",
    failed: "common:zyronCouldnTFinishPressingAKey",
    cancelled: "common:zyronStoppedPressingAKey",
  },
  zyron_computer_set_value: {
    running: "common:zyronIsSettingAField",
    completed: "common:zyronSetAField",
    failed: "common:zyronCouldnTFinishSettingAField",
    cancelled: "common:zyronStoppedSettingAField",
  },
  zyron_computer_select_text: {
    running: "common:zyronIsSelectingText",
    completed: "common:zyronSelectedText",
    failed: "common:zyronCouldnTFinishSelectingText",
    cancelled: "common:zyronStoppedSelectingText",
  },
  zyron_computer_perform_action: {
    running: "common:zyronIsActivatingAControl",
    completed: "common:zyronActivatedAControl",
    failed: "common:zyronCouldnTFinishActivatingAControl",
    cancelled: "common:zyronStoppedActivatingAControl",
  },
  zyron_computer_launch_app: {
    running: "common:zyronIsOpeningAnApp",
    completed: "common:zyronOpenedAnApp",
    failed: "common:zyronCouldnTFinishOpeningAnApp",
    cancelled: "common:zyronStoppedOpeningAnApp",
  },
  zyron_computer_activate_window: {
    running: "common:zyronIsActivatingAWindow",
    completed: "common:zyronActivatedAWindow",
    failed: "common:zyronCouldnTFinishActivatingAWindow",
    cancelled: "common:zyronStoppedActivatingAWindow",
  },
  zyron_computer_set_window_frame: {
    running: "common:zyronIsMovingOrResizingAWindow",
    completed: "common:zyronMovedOrResizedAWindow",
    failed: "common:zyronCouldnTFinishMovingOrResizingAWindow",
    cancelled: "common:zyronStoppedMovingOrResizingAWindow",
  },
  zyron_computer_invoke_menu: {
    running: "common:zyronIsInvokingAMenuItem",
    completed: "common:zyronInvokedAMenuItem",
    failed: "common:zyronCouldnTFinishInvokingAMenuItem",
    cancelled: "common:zyronStoppedInvokingAMenuItem",
  },
  zyron_computer_kill_app: {
    running: "common:zyronIsForceQuittingAnApp",
    completed: "common:zyronForceQuitAnApp",
    failed: "common:zyronCouldnTFinishForceQuittingAnApp",
    cancelled: "common:zyronStoppedForceQuittingAnApp",
  },
  zyron_computer_set_window_minimized: {
    running: "common:zyronIsChangingAWindowSVisibility",
    completed: "common:zyronChangedAWindowSVisibility",
    failed: "common:zyronCouldnTFinishChangingAWindowSVisibility",
    cancelled: "common:zyronStoppedChangingAWindowSVisibility",
  },
  zyron_computer_set_app_visibility: {
    running: "common:zyronIsChangingAnAppSVisibility",
    completed: "common:zyronChangedAnAppSVisibility",
    failed: "common:zyronCouldnTFinishChangingAnAppSVisibility",
    cancelled: "common:zyronStoppedChangingAnAppSVisibility",
  },
  zyron_computer_wait: {
    running: "common:zyronIsWaitingForTheDesktop",
    completed: "common:zyronWaitedForTheDesktop",
    failed: "common:zyronCouldnTFinishWaitingForTheDesktop",
    cancelled: "common:zyronStoppedWaitingForTheDesktop",
  },
  zyron_computer_read_clipboard: {
    running: "common:zyronIsReadingTheClipboard",
    completed: "common:zyronReadTheClipboard",
    failed: "common:zyronCouldnTFinishReadingTheClipboard",
    cancelled: "common:zyronStoppedReadingTheClipboard",
  },
  zyron_computer_write_clipboard: {
    running: "common:zyronIsWritingToTheClipboard",
    completed: "common:zyronWroteToTheClipboard",
    failed: "common:zyronCouldnTFinishWritingToTheClipboard",
    cancelled: "common:zyronStoppedWritingToTheClipboard",
  },
  zyron_computer_paste: {
    running: "common:zyronIsPastingText",
    completed: "common:zyronPastedText",
    failed: "common:zyronCouldnTFinishPastingText",
    cancelled: "common:zyronStoppedPastingText",
  },
  zyron_computer_run: {
    running: "common:zyronIsRunningADesktopSequence",
    completed: "common:zyronRanADesktopSequence",
    failed: "common:zyronCouldnTFinishRunningADesktopSequence",
    cancelled: "common:zyronStoppedRunningADesktopSequence",
  },
  zyron_computer_inspect: {
    running: "common:zyronIsInspectingTheComputer",
    completed: "common:zyronInspectedTheComputer",
    failed: "common:zyronCouldnTFinishInspectingTheComputer",
    cancelled: "common:zyronStoppedInspectingTheComputer",
  },
  zyron_computer_spaces: {
    running: "common:zyronIsInspectingDesktopSpaces",
    completed: "common:zyronInspectedDesktopSpaces",
    failed: "common:zyronCouldnTFinishInspectingDesktopSpaces",
    cancelled: "common:zyronStoppedInspectingDesktopSpaces",
  },
  zyron_computer_browser_state: {
    running: "common:zyronIsReadingTheBrowserPage",
    completed: "common:zyronReadTheBrowserPage",
    failed: "common:zyronCouldnTFinishReadingTheBrowserPage",
    cancelled: "common:zyronStoppedReadingTheBrowserPage",
  },
  zyron_computer_browser_prepare: {
    running: "common:zyronIsPreparingABrowser",
    completed: "common:zyronPreparedABrowser",
    failed: "common:zyronCouldnTFinishPreparingABrowser",
    cancelled: "common:zyronStoppedPreparingABrowser",
  },
  zyron_computer_browser_navigate: {
    running: "common:zyronIsOpeningABrowserPage",
    completed: "common:zyronOpenedABrowserPage",
    failed: "common:zyronCouldnTFinishOpeningABrowserPage",
    cancelled: "common:zyronStoppedOpeningABrowserPage",
  },
  zyron_computer_browser_click: {
    running: "common:zyronIsClickingInTheBrowser",
    completed: "common:zyronClickedInTheBrowser",
    failed: "common:zyronCouldnTFinishClickingInTheBrowser",
    cancelled: "common:zyronStoppedClickingInTheBrowser",
  },
  zyron_computer_browser_type: {
    running: "common:zyronIsTypingInABrowserField",
    completed: "common:zyronTypedInABrowserField",
    failed: "common:zyronCouldnTFinishTypingInABrowserField",
    cancelled: "common:zyronStoppedTypingInABrowserField",
  },
  zyron_computer_browser_dialog: {
    running: "common:zyronIsHandlingABrowserDialog",
    completed: "common:zyronHandledABrowserDialog",
    failed: "common:zyronCouldnTFinishHandlingABrowserDialog",
    cancelled: "common:zyronStoppedHandlingABrowserDialog",
  },
  zyron_computer_browser_upload: {
    running: "common:zyronIsAttachingFilesInTheBrowser",
    completed: "common:zyronAttachedFilesInTheBrowser",
    failed: "common:zyronCouldnTFinishAttachingFilesInTheBrowser",
    cancelled: "common:zyronStoppedAttachingFilesInTheBrowser",
  },
  zyron_computer_browser_download: {
    running: "common:zyronIsDownloadingAFile",
    completed: "common:zyronDownloadedAFile",
    failed: "common:zyronCouldnTFinishDownloadingAFile",
    cancelled: "common:zyronStoppedDownloadingAFile",
  },
  zyron_computer_browser_pointer: {
    running: "common:zyronIsUsingThePointerInTheBrowser",
    completed: "common:zyronUsedThePointerInTheBrowser",
    failed: "common:zyronCouldnTFinishUsingThePointerInThe",
    cancelled: "common:zyronStoppedUsingThePointerInTheBrowser",
  },
  zyron_computer_browser_press: {
    running: "common:zyronIsPressingEnterInTheBrowser",
    completed: "common:zyronPressedEnterInTheBrowser",
    failed: "common:zyronCouldnTFinishPressingEnterInTheBrowser",
    cancelled: "common:zyronStoppedPressingEnterInTheBrowser",
  },
  zyron_context: {
    running: "chat:zyronIsCheckingItsContext",
    completed: "chat:zyronCheckedItsContext",
    failed: "chat:zyronCouldnTCheckItsContext",
    cancelled: "common:zyronStoppedCheckingItsContext",
  },
  zyron_capabilities: {
    running: "chat:zyronIsCheckingAvailableAgents",
    completed: "chat:zyronCheckedAvailableAgents",
    failed: "chat:zyronCouldnTCheckAvailableAgents",
    cancelled: "common:zyronStoppedCheckingAvailableAgents",
  },
  zyron_overview: {
    running: "chat:zyronIsGatheringAnOverview",
    completed: "chat:zyronGatheredAnOverview",
    failed: "chat:zyronCouldnTGatherAnOverview",
    cancelled: "common:zyronStoppedGatheringAnOverview",
  },
  zyron_list_allowed_projects: {
    running: "chat:zyronIsListingAllowedProjects",
    completed: "chat:zyronListedAllowedProjects",
    failed: "chat:zyronCouldnTListAllowedProjects",
    cancelled: "common:zyronStoppedListingAllowedProjects",
  },
  zyron_create_task: {
    running: "chat:zyronIsCreatingATask",
    completed: "chat:zyronCreatedATask",
    failed: "chat:zyronCouldnTCreateATask",
    cancelled: "common:zyronStoppedCreatingATask",
  },
  zyron_wait_for_task: {
    running: "chat:zyronIsWaitingForATask",
    completed: "chat:zyronFinishedWaitingForATask",
    failed: "chat:zyronCouldnTWaitForATask",
    cancelled: "common:zyronStoppedWaitingForATask",
  },
  zyron_read_task: {
    running: "chat:zyronIsReadingATask",
    completed: "chat:zyronReadATask",
    failed: "chat:zyronCouldnTReadATask",
    cancelled: "common:zyronStoppedReadingATask",
  },
  zyron_list_projects: {
    running: "chat:zyronIsListingProjects",
    completed: "chat:zyronListedProjects",
    failed: "chat:zyronCouldnTListProjects",
    cancelled: "common:zyronStoppedListingProjects",
  },
  zyron_list_threads: {
    running: "chat:zyronIsListingThreads",
    completed: "chat:zyronListedThreads",
    failed: "chat:zyronCouldnTListThreads",
    cancelled: "common:zyronStoppedListingThreads",
  },
  zyron_read_thread: {
    running: "chat:zyronIsReadingAThread",
    completed: "chat:zyronReadAThread",
    failed: "chat:zyronCouldnTReadAThread",
    cancelled: "common:zyronStoppedReadingAThread",
  },
  zyron_read_thread_activity: {
    running: "chat:zyronIsReadingThreadActivity",
    completed: "chat:zyronReadThreadActivity",
    failed: "chat:zyronCouldnTReadThreadActivity",
    cancelled: "common:zyronStoppedReadingThreadActivity",
  },
  zyron_read_thread_events: {
    running: "chat:zyronIsReadingThreadEvents",
    completed: "chat:zyronReadThreadEvents",
    failed: "chat:zyronCouldnTReadThreadEvents",
    cancelled: "common:zyronStoppedReadingThreadEvents",
  },
  zyron_read_thread_runtime_events: {
    running: "chat:zyronIsReadingThreadRuntimeEvents",
    completed: "chat:zyronReadThreadRuntimeEvents",
    failed: "chat:zyronCouldnTReadThreadRuntimeEvents",
    cancelled: "common:zyronStoppedReadingThreadRuntimeEvents",
  },
  zyron_diagnose_thread: {
    running: "chat:zyronIsDiagnosingAThread",
    completed: "chat:zyronDiagnosedAThread",
    failed: "chat:zyronCouldnTDiagnoseAThread",
    cancelled: "common:zyronStoppedDiagnosingAThread",
  },
  zyron_create_thread: {
    running: "chat:zyronIsCreatingAThread",
    completed: "chat:zyronCreatedAThread",
    failed: "chat:zyronCouldnTCreateAThread",
    cancelled: "common:zyronStoppedCreatingAThread",
  },
  zyron_create_threads: {
    running: "chat:zyronIsCreatingThreads",
    completed: "chat:zyronCreatedThreads",
    failed: "chat:zyronCouldnTCreateThreads",
    cancelled: "common:zyronStoppedCreatingThreads",
  },
  zyron_wait_for_threads: {
    running: "chat:zyronIsWaitingForThreads",
    completed: "chat:zyronFinishedWaitingForThreads",
    failed: "chat:zyronCouldnTWaitForThreads",
    cancelled: "common:zyronStoppedWaitingForThreads",
  },
  zyron_send_message: {
    running: "chat:zyronIsSendingAMessage",
    completed: "chat:zyronSentAMessage",
    failed: "chat:zyronCouldnTSendAMessage",
    cancelled: "common:zyronStoppedSendingAMessage",
  },
  zyron_read_kanban_board: {
    running: "chat:zyronIsReadingTheBoard",
    completed: "chat:zyronReadTheBoard",
    failed: "chat:zyronCouldnTReadTheBoard",
    cancelled: "common:zyronStoppedReadingTheBoard",
  },
  zyron_read_kanban_card: {
    running: "chat:zyronIsReadingABoardCard",
    completed: "chat:zyronReadABoardCard",
    failed: "chat:zyronCouldnTReadABoardCard",
    cancelled: "common:zyronStoppedReadingABoardCard",
  },
  zyron_create_kanban_task: {
    running: "chat:zyronIsCreatingABoardTask",
    completed: "chat:zyronCreatedABoardTask",
    failed: "chat:zyronCouldnTCreateABoardTask",
    cancelled: "common:zyronStoppedCreatingABoardTask",
  },
  zyron_move_kanban_card: {
    running: "chat:zyronIsMovingABoardCard",
    completed: "chat:zyronMovedABoardCard",
    failed: "chat:zyronCouldnTMoveABoardCard",
    cancelled: "common:zyronStoppedMovingABoardCard",
  },
  zyron_show_visual: {
    running: "chat:zyronIsShowingAVisual",
    completed: "chat:zyronShowedAVisual",
    failed: "chat:zyronCouldnTShowAVisual",
    cancelled: "common:zyronStoppedShowingAVisual",
  },
  zyron_create_todo: {
    running: "chat:zyronIsAddingAToDo",
    completed: "chat:zyronAddedAToDo",
    failed: "chat:zyronCouldnTAddAToDo",
    cancelled: "common:zyronStoppedAddingAToDo",
  },
  zyron_list_todos: {
    running: "chat:zyronIsReadingYourToDos",
    completed: "chat:zyronReadYourToDos",
    failed: "chat:zyronCouldnTReadYourToDos",
    cancelled: "common:zyronStoppedReadingYourToDos",
  },
  zyron_update_todo: {
    running: "chat:zyronIsUpdatingAToDo",
    completed: "chat:zyronUpdatedAToDo",
    failed: "chat:zyronCouldnTUpdateAToDo",
    cancelled: "common:zyronStoppedUpdatingAToDo",
  },
  zyron_interrupt_thread: {
    running: "chat:zyronIsInterruptingAThread",
    completed: "chat:zyronInterruptedAThread",
    failed: "chat:zyronCouldnTInterruptAThread",
    cancelled: "common:zyronStoppedInterruptingAThread",
  },
  zyron_set_thread_title: {
    running: "chat:zyronIsRenamingAThread",
    completed: "chat:zyronRenamedAThread",
    failed: "chat:zyronCouldnTRenameAThread",
    cancelled: "common:zyronStoppedRenamingAThread",
  },
  zyron_set_thread_archived: {
    running: "chat:zyronIsUpdatingAThread",
    completed: "chat:zyronUpdatedAThread",
    failed: "chat:zyronCouldnTUpdateAThread",
    cancelled: "common:zyronStoppedUpdatingAThread",
  },
  zyron_create_automation: {
    running: "chat:zyronIsCreatingAnAutomation",
    completed: "chat:zyronCreatedAnAutomation",
    failed: "chat:zyronCouldnTCreateAnAutomation",
    cancelled: "common:zyronStoppedCreatingAnAutomation",
  },
  zyron_list_automations: {
    running: "chat:zyronIsListingAutomations",
    completed: "chat:zyronListedAutomations",
    failed: "chat:zyronCouldnTListAutomations",
    cancelled: "common:zyronStoppedListingAutomations",
  },
  zyron_view_automation: {
    running: "chat:zyronIsViewingAnAutomation",
    completed: "chat:zyronViewedAnAutomation",
    failed: "chat:zyronCouldnTViewAnAutomation",
    cancelled: "common:zyronStoppedViewingAnAutomation",
  },
  zyron_update_automation: {
    running: "chat:zyronIsUpdatingAnAutomation",
    completed: "chat:zyronUpdatedAnAutomation",
    failed: "chat:zyronCouldnTUpdateAnAutomation",
    cancelled: "common:zyronStoppedUpdatingAnAutomation",
  },
  zyron_update_automation_memory: {
    running: "chat:zyronIsUpdatingAutomationMemory",
    completed: "chat:zyronUpdatedAutomationMemory",
    failed: "chat:zyronCouldnTUpdateAutomationMemory",
    cancelled: "common:zyronStoppedUpdatingAutomationMemory",
  },
  zyron_report_automation_result: {
    running: "chat:zyronIsReportingAnAutomationResult",
    completed: "chat:zyronReportedAnAutomationResult",
    failed: "chat:zyronCouldnTReportAnAutomationResult",
    cancelled: "common:zyronStoppedReportingAnAutomationResult",
  },
  zyron_cancel_automation: {
    running: "chat:zyronIsStoppingAnAutomation",
    completed: "chat:zyronStoppedAnAutomation",
    failed: "chat:zyronCouldnTStopAnAutomation",
    cancelled: "common:zyronStoppedStoppingAnAutomation",
  },
  zyron_browser_status: {
    running: "common:checkBrowserStatus",
    completed: "common:checkBrowserStatus",
    failed: "common:checkBrowserStatus",
    cancelled: "common:cancelledCheckBrowserStatus",
  },
  zyron_browser_tabs: {
    running: "common:listBrowserTabs",
    completed: "common:listBrowserTabs",
    failed: "common:listBrowserTabs",
    cancelled: "common:cancelledListBrowserTabs",
  },
  zyron_browser_open: {
    running: "common:openBrowserTab",
    completed: "common:openBrowserTab",
    failed: "common:openBrowserTab",
    cancelled: "common:cancelledOpenBrowserTab",
  },
  zyron_browser_navigate: {
    running: "common:navigateBrowserTab",
    completed: "common:navigateBrowserTab",
    failed: "common:navigateBrowserTab",
    cancelled: "common:cancelledNavigateBrowserTab",
  },
  zyron_browser_back: {
    running: "common:goBackInBrowserHistory",
    completed: "common:goBackInBrowserHistory",
    failed: "common:goBackInBrowserHistory",
    cancelled: "common:cancelledGoBackInBrowserHistory",
  },
  zyron_browser_forward: {
    running: "common:goForwardInBrowserHistory",
    completed: "common:goForwardInBrowserHistory",
    failed: "common:goForwardInBrowserHistory",
    cancelled: "common:cancelledGoForwardInBrowserHistory",
  },
  zyron_browser_reload: {
    running: "common:reloadBrowserPage",
    completed: "common:reloadBrowserPage",
    failed: "common:reloadBrowserPage",
    cancelled: "common:cancelledReloadBrowserPage",
  },
  zyron_browser_resize: {
    running: "common:resizeBrowserViewport",
    completed: "common:resizeBrowserViewport",
    failed: "common:resizeBrowserViewport",
    cancelled: "common:cancelledResizeBrowserViewport",
  },
  zyron_browser_screenshot: {
    running: "common:captureBrowserScreenshot",
    completed: "common:captureBrowserScreenshot",
    failed: "common:captureBrowserScreenshot",
    cancelled: "common:cancelledCaptureBrowserScreenshot",
  },
  zyron_browser_logs: {
    running: "common:readBrowserDiagnostics",
    completed: "common:readBrowserDiagnostics",
    failed: "common:readBrowserDiagnostics",
    cancelled: "common:cancelledReadBrowserDiagnostics",
  },
  zyron_browser_upload: {
    running: "common:uploadWorkspaceFiles",
    completed: "common:uploadWorkspaceFiles",
    failed: "common:uploadWorkspaceFiles",
    cancelled: "common:cancelledUploadWorkspaceFiles",
  },
  zyron_browser_run: {
    running: "common:runBrowserActions",
    completed: "common:runBrowserActions",
    failed: "common:runBrowserActions",
    cancelled: "common:cancelledRunBrowserActions",
  },
  zyron_browser_close: {
    running: "common:closeBrowserTab",
    completed: "common:closeBrowserTab",
    failed: "common:closeBrowserTab",
    cancelled: "common:cancelledCloseBrowserTab",
  },
  zyron_browser_snapshot: {
    running: "chat:snapshotBrowserPage",
    completed: "chat:snapshotBrowserPage",
    failed: "chat:snapshotBrowserPage",
    cancelled: "common:cancelledSnapshotBrowserPage",
  },
  zyron_browser_webmcp_tools: {
    running: "chat:discoverPageWebMCPTools",
    completed: "chat:discoverPageWebMCPTools",
    failed: "chat:discoverPageWebMCPTools",
    cancelled: "common:cancelledDiscoverPageWebMCPTools",
  },
  zyron_browser_webmcp_call: {
    running: "chat:callPageWebMCPTool",
    completed: "chat:callPageWebMCPTool",
    failed: "chat:callPageWebMCPTool",
    cancelled: "common:cancelledCallPageWebMCPTool",
  },
  zyron_browser_click: {
    running: "chat:clickBrowserTarget",
    completed: "chat:clickBrowserTarget",
    failed: "chat:clickBrowserTarget",
    cancelled: "common:cancelledClickBrowserTarget",
  },
  zyron_browser_hover: {
    running: "chat:hoverBrowserTarget",
    completed: "chat:hoverBrowserTarget",
    failed: "chat:hoverBrowserTarget",
    cancelled: "common:cancelledHoverBrowserTarget",
  },
  zyron_browser_drag: {
    running: "chat:dragBetweenBrowserTargets",
    completed: "chat:dragBetweenBrowserTargets",
    failed: "chat:dragBetweenBrowserTargets",
    cancelled: "common:cancelledDragBetweenBrowserTargets",
  },
  zyron_browser_type: {
    running: "chat:typeIntoBrowserTarget",
    completed: "chat:typeIntoBrowserTarget",
    failed: "chat:typeIntoBrowserTarget",
    cancelled: "common:cancelledTypeIntoBrowserTarget",
  },
  zyron_browser_select: {
    running: "chat:selectBrowserOptions",
    completed: "chat:selectBrowserOptions",
    failed: "chat:selectBrowserOptions",
    cancelled: "common:cancelledSelectBrowserOptions",
  },
  zyron_browser_press: {
    running: "chat:pressBrowserKeys",
    completed: "chat:pressBrowserKeys",
    failed: "chat:pressBrowserKeys",
    cancelled: "common:cancelledPressBrowserKeys",
  },
  zyron_browser_scroll: {
    running: "chat:scrollBrowserPage",
    completed: "chat:scrollBrowserPage",
    failed: "chat:scrollBrowserPage",
    cancelled: "common:cancelledScrollBrowserPage",
  },
  zyron_browser_wait: {
    running: "chat:waitForBrowserCondition",
    completed: "chat:waitForBrowserCondition",
    failed: "chat:waitForBrowserCondition",
    cancelled: "common:cancelledWaitForBrowserCondition",
  },
  zyron_browser_evaluate: {
    running: "chat:evaluateBrowserExpression",
    completed: "chat:evaluateBrowserExpression",
    failed: "chat:evaluateBrowserExpression",
    cancelled: "common:cancelledEvaluateBrowserExpression",
  },
} as const satisfies Record<
  keyof typeof ZYRON_MCP_TOOL_PRESENTATIONS,
  Record<ZyronMcpToolStatus, string>
>;

function normalizeZyronMcpIdentifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const ZYRON_BROWSER_TOOL_NAME_BY_PRESENTATION = new Map<string, ZyronBrowserToolName>(
  BROWSER_HISTORY_TOOL_NAMES.map((toolName) => [
    normalizeZyronMcpIdentifier(BROWSER_HISTORY_TITLES[toolName]),
    `zyron_${toolName}`,
  ]),
);

const ZYRON_MCP_TOOL_PRESENTATION_ENTRIES = Object.entries(ZYRON_MCP_TOOL_PRESENTATIONS).map(
  ([toolName, presentation]) => ({
    toolName,
    presentation,
    normalizedRunning: normalizeZyronMcpIdentifier(presentation.running),
    normalizedCompleted: normalizeZyronMcpIdentifier(presentation.completed),
    normalizedFailed: normalizeZyronMcpIdentifier(presentation.failed),
  }),
);

function extractZyronMcpToolName(normalizedCandidate: string): string | null {
  if (BROWSER_TOOL_NAME_SET.has(normalizedCandidate)) {
    return `zyron_${normalizedCandidate}`;
  }
  if (normalizedCandidate.startsWith("mcp_zyron_zyron_")) {
    return normalizedCandidate.slice("mcp_zyron_".length);
  }
  if (normalizedCandidate.startsWith("mcp_zyron_")) {
    return `zyron_${normalizedCandidate.slice("mcp_zyron_".length)}`;
  }
  if (normalizedCandidate.startsWith("zyron_zyron_")) {
    return normalizedCandidate.slice("zyron_".length);
  }
  if (normalizedCandidate.startsWith("zyron_")) {
    return normalizedCandidate;
  }
  return null;
}

function resolveZyronBrowserToolName(
  candidates: ReadonlyArray<string | null | undefined>,
): ZyronBrowserToolName | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalizedCandidate = normalizeZyronMcpIdentifier(candidate);
    const extractedToolName = extractZyronMcpToolName(normalizedCandidate);
    const candidateToolName =
      extractedToolName ??
      ZYRON_BROWSER_TOOL_NAME_BY_PRESENTATION.get(normalizedCandidate) ??
      normalizedCandidate;
    if (candidateToolName in ZYRON_BROWSER_TOOL_PRESENTATIONS) {
      return candidateToolName as ZyronBrowserToolName;
    }
  }
  return null;
}

function fallbackZyronMcpToolPresentation(
  toolName: string,
  translate: typeof t,
): ZyronMcpToolPresentation {
  const action =
    toolName
      .replace(/^zyron_/, "")
      .replace(/_+/g, " ")
      .trim() || translate("chat:anAction");
  return {
    running: translate("chat:zyronIsHandling", { action }),
    completed: translate("chat:zyronHandled", { action }),
    failed: translate("chat:zyronCouldnTHandle", { action }),
    cancelled: translate("chat:zyronStoppedHandling", { action }),
  };
}

function localizeZyronMcpToolPresentation(
  toolName: keyof typeof ZYRON_MCP_TOOL_PRESENTATIONS,
  translate: typeof t,
): ZyronMcpToolPresentation {
  const keys = ZYRON_MCP_TOOL_PRESENTATION_KEYS[toolName];
  return {
    running: translate(keys.running),
    completed: translate(keys.completed),
    failed: translate(keys.failed),
    cancelled: translate(keys.cancelled),
  };
}

function resolveZyronMcpToolPresentation(
  candidates: ReadonlyArray<string | null | undefined>,
  translate: typeof t,
): ZyronMcpToolPresentation | null {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const normalizedCandidate = normalizeZyronMcpIdentifier(candidate);
    for (const entry of ZYRON_MCP_TOOL_PRESENTATION_ENTRIES) {
      if (
        normalizedCandidate === entry.normalizedRunning ||
        normalizedCandidate === entry.normalizedCompleted ||
        normalizedCandidate === entry.normalizedFailed
      ) {
        return localizeZyronMcpToolPresentation(
          entry.toolName as keyof typeof ZYRON_MCP_TOOL_PRESENTATIONS,
          translate,
        );
      }
    }
    const toolName = extractZyronMcpToolName(normalizedCandidate);
    const knownPresentation = toolName
      ? (ZYRON_MCP_TOOL_PRESENTATIONS[toolName as keyof typeof ZYRON_MCP_TOOL_PRESENTATIONS] as
          | ZyronMcpToolSourcePresentation
          | undefined)
      : undefined;
    if (knownPresentation) {
      return localizeZyronMcpToolPresentation(
        toolName as keyof typeof ZYRON_MCP_TOOL_PRESENTATIONS,
        translate,
      );
    }
    // Free-text summaries (e.g. reconciler activity lines) can begin with the
    // word "Zyron" and normalize into a fake tool identifier; only
    // identifier-shaped candidates may take an invented fallback presentation.
    if (/\s/.test(candidate.trim())) {
      continue;
    }
    if (normalizedCandidate.startsWith("zyron_is_handling_")) {
      return fallbackZyronMcpToolPresentation(
        `zyron_${normalizedCandidate.slice("zyron_is_handling_".length)}`,
        translate,
      );
    }
    if (normalizedCandidate.startsWith("zyron_handled_")) {
      return fallbackZyronMcpToolPresentation(
        `zyron_${normalizedCandidate.slice("zyron_handled_".length)}`,
        translate,
      );
    }
    if (normalizedCandidate.startsWith("zyron_couldn_t_handle_")) {
      return fallbackZyronMcpToolPresentation(
        `zyron_${normalizedCandidate.slice("zyron_couldn_t_handle_".length)}`,
        translate,
      );
    }
    if (!toolName) {
      continue;
    }
    return fallbackZyronMcpToolPresentation(toolName, translate);
  }
  return null;
}

export type ZyronMcpToolStatus = "running" | "completed" | "failed" | "cancelled";

export interface ZyronMcpToolTitleInput {
  readonly toolName?: string | null | undefined;
  readonly title?: string | null | undefined;
  readonly fallbackLabel?: string | null | undefined;
  readonly status?: ZyronMcpToolStatus | undefined;
}

export function isZyronBrowserToolCall(input: ZyronMcpToolTitleInput): boolean {
  return resolveZyronBrowserToolName([input.toolName, input.title, input.fallbackLabel]) !== null;
}

// Every provider exposes Zyron's MCP tools differently: MCP, dynamic, and even
// file-change rows can all represent the same gateway action. Normalize by tool
// identity instead of provider item type so transport details never reach the UI.
export function deriveZyronMcpToolTitle(
  input: ZyronMcpToolTitleInput,
  translate: typeof t = t,
): string | null {
  const presentation = resolveZyronMcpToolPresentation(
    [input.toolName, input.title, input.fallbackLabel],
    translate,
  );
  if (!presentation) {
    return null;
  }
  return presentation[input.status ?? "completed"];
}

export function sanitizeZyronMcpToolPreview(
  input: {
    readonly preview?: string | null | undefined;
    readonly heading: string;
    readonly status?: ZyronMcpToolStatus | undefined;
  },
  translate: typeof t = t,
): string | null {
  const preview = input.preview?.trim();
  if (!preview) return null;
  const previewTitle = deriveZyronMcpToolTitle({ title: preview, status: input.status }, translate);
  if (
    previewTitle &&
    normalizeToolTextForComparison(previewTitle) === normalizeToolTextForComparison(input.heading)
  ) {
    return null;
  }
  return preview;
}

export function deriveReadableToolTitle(
  input: ReadableToolTitleInput,
  translate: typeof t = t,
): string | null {
  const normalizedTitle = normalizeCompactToolLabel(input.title ?? "");
  const normalizedFallback = normalizeCompactToolLabel(input.fallbackLabel);
  const commandLabel = input.command
    ? deriveReadableCommandDisplay(input.command, input.isRunning, translate).verb
    : null;
  const commandLike = input.itemType === "command_execution" || input.requestKind === "command";

  // Derive a verbal label from requestKind when the title is generic
  const requestKindLabel = humanizeRequestKind(input.requestKind, input.itemType, translate);

  if (normalizedTitle.length > 0 && !isGenericToolTitle(normalizedTitle)) {
    return (input.itemType === "mcp_tool_call" || input.itemType === "dynamic_tool_call") &&
      /[_-]/.test(normalizedTitle)
      ? (normalizeToolDescriptor(normalizedTitle, translate) ?? normalizedTitle)
      : normalizedTitle;
  }

  if (commandLike && commandLabel) {
    return commandLabel;
  }

  const descriptor = normalizeToolDescriptor(
    extractToolDescriptorFromPayload(input.payload),
    translate,
  );
  if (descriptor && !isGenericToolTitle(descriptor)) {
    return descriptor;
  }

  // A generic request kind describes the transport, while the payload can name
  // the actual tool. Only use it after the provider metadata has been checked.
  if (requestKindLabel) {
    return requestKindLabel;
  }

  if (normalizedFallback.length > 0 && !isGenericToolTitle(normalizedFallback)) {
    return normalizedFallback;
  }
  if (normalizedTitle.length > 0) {
    return normalizedTitle;
  }
  if (normalizedFallback.length > 0) {
    return normalizedFallback;
  }
  return null;
}

export interface ReadableCommandDisplay {
  readonly verb: string;
  readonly target: string;
  readonly fullCommand: string;
}

// "read" and "search" split the read-only inspections so a file read and a
// pattern search wear different glyphs; listings (`ls`) are plain commands.
export type CommandVisualKind = "read" | "search" | "git" | "github" | "terminal";

function humanizeRequestKind(
  requestKind: ReadableToolTitleInput["requestKind"],
  itemType: ReadableToolTitleInput["itemType"],
  translate: typeof t,
): string | null {
  if (requestKind === "file-read") return translate("chat:detail_read", { context: "command" });
  if (requestKind === "file-change" || itemType === "file_change")
    return translate("chat:timeline_edited");
  if (requestKind === "tool") return translate("chat:tool");
  // Don't handle command types here — let humanizeCommandToolLabel produce more specific labels
  if (itemType === "web_search") return translate("chat:searchedTheWeb");
  if (itemType === "image_generation") return translate("chat:generatedImage_generatedImage");
  if (itemType === "image_view") return translate("chat:viewedImage");
  if (itemType === "collab_agent_tool_call") return translate("chat:agentTask");
  return null;
}

export function isGenericToolTitle(value: string): boolean {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (
    normalized === "tool" ||
    normalized === "tool call" ||
    normalized === "dynamic tool call" ||
    normalized === "mcp tool call" ||
    normalized === "agent task" ||
    normalized === "subagent task" ||
    normalized === "task" ||
    normalized === "command run" ||
    normalized === "ran command" ||
    normalized === "running command" ||
    normalized === "command execution" ||
    normalized === "file change" ||
    normalized === "find" ||
    normalized === "read file"
  );
}

function normalizeToolDescriptor(value: string | null, translate: typeof t): string | null {
  if (!value) {
    return null;
  }
  const computerTool = computerToolName(value);
  if (computerTool) {
    return translate(COMPUTER_TOOL_TITLE_KEYS[computerTool], { context: "computerTool" });
  }
  const mcpIdentifier = humanizeMcpToolIdentifier(value);
  if (mcpIdentifier) {
    return mcpIdentifier;
  }
  const normalized = value.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return null;
  }
  const dedupedTokens: string[] = [];
  for (const token of normalized.split(" ")) {
    if (dedupedTokens.at(-1)?.toLowerCase() === token.toLowerCase()) {
      continue;
    }
    dedupedTokens.push(token);
  }
  const collapsed = dedupedTokens.join(" ").trim();
  if (!collapsed) {
    return null;
  }
  const lowerCollapsed = collapsed.toLowerCase();
  if (lowerCollapsed === "read") {
    return translate("chat:detail_read", { context: "command" });
  }
  if (lowerCollapsed === "search" || lowerCollapsed === "find" || lowerCollapsed === "searched") {
    return translate("workspace:primaryActions_search");
  }
  const readable = /[_-]/.test(value) ? humanizeMcpToken(collapsed) : collapsed;
  return readable.length > 64 ? `${readable.slice(0, 61).trimEnd()}...` : readable;
}

function humanizeMcpToken(value: string | undefined): string {
  if (!value) {
    return "";
  }
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .split(" ")
    .map((token) => {
      const lower = token.toLowerCase();
      if (lower === "mcp") return "MCP";
      if (token.toUpperCase() === token && token.length <= 5) return token;
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
}

function extractToolDescriptorFromPayload(
  payload: Record<string, unknown> | null | undefined,
): string | null {
  if (!payload) {
    return null;
  }
  const mcpServerTool = extractMcpServerToolDescriptor(payload, 0);
  if (mcpServerTool) {
    return mcpServerTool;
  }
  const descriptorKeys = ["kind", "name", "tool", "tool_name", "toolName", "title"];
  const candidates: string[] = [];
  collectDescriptorCandidates(payload, descriptorKeys, candidates, 0);
  for (const candidate of candidates) {
    const normalized = candidate.trim();
    if (!normalized) {
      continue;
    }
    if (isGenericToolTitle(normalizeCompactToolLabel(normalized))) {
      continue;
    }
    return normalized;
  }
  return null;
}

function extractMcpServerToolDescriptor(value: unknown, depth: number): string | null {
  const pair = findMcpServerToolPair(value, depth);
  return pair ? humanizeMcpServerTool(pair.server, pair.tool) : null;
}

// Codex reports MCP calls as `{ server, tool }` somewhere inside the payload.
function findMcpServerToolPair(
  value: unknown,
  depth: number,
): { readonly server: string; readonly tool: string } | null {
  if (depth > 4 || !value || typeof value !== "object") {
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = findMcpServerToolPair(entry, depth + 1);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.server === "string" && typeof record.tool === "string") {
    return { server: record.server, tool: record.tool };
  }
  for (const nestedKey of [
    "item",
    "data",
    "event",
    "payload",
    "result",
    "input",
    "call",
    "invocation",
    "source",
  ]) {
    const nested = findMcpServerToolPair(record[nestedKey], depth + 1);
    if (nested) {
      return nested;
    }
  }
  return null;
}

/**
 * The MCP server behind a tool call: Claude names tools `mcp__<server>__<tool>`,
 * Codex reports a `{ server, tool }` pair in the payload. Null for other tools.
 */
export function extractMcpServerName(
  toolName: string | null | undefined,
  payload: unknown,
): string | null {
  const trimmed = toolName?.trim() ?? "";
  if (trimmed.startsWith("mcp__")) {
    const server = trimmed.split("__")[1]?.trim();
    if (server) return server;
  }
  const server = findMcpServerToolPair(payload, 0)?.server.trim();
  return server ? server : null;
}

function collectDescriptorCandidates(
  value: unknown,
  keys: ReadonlyArray<string>,
  target: string[],
  depth: number,
) {
  if (depth > 4 || target.length >= 24) {
    return;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      target.push(trimmed);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectDescriptorCandidates(entry, keys, target, depth + 1);
      if (target.length >= 24) {
        return;
      }
    }
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string") {
      const trimmed = (record[key] as string).trim();
      if (trimmed) {
        target.push(trimmed);
      }
    }
  }
  for (const nestedKey of ["item", "data", "event", "payload", "result", "input", "tool", "call"]) {
    if (nestedKey in record) {
      collectDescriptorCandidates(record[nestedKey], keys, target, depth + 1);
      if (target.length >= 24) {
        return;
      }
    }
  }
}

// Read-only inspection commands: file reads wear the file glyph, searches and
// finds the magnifier; listings and everything else keep the terminal icon.
// These sets are the single source of truth for both the command labels below
// and the icon decision.
const READ_FILE_COMMAND_TOOLS = new Set(["cat", "nl", "head", "tail", "sed", "less", "more"]);
const SEARCH_COMMAND_TOOLS = new Set(["rg", "grep", "ag", "ack"]);
const FIND_COMMAND_TOOLS = new Set(["find", "fd"]);
const LIST_COMMAND_TOOLS = new Set(["ls"]);

// Derives the compact command sentence shown inline while preserving the full command for hover/detail UI.
export function deriveReadableCommandDisplay(
  rawCommand: string,
  isRunning = false,
  translate: typeof t = t,
): ReadableCommandDisplay {
  const command = stripCommandDisplayWrappers(unwrapShellCommandIfPresent(rawCommand));
  const primaryCommand = firstShellCommandSegment(command);
  const [tool, args] = splitToolAndArgs(primaryCommand);

  if (READ_FILE_COMMAND_TOOLS.has(tool)) {
    return {
      verb: translate(isRunning ? "chat:reading" : "chat:detail_read", { context: "command" }),
      target: lastPathComponents(args, translate("common:file"), translate),
      fullCommand: rawCommand,
    };
  }
  if (SEARCH_COMMAND_TOOLS.has(tool)) {
    return {
      verb: translate(isRunning ? "chat:searching" : "chat:searched", { context: "command" }),
      target: searchSummary(args, translate),
      fullCommand: rawCommand,
    };
  }
  if (LIST_COMMAND_TOOLS.has(tool)) {
    return {
      verb: translate(isRunning ? "chat:listing" : "chat:listed", { context: "command" }),
      target: lastPathComponents(args, translate("workspace:directory"), translate),
      fullCommand: rawCommand,
    };
  }
  if (FIND_COMMAND_TOOLS.has(tool)) {
    return {
      verb: translate(isRunning ? "chat:finding" : "chat:found", { context: "command" }),
      target: findTarget(args, translate("chat:files"), translate),
      fullCommand: rawCommand,
    };
  }

  switch (tool) {
    case "mkdir":
      return {
        verb: translate(isRunning ? "chat:creating" : "settings:created", { context: "command" }),
        target: lastPathComponents(args, translate("workspace:directory"), translate),
        fullCommand: rawCommand,
      };
    case "rm":
      return {
        verb: translate(isRunning ? "chat:removing" : "chat:removed", { context: "command" }),
        target: lastPathComponents(args, translate("common:file"), translate),
        fullCommand: rawCommand,
      };
    case "cp":
    case "mv":
      return {
        verb: translate(
          isRunning
            ? tool === "cp"
              ? "chat:copying"
              : "chat:moving"
            : tool === "cp"
              ? "chat:theme_copied"
              : "chat:moved",
          { context: "command" },
        ),
        target: lastPathComponents(args, translate("common:file"), translate),
        fullCommand: rawCommand,
      };
    case "git":
      return humanizeGitCommand(args, rawCommand, isRunning, translate);
    case "node":
    case "bun":
    case "deno":
    case "python":
    case "python3":
    case "ruby":
    case "perl":
      return {
        verb: translate(isRunning ? "chat:runStatus_running" : "chat:ran", { context: "command" }),
        target: inlineScriptTarget(tool, command, args, translate) ?? compactInlineCommand(command),
        fullCommand: rawCommand,
      };
    case "osascript":
      return {
        verb: translate(isRunning ? "chat:runStatus_running" : "chat:ran", { context: "command" }),
        target: "AppleScript",
        fullCommand: rawCommand,
      };
    default:
      return {
        verb: translate(isRunning ? "chat:runStatus_running" : "chat:ran", { context: "command" }),
        target: compactInlineCommand(command),
        fullCommand: rawCommand,
      };
  }
}

function firstCommandExecutable(rawCommand: string): string {
  const trimmed = rawCommand.trim();
  const match = /^(?:"([^"]+)"|'([^']+)'|(\S+))/u.exec(trimmed);
  const executable = match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
  return executable.split(/[\\/]/u).at(-1)?.toLowerCase() ?? "";
}

// The object half of a command row's sentence ("Searched <for foo in src>"),
// kept short enough to read inline. Shell wrappers that carry no meaning for a
// human (a full pwsh.exe path) collapse to the shell's friendly name.
export function deriveFriendlyCommandTarget(rawCommand: string): string {
  const executable = firstCommandExecutable(rawCommand);
  if (
    executable === "pwsh" ||
    executable === "pwsh.exe" ||
    executable === "powershell" ||
    executable === "powershell.exe"
  ) {
    return "PowerShell";
  }
  if (executable === "cmd" || executable === "cmd.exe") {
    return t("chat:commandPrompt");
  }

  const target = deriveReadableCommandDisplay(rawCommand).target.trim();
  return target.length <= 72 ? target : `${target.slice(0, 69).trimEnd()}…`;
}

// Classifies command rows for transcript glyphs after peeling away shell/env wrappers.
// This keeps `git -C`, `env ... gh`, and `/bin/zsh -lc "cd ... && git ..."` visually branded.
export function resolveCommandVisualKind(rawCommand: string): CommandVisualKind {
  if (deriveCommandReadTargets(rawCommand) !== null) {
    return "read";
  }
  const command = stripCommandDisplayWrappers(unwrapShellCommandIfPresent(rawCommand));
  const [tool] = splitToolAndArgs(firstShellCommandSegment(command));
  if (SEARCH_COMMAND_TOOLS.has(tool) || FIND_COMMAND_TOOLS.has(tool)) {
    return "search";
  }
  if (tool === "git") {
    return "git";
  }
  if (tool === "gh" || tool === "hub") {
    return "github";
  }
  return "terminal";
}

export function deriveInlineCommandCall(rawCommand: string): string {
  return stripCommandDisplayWrappers(unwrapShellCommandIfPresent(rawCommand));
}

// The command a row shows: what actually ran, minus the shell wrapper
// (`/bin/zsh -lc "…"`) and leading `cd <dir> &&` preambles. Pipes, chains and
// quoting stay verbatim, unlike `deriveInlineCommandCall`, which keeps only the
// first pipeline stage for classification.
export function deriveLiteralCommand(rawCommand: string): string {
  let value = rawCommand.trim();
  const lowered = value.toLowerCase();
  for (const prefix of SHELL_WRAPPER_PREFIXES) {
    if (!lowered.startsWith(prefix)) {
      continue;
    }
    value = value.slice(prefix.length).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1).trim();
    }
    break;
  }
  return stripLeadingShellPreambles(value).replace(/\s+/g, " ").trim();
}

// Files a command only reads, or null when the command does anything else.
// A row may say "Read <file>" instead of the literal command only when that
// is the whole story: no pipes, chains, redirects or substitutions, and no
// in-place edit (`sed -i`).
export function deriveCommandReadTargets(rawCommand: string): string[] | null {
  const literal = deriveLiteralCommand(rawCommand);
  if (literal.length === 0 || hasUnquotedShellOperator(literal)) {
    return null;
  }
  const [tool, args] = splitToolAndArgs(stripCommandDisplayWrappers(literal));
  if (!READ_FILE_COMMAND_TOOLS.has(tool)) {
    return null;
  }
  const tokens = tokenizeCommandArgs(args);
  const files: string[] = [];
  let skipNext = false;
  let sedScriptPending = tool === "sed";
  let sedPrintOnly = false;
  for (const token of tokens) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (token.startsWith("-") && token.length > 1) {
      if (tool === "sed") {
        if (token === "-i" || token.startsWith("-i") || token.startsWith("--in-place")) {
          return null;
        }
        if (token === "-n" || token === "--quiet" || token === "--silent") {
          sedPrintOnly = true;
        }
        if (token === "-e" || token === "--expression") {
          sedScriptPending = false;
          skipNext = true;
        }
      }
      if ((tool === "head" || tool === "tail") && (token === "-n" || token === "-c")) {
        skipNext = true;
      }
      continue;
    }
    if (sedScriptPending) {
      sedScriptPending = false;
      continue;
    }
    files.push(compactPath(token));
  }
  if (tool === "sed" && !sedPrintOnly) {
    return null;
  }
  return files.length > 0 ? files : null;
}

const SHELL_WRAPPER_PREFIXES = [
  "/usr/bin/bash -lc ",
  "/usr/bin/bash -c ",
  "/bin/bash -lc ",
  "/bin/bash -c ",
  "/usr/bin/zsh -lc ",
  "/usr/bin/zsh -c ",
  "/bin/zsh -lc ",
  "/bin/zsh -c ",
  "/bin/sh -lc ",
  "/bin/sh -c ",
  "bash -lc ",
  "bash -c ",
  "zsh -lc ",
  "zsh -c ",
  "sh -lc ",
  "sh -c ",
];

// Pipes, chains, redirects, background jobs and substitutions outside quotes.
function hasUnquotedShellOperator(value: string): boolean {
  let quote: '"' | "'" | null = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (
      char === "|" ||
      char === "&" ||
      char === ";" ||
      char === ">" ||
      char === "<" ||
      char === "`" ||
      (char === "$" && value[index + 1] === "(")
    ) {
      return true;
    }
  }
  return false;
}

function humanizeGitCommand(
  args: string,
  rawCommand: string,
  isRunning: boolean,
  translate: typeof t,
): ReadableCommandDisplay {
  const normalizedArgs = stripGitGlobalOptions(args);
  const subcommand = normalizedArgs.split(/\s+/, 1)[0]?.toLowerCase() ?? "";
  switch (subcommand) {
    case "status":
      return {
        verb: translate(isRunning ? "chat:providerModelPicker_checking" : "chat:checked", {
          context: "command",
        }),
        target: "git status",
        fullCommand: rawCommand,
      };
    case "diff":
      return {
        verb: translate(isRunning ? "chat:comparing" : "chat:compared", { context: "command" }),
        target: translate("chat:changes"),
        fullCommand: rawCommand,
      };
    case "show":
      return {
        verb: translate(isRunning ? "chat:inspecting" : "chat:inspected", { context: "command" }),
        target: "commit",
        fullCommand: rawCommand,
      };
    case "log":
      return {
        verb: translate(isRunning ? "chat:reviewing" : "chat:reviewed", { context: "command" }),
        target: translate("chat:gitHistory"),
        fullCommand: rawCommand,
      };
    case "add":
      return {
        verb: translate(isRunning ? "chat:staging" : "git:gitPanel_staged", { context: "command" }),
        target: translate("chat:changes"),
        fullCommand: rawCommand,
      };
    case "commit":
      return {
        verb: translate(isRunning ? "chat:committing" : "chat:committed", { context: "command" }),
        target: translate("chat:changes"),
        fullCommand: rawCommand,
      };
    case "push":
      return {
        verb: translate(isRunning ? "chat:pushing" : "workspace:pushed", { context: "command" }),
        target: translate("chat:toRemote"),
        fullCommand: rawCommand,
      };
    case "pull":
      return {
        verb: translate(isRunning ? "chat:pulling" : "chat:pulled", { context: "command" }),
        target: translate("chat:fromRemote"),
        fullCommand: rawCommand,
      };
    case "checkout":
    case "switch":
      return {
        verb: translate(isRunning ? "chat:switchingTo" : "chat:switchedTo", { context: "command" }),
        target: checkoutTarget(args, translate),
        fullCommand: rawCommand,
      };
    default:
      return {
        verb: translate(isRunning ? "chat:runStatus_running" : "chat:ran", { context: "command" }),
        target: compactInlineCommand(`git ${normalizedArgs}`.trim()),
        fullCommand: rawCommand,
      };
  }
}

function stripGitGlobalOptions(args: string): string {
  const tokens = tokenizeCommandArgs(args);
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index]!;
    if (token === "-C" || token === "-c" || token === "--git-dir" || token === "--work-tree") {
      index += 2;
      continue;
    }
    if (
      token.startsWith("-C") ||
      token.startsWith("-c") ||
      token.startsWith("--git-dir=") ||
      token.startsWith("--work-tree=")
    ) {
      index += 1;
      continue;
    }
    if (token.startsWith("--")) {
      index += 1;
      continue;
    }
    break;
  }
  return tokens.slice(index).join(" ");
}

function checkoutTarget(args: string, translate: typeof t): string {
  const branch = tokenizeCommandArgs(args).at(-1)?.trim();
  return branch ? branch : translate("common:branch");
}

function lastPathComponents(args: string, fallback: string, translate: typeof t): string {
  const tokens = tokenizeCommandArgs(args);
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index]!.replace(/^['"]|['"]$/g, "");
    if (!token || token.startsWith("-")) {
      continue;
    }
    return compactPath(token, true, translate);
  }
  return fallback;
}

function findTarget(args: string, fallback: string, translate: typeof t): string {
  const tokens = tokenizeCommandArgs(args);
  let skipNext = false;
  for (const token of tokens) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (token.startsWith("-")) {
      if (
        token === "-maxdepth" ||
        token === "-mindepth" ||
        token === "-name" ||
        token === "-type" ||
        token === "-path"
      ) {
        skipNext = true;
      }
      continue;
    }
    return compactPath(token, true, translate);
  }
  return fallback;
}

function compactPath(path: string, localized = false, translate: typeof t = t): string {
  if (path === ".") {
    return localized ? translate("chat:currentDirectory") : "current directory";
  }
  if (path === "..") {
    return localized ? translate("chat:parentDirectory") : "parent directory";
  }
  const parts = path.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 2) {
    return path;
  }
  return parts.slice(-2).join("/");
}

function compactInlineCommand(command: string): string {
  const normalized = command.replace(/\s+/g, " ").trim();
  if (normalized.length <= 140) {
    return normalized;
  }
  return `${normalized.slice(0, 137).trimEnd()}...`;
}

function firstShellCommandSegment(command: string): string {
  const chain = findShellChain(command);
  return chain ? command.slice(0, chain.operatorStart).trim() : command;
}

function inlineScriptTarget(
  tool: string,
  command: string,
  args: string,
  translate: typeof t,
): string | null {
  const normalizedTool = tool === "python3" ? "python" : tool;
  if (containsHeredoc(command) || hasInlineScriptFlag(args)) {
    return translate("chat:script", { tool: normalizedTool });
  }
  return null;
}

function containsHeredoc(command: string): boolean {
  return /(^|\s)<<-?\s*['"]?[A-Za-z0-9_]+/.test(command);
}

function hasInlineScriptFlag(args: string): boolean {
  const tokens = tokenizeCommandArgs(args);
  return tokens.some((token) => token === "-e" || token === "-c" || token.startsWith("-e="));
}

function searchSummary(args: string, translate: typeof t): string {
  const { pattern, path, directoryReference } = extractSearchPatternAndPath(args);
  const displayPath = directoryReference
    ? translate(path === "parent directory" ? "chat:parentDirectory" : "chat:currentDirectory")
    : path;
  if (pattern && path) {
    return translate("chat:forIn", { pattern, path: displayPath });
  }
  if (pattern) {
    return translate("chat:for", { pattern });
  }
  if (path) {
    return translate("chat:in", { path: displayPath });
  }
  return translate("chat:files");
}

function extractSearchPatternAndPath(args: string): {
  pattern: string | null;
  path: string | null;
  directoryReference: boolean;
} {
  const tokens = tokenizeCommandArgs(args);
  let pattern: string | null = null;
  let path: string | null = null;
  let directoryReference = false;
  let skipNext = false;

  for (const token of tokens) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (token.startsWith("-")) {
      if (
        token === "-t" ||
        token === "-g" ||
        token === "--type" ||
        token === "--glob" ||
        token === "--max-count"
      ) {
        skipNext = true;
      }
      continue;
    }
    if (!pattern) {
      const normalizedPattern = normalizeSearchPatternToken(token);
      if (!normalizedPattern) {
        const normalizedPath = normalizeSearchPathToken(token);
        if (normalizedPath && (!path || path === "current directory")) {
          path = normalizedPath;
          directoryReference = token.trim() === "." || token.trim() === "..";
        }
        continue;
      }
      pattern = normalizedPattern;
      continue;
    }
    if (!path || path === "current directory") {
      const normalizedPath = normalizeSearchPathToken(token);
      if (normalizedPath) {
        path = normalizedPath;
        directoryReference = token.trim() === "." || token.trim() === "..";
      }
      continue;
    }
  }

  if (pattern && path === "current directory" && looksLikeSearchPath(pattern)) {
    path = normalizeSearchPathToken(pattern);
    directoryReference = false;
    pattern = null;
  }

  return { pattern, path, directoryReference };
}

function normalizeSearchPatternToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") {
    return null;
  }
  if (!/[a-z0-9]/i.test(trimmed)) {
    return null;
  }
  return trimmed.length > 30 ? `${trimmed.slice(0, 27)}...` : trimmed;
}

function normalizeSearchPathToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  return compactPath(trimmed);
}

function looksLikeSearchPath(token: string): boolean {
  return token.includes("/") || token.startsWith(".") || token.includes("\\");
}

function tokenizeCommandArgs(args: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < args.length) {
    while (args[index] === " ") {
      index += 1;
    }
    if (index >= args.length) {
      break;
    }

    const quote = args[index];
    if (quote === '"' || quote === "'") {
      index += 1;
      let token = "";
      while (index < args.length && args[index] !== quote) {
        if (args[index] === "\\" && index + 1 < args.length) {
          token += args[index + 1];
          index += 2;
          continue;
        }
        token += args[index];
        index += 1;
      }
      if (args[index] === quote) {
        index += 1;
      }
      tokens.push(token);
      continue;
    }

    let token = "";
    while (index < args.length && args[index] !== " ") {
      token += args[index];
      index += 1;
    }
    if (token) {
      tokens.push(token);
    }
  }

  return tokens;
}

function splitToolAndArgs(command: string): [tool: string, args: string] {
  const normalized = command.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return ["", ""];
  }
  const separator = normalized.indexOf(" ");
  if (separator === -1) {
    return [basenameOfPath(normalized).toLowerCase(), ""];
  }
  const tool = basenameOfPath(normalized.slice(0, separator)).toLowerCase();
  const args = normalized.slice(separator + 1).trim();
  return [tool, args];
}

function unwrapShellCommandIfPresent(rawCommand: string): string {
  let value = rawCommand.trim();
  if (!value) {
    return value;
  }

  const lowered = value.toLowerCase();
  for (const prefix of SHELL_WRAPPER_PREFIXES) {
    if (!lowered.startsWith(prefix)) {
      continue;
    }
    value = value.slice(prefix.length).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1).trim();
    }
    value = stripLeadingShellPreambles(value);
    break;
  }

  const pipeIndex = value.indexOf("|");
  if (pipeIndex > 0) {
    value = value.slice(0, pipeIndex).trim();
  }

  return value;
}

function stripLeadingShellPreambles(value: string): string {
  let current = value.trim();
  for (let attempts = 0; attempts < 4; attempts += 1) {
    const chain = findShellChain(current);
    if (!chain) {
      return current;
    }
    const head = current.slice(0, chain.operatorStart).trim();
    if (!isShellSetupPreamble(head)) {
      return current;
    }
    current = current.slice(chain.commandStart).trim();
  }
  return current;
}

function isShellSetupPreamble(value: string): boolean {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }
  if (/^(?:builtin\s+)?cd\s+/.test(normalized)) {
    return true;
  }
  if (/^(?:source|\.)\s+/.test(normalized)) {
    return true;
  }
  if (/^set\s+[-+][A-Za-z]/.test(normalized)) {
    return true;
  }
  if (
    /^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*=[^\s]+(?:\s+[A-Za-z_][A-Za-z0-9_]*=[^\s]+)*$/.test(
      normalized,
    )
  ) {
    return true;
  }
  return false;
}

function findShellChain(value: string): { operatorStart: number; commandStart: number } | null {
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < value.length - 1; index += 1) {
    const char = value[index];
    if (char === "\\" && index + 1 < value.length) {
      index += 1;
      continue;
    }
    if (quote) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    const next = value[index + 1];
    if (char === "&" && next === "&") {
      return { operatorStart: index, commandStart: index + 2 };
    }
    if (char === ";") {
      return { operatorStart: index, commandStart: index + 1 };
    }
  }

  return null;
}

function stripCommandDisplayWrappers(command: string): string {
  let current = command.replace(/\s+/g, " ").trim();
  for (let attempts = 0; attempts < 4; attempts += 1) {
    const [tool, args] = splitToolAndArgs(current);
    const next =
      tool === "env"
        ? stripEnvCommand(args)
        : tool === "timeout" || tool === "gtimeout"
          ? stripTimeoutCommand(args)
          : tool === "nice"
            ? stripNiceCommand(args)
            : tool === "arch"
              ? stripArchCommand(args)
              : tool === "command"
                ? args
                : null;
    if (!next || next === current) {
      return current;
    }
    current = next.trim();
  }
  return current;
}

function stripEnvCommand(args: string): string | null {
  const tokens = tokenizeCommandArgs(args);
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index]!;
    if (token === "--") {
      index += 1;
      break;
    }
    if (token === "-u" || token === "--unset" || token === "-C" || token === "--chdir") {
      index += 2;
      continue;
    }
    if (token.startsWith("--unset=") || token.startsWith("--chdir=")) {
      index += 1;
      continue;
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) {
      index += 1;
      continue;
    }
    if (token.startsWith("-")) {
      index += 1;
      continue;
    }
    break;
  }
  return index < tokens.length ? tokens.slice(index).join(" ") : null;
}

function stripTimeoutCommand(args: string): string | null {
  const tokens = tokenizeCommandArgs(args);
  let index = 0;
  while (index < tokens.length && tokens[index]?.startsWith("-")) {
    index += tokens[index] === "-s" || tokens[index] === "-k" ? 2 : 1;
  }
  if (index < tokens.length && /^\d+(?:\.\d+)?[smhd]?$/.test(tokens[index]!)) {
    index += 1;
  }
  return index < tokens.length ? tokens.slice(index).join(" ") : null;
}

function stripNiceCommand(args: string): string | null {
  const tokens = tokenizeCommandArgs(args);
  let index = 0;
  if (tokens[index] === "-n") {
    index += 2;
  } else {
    while (tokens[index]?.startsWith("-")) {
      index += 1;
    }
  }
  return index < tokens.length ? tokens.slice(index).join(" ") : null;
}

function stripArchCommand(args: string): string | null {
  const tokens = tokenizeCommandArgs(args);
  let index = 0;
  while (tokens[index]?.startsWith("-")) {
    index += 1;
  }
  return index < tokens.length ? tokens.slice(index).join(" ") : null;
}
