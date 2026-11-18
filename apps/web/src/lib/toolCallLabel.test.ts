import { describe, expect, it } from "vitest";
import { t } from "~/i18n";
import {
  deriveFriendlyCommandTarget,
  deriveCommandReadTargets,
  deriveInlineCommandCall,
  deriveLiteralCommand,
  deriveReadableCommandDisplay,
  deriveReadableToolTitle,
  deriveZyronMcpToolTitle,
  extractMcpServerName,
  extractWebFetchUrl,
  isZyronBrowserToolCall,
  normalizeCompactToolLabel,
  resolveCommandVisualKind,
  sanitizeZyronMcpToolPreview,
} from "./toolCallLabel";

describe("tool presentation", () => {
  it("derives English cache titles through a source translator", () => {
    const sourceTranslate: typeof t = (message, values) => t(message, { ...values, lng: "en" });
    const read = { fallbackLabel: "Tool", requestKind: "file-read" } as const;
    const command = {
      fallbackLabel: "Tool",
      itemType: "command_execution",
      command: "cat Settings",
      isRunning: true,
    } as const;
    const computer = { fallbackLabel: "Tool", payload: { name: "computer_click" } };
    const zyron = { toolName: "zyron_read_thread", status: "running" } as const;
    expect(deriveReadableToolTitle(read, sourceTranslate)).toBe("Read");
    expect(deriveReadableToolTitle(command, sourceTranslate)).toBe("Reading");
    expect(deriveReadableToolTitle(computer, sourceTranslate)).toBe("Click");
    expect(deriveZyronMcpToolTitle(zyron, sourceTranslate)).toBe("Zyron is reading a thread");
    expect(deriveReadableCommandDisplay("rg Settings .", true, sourceTranslate)).toEqual({
      verb: "Searching",
      target: "for Settings in current directory",
      fullCommand: "rg Settings .",
    });
    expect(
      deriveZyronMcpToolTitle({ toolName: "zyron_settings", status: "running" }, sourceTranslate),
    ).toBe("Zyron is handling settings");
  });

  it("translates known command verbs and preserves commands and arbitrary tool titles", () => {
    expect(deriveReadableToolTitle({ title: "Settings", fallbackLabel: "Tool" })).toBe("Settings");
    expect(deriveLiteralCommand("cat Settings")).toBe("cat Settings");
    expect(deriveReadableCommandDisplay("cat Settings", true).verb).toBe("Reading");
    expect(deriveZyronMcpToolTitle({ toolName: "zyron_read_thread", status: "running" })).toBe(
      "Zyron is reading a thread",
    );
  });
});

describe("extractWebFetchUrl", () => {
  it("pulls the url out of a WebFetch argument summary", () => {
    expect(
      extractWebFetchUrl({
        toolName: "WebFetch",
        detail: 'WebFetch: {"url":"https://ui.shadcn.com/docs/components","prompt":"List EVER..."}',
      }),
    ).toBe("https://ui.shadcn.com/docs/components");
  });

  it("recognizes alternate fetch tool names and the uri field", () => {
    expect(
      extractWebFetchUrl({
        toolName: "web_fetch",
        detail: '{"uri":"https://example.com/path"}',
      }),
    ).toBe("https://example.com/path");
  });

  it("falls back to a bare URL token when there is no json field", () => {
    expect(extractWebFetchUrl({ toolName: "fetch", detail: "Fetching https://example.com." })).toBe(
      "https://example.com",
    );
  });

  it("ignores non-fetch tools", () => {
    expect(
      extractWebFetchUrl({ toolName: "Read", detail: '{"url":"https://example.com"}' }),
    ).toBeNull();
  });

  it("ignores non-http(s) and missing urls", () => {
    expect(
      extractWebFetchUrl({ toolName: "WebFetch", detail: '{"url":"ftp://example.com"}' }),
    ).toBeNull();
    expect(extractWebFetchUrl({ toolName: "WebFetch", detail: '{"prompt":"hi"}' })).toBeNull();
    expect(extractWebFetchUrl({ toolName: "WebFetch", detail: undefined })).toBeNull();
  });
});

describe("extractMcpServerName", () => {
  it("reads the server from Claude's mcp__server__tool names", () => {
    expect(extractMcpServerName("mcp__superx_so_connector__get_me", null)).toBe(
      "superx_so_connector",
    );
  });

  it("reads Codex's nested { server, tool } pair", () => {
    expect(
      extractMcpServerName("get_me", {
        data: { item: { type: "mcpToolCall", server: "stripe", tool: "list_customers" } },
      }),
    ).toBe("stripe");
  });

  it("is null for tools that are not MCP calls", () => {
    expect(extractMcpServerName("Bash", { data: { item: { command: "ls" } } })).toBeNull();
    expect(extractMcpServerName(undefined, null)).toBeNull();
  });
});

describe("normalizeCompactToolLabel", () => {
  it("removes trailing completion wording", () => {
    expect(normalizeCompactToolLabel("Tool call completed")).toBe("Tool call");
    expect(normalizeCompactToolLabel("Ran command done")).toBe("Ran command");
    expect(normalizeCompactToolLabel("Ran command started")).toBe("Ran command");
  });

  it.each([
    ["  Tool\r\n\tCOMPLETED\n", "Tool"],
    ["completed", "completed"],
    [" completed ", ""],
    ["Toolcompleted", "Toolcompleted"],
    ["Tool completed later", "Tool completed later"],
    ["Tool\u00a0done\u2028", "Tool"],
  ])("preserves status-word boundaries in %j", (value, expected) => {
    expect(normalizeCompactToolLabel(value)).toBe(expected);
  });
});

describe("deriveZyronMcpToolTitle", () => {
  it.each([["browser_run", "Run browser actions"]])(
    "keeps current and historical %s messages readable",
    (toolName, title) => {
      expect(deriveZyronMcpToolTitle({ toolName, status: "completed" })).toBe(title);
      expect(isZyronBrowserToolCall({ title })).toBe(true);
    },
  );

  it("uses stable action-first names for Zyron browser tools", () => {
    for (const status of ["running", "completed", "failed"] as const) {
      expect(
        deriveZyronMcpToolTitle({
          toolName: "mcp__zyron__browser_open",
          status,
        }),
      ).toBe("Open browser tab");
    }

    expect(
      deriveZyronMcpToolTitle({
        title: "Zyron: Browser Snapshot",
        status: "completed",
      }),
    ).toBe("Snapshot browser page");
  });

  it("recognizes bare and already-humanized Zyron tool names", () => {
    expect(deriveZyronMcpToolTitle({ toolName: "zyron_send_message", status: "running" })).toBe(
      "Zyron is sending a message",
    );
    expect(
      deriveZyronMcpToolTitle({ title: "Zyron: Zyron List Threads", status: "completed" }),
    ).toBe("Zyron listed threads");
    expect(
      deriveZyronMcpToolTitle({ toolName: "zyron_create_thread", status: "cancelled" }),
    ).toBe("Zyron stopped creating a thread");
  });

  it("ignores tools from other MCP servers", () => {
    expect(
      deriveZyronMcpToolTitle({
        toolName: "mcp__codex_apps__github_fetch_pr",
        status: "running",
      }),
    ).toBeNull();
  });

  it("keeps future Zyron actions branded without exposing raw identifiers", () => {
    expect(
      deriveZyronMcpToolTitle({
        toolName: "mcp__zyron__zyron_delete_project",
        status: "running",
      }),
    ).toBe("Zyron is handling delete project");
    expect(
      deriveZyronMcpToolTitle({
        toolName: "Zyron__zyron_delete_project",
        status: "completed",
      }),
    ).toBe("Zyron handled delete project");
    expect(
      deriveZyronMcpToolTitle({
        toolName: "zyron_is_handling_delete_project",
        status: "completed",
      }),
    ).toBe("Zyron handled delete project");
  });

  it("does not reinterpret free text beginning with fallback status copy", () => {
    expect(
      deriveZyronMcpToolTitle({
        title: "Zyron is handling delete project after recovery",
        status: "completed",
      }),
    ).toBeNull();
    expect(
      deriveZyronMcpToolTitle({
        title: "Zyron handled delete project after recovery",
        status: "running",
      }),
    ).toBeNull();
    expect(
      deriveZyronMcpToolTitle({
        title: "Zyron couldn't handle delete project after recovery",
        status: "failed",
      }),
    ).toBeNull();
  });

  it("removes transport identifiers without hiding meaningful Zyron details", () => {
    expect(
      sanitizeZyronMcpToolPreview({
        preview: "Zyron__zyron_create_threads",
        heading: "Zyron created threads",
        status: "completed",
      }),
    ).toBeNull();
    expect(
      sanitizeZyronMcpToolPreview({
        preview: 'Unexpected key "reasoningEffort" for Claude Agent',
        heading: "Zyron couldn't create threads",
        status: "failed",
      }),
    ).toBe('Unexpected key "reasoningEffort" for Claude Agent');
  });
});

describe("isZyronBrowserToolCall", () => {
  it("recognizes canonical presentation titles without a tool identifier", () => {
    expect(isZyronBrowserToolCall({ title: "Open browser tab" })).toBe(true);
    expect(isZyronBrowserToolCall({ fallbackLabel: "Snapshot browser page" })).toBe(true);
    expect(isZyronBrowserToolCall({ title: "Zyron listed threads" })).toBe(false);
  });
});

describe("deriveReadableToolTitle", () => {
  it.each([["mcp__zyron__computer_activate_window", "Activate a window"]])(
    "uses the curated Computer label for %s",
    (toolName, expected) => {
      expect(
        deriveReadableToolTitle({
          title: "Tool",
          fallbackLabel: "Tool",
          itemType: "mcp_tool_call",
          payload: { data: { item: { tool: toolName } } },
        }),
      ).toBe(expected);
    },
  );

  it("humanizes git status commands", () => {
    expect(
      deriveReadableToolTitle({
        title: "Ran command",
        fallbackLabel: "Ran command",
        itemType: "command_execution",
        command: "git status --short",
      }),
    ).toBe("Checked");
  });

  it("keeps explicit non-generic titles", () => {
    expect(
      deriveReadableToolTitle({
        title: "Bash",
        fallbackLabel: "Ran command",
        itemType: "command_execution",
        command: "echo hello",
      }),
    ).toBe("Bash");
  });

  it("treats Cursor placeholder titles as generic", () => {
    expect(
      deriveReadableToolTitle({
        title: "Find",
        fallbackLabel: "Find",
        itemType: "dynamic_tool_call",
        payload: { data: { kind: "search" } },
      }),
    ).toBe("Search");

    expect(
      deriveReadableToolTitle({
        title: "Read File",
        fallbackLabel: "Read File",
        itemType: "dynamic_tool_call",
        payload: { data: { kind: "read" } },
      }),
    ).toBe("Read");
  });

  it("humanizes provider tool identifiers used as lifecycle titles", () => {
    expect(
      deriveReadableToolTitle({
        title: "get_app_state",
        fallbackLabel: "get_app_state",
        itemType: "mcp_tool_call",
      }),
    ).toBe("Get App State");
  });
});

describe("deriveReadableCommandDisplay", () => {
  it.each(["|", "\t\r\n|\t"])("keeps the first command before a pipe: %j", (pipe) => {
    const command = `cat src/result.ts${pipe}head -n 1`;
    expect(deriveReadableCommandDisplay(command)).toEqual({
      verb: "Read",
      target: "src/result.ts",
      fullCommand: command,
    });
  });

  it("extracts search targets without leaking the full shell wrapper inline", () => {
    expect(deriveReadableCommandDisplay(`/bin/zsh -lc 'rg -n "tool call" apps/web/src'`)).toEqual({
      verb: "Searched",
      target: "for tool call in web/src",
      fullCommand: `/bin/zsh -lc 'rg -n "tool call" apps/web/src'`,
    });
  });

  it("unwraps zsh shell wrappers around read commands", () => {
    expect(
      deriveReadableCommandDisplay(
        `/bin/zsh -lc "sed -n '240,520p' src/components/provider-card.tsx"`,
      ),
    ).toEqual({
      verb: "Read",
      target: "components/provider-card.tsx",
      fullCommand: `/bin/zsh -lc "sed -n '240,520p' src/components/provider-card.tsx"`,
    });
  });

  it("keeps quoted paths intact when shell wrappers include cd chaining", () => {
    expect(
      deriveReadableCommandDisplay(
        `zsh -lc "cd '/tmp/my app' && sed -n '1,260p' src/pages/overview.tsx"`,
      ),
    ).toEqual({
      verb: "Read",
      target: "pages/overview.tsx",
      fullCommand: `zsh -lc "cd '/tmp/my app' && sed -n '1,260p' src/pages/overview.tsx"`,
    });
  });

  it("does not discard real chained commands after a shell wrapper", () => {
    expect(
      deriveReadableCommandDisplay(
        `/bin/zsh -lc 'rm -f /tmp/test.log && bun run --cwd apps/server test'`,
      ),
    ).toEqual({
      verb: "Removed",
      target: "/tmp/test.log",
      fullCommand: `/bin/zsh -lc 'rm -f /tmp/test.log && bun run --cwd apps/server test'`,
    });
  });

  it("removes env and timeout wrappers from inline command summaries", () => {
    expect(
      deriveReadableCommandDisplay(
        "env -u ZYRON_AUTH_TOKEN ZYRON_PORT_OFFSET=3158 timeout 180s bun run dev",
        true,
      ),
    ).toEqual({
      verb: "Running",
      target: "bun run dev",
      fullCommand: "env -u ZYRON_AUTH_TOKEN ZYRON_PORT_OFFSET=3158 timeout 180s bun run dev",
    });
  });

  it("summarizes inline script commands without leaking the script body", () => {
    expect(
      deriveReadableCommandDisplay(`node -e "const fs = require('fs'); console.log(fs.cwd)"`, true),
    ).toEqual({
      verb: "Running",
      target: "node script",
      fullCommand: `node -e "const fs = require('fs'); console.log(fs.cwd)"`,
    });

    expect(deriveReadableCommandDisplay("python3 - <<'PY'\nprint('hi')\nPY", true)).toEqual({
      verb: "Running",
      target: "python script",
      fullCommand: "python3 - <<'PY'\nprint('hi')\nPY",
    });
  });

  it("humanizes current-directory searches without leaking placeholder dots", () => {
    expect(deriveReadableCommandDisplay(`rg -n "model(s)?" .`)).toEqual({
      verb: "Searched",
      target: "for model(s)? in current directory",
      fullCommand: `rg -n "model(s)?" .`,
    });
  });

  it("falls back to a directory summary when the search token is only punctuation", () => {
    expect(deriveReadableCommandDisplay(`rg -n . src/lib`)).toEqual({
      verb: "Searched",
      target: "in src/lib",
      fullCommand: `rg -n . src/lib`,
    });
  });
});

describe("deriveFriendlyCommandTarget", () => {
  it("uses a friendly shell name instead of leaking the full wrapper command", () => {
    expect(
      deriveFriendlyCommandTarget(
        '"C:\\Users\\Example\\AppData\\Local\\Microsoft\\WindowsApps\\pwsh.exe" -Command "powershell -NoProfile -Command \\"1..8\\""',
      ),
    ).toBe("PowerShell");
  });

  it("keeps long targets short enough to sit inline", () => {
    const target = deriveFriendlyCommandTarget(`echo ${"a".repeat(200)}`);
    expect(target.length).toBeLessThanOrEqual(72);
    expect(target.endsWith("…")).toBe(true);
  });
});

describe("deriveLiteralCommand", () => {
  it("drops the shell wrapper and cd preamble but keeps pipes and quotes", () => {
    expect(deriveLiteralCommand(`/bin/zsh -lc 'cd /repo && rg -n "a b" src | head -5'`)).toBe(
      `rg -n "a b" src | head -5`,
    );
    expect(deriveLiteralCommand(`find . -name "*.md" -not -path "./.git/*"`)).toBe(
      `find . -name "*.md" -not -path "./.git/*"`,
    );
  });
});

describe("deriveCommandReadTargets", () => {
  it("names the files of a plain read", () => {
    expect(deriveCommandReadTargets("cat calc.py")).toEqual(["calc.py"]);
    expect(deriveCommandReadTargets("head -n 20 README.md")).toEqual(["README.md"]);
    expect(deriveCommandReadTargets("sed -n '1,40p' apps/web/src/app.ts")).toEqual(["src/app.ts"]);
    expect(deriveCommandReadTargets("cat a.txt b.txt")).toEqual(["a.txt", "b.txt"]);
  });

  it("refuses anything that is not only a read", () => {
    expect(deriveCommandReadTargets("cat a.txt | grep foo")).toBeNull();
    expect(deriveCommandReadTargets("cat a.txt && rm b")).toBeNull();
    expect(deriveCommandReadTargets("cat a.txt > b.txt")).toBeNull();
    expect(deriveCommandReadTargets("sed -i 's/a/b/' a.txt")).toBeNull();
    expect(deriveCommandReadTargets("sed 's/a/b/' a.txt")).toBeNull();
    expect(deriveCommandReadTargets("cat")).toBeNull();
    expect(deriveCommandReadTargets("ls")).toBeNull();
    expect(deriveCommandReadTargets("find . -name '*.md'")).toBeNull();
  });
});

describe("deriveInlineCommandCall", () => {
  it("shows the actual command call without the shell wrapper", () => {
    expect(deriveInlineCommandCall(`/bin/zsh -lc 'rg -n "tool call" apps/web/src'`)).toBe(
      `rg -n "tool call" apps/web/src`,
    );
  });
});

describe("resolveCommandVisualKind", () => {
  it("separates file reads from searches", () => {
    expect(resolveCommandVisualKind("cat package.json")).toBe("read");
    expect(resolveCommandVisualKind("sed -n 1,40p src/app.ts")).toBe("read");
    expect(resolveCommandVisualKind("head -n 20 README.md")).toBe("read");
    expect(resolveCommandVisualKind(`rg -n "tool call" apps/web/src`)).toBe("search");
    expect(resolveCommandVisualKind("grep -R foo .")).toBe("search");
    expect(resolveCommandVisualKind("find . -name '*.ts'")).toBe("search");
    expect(resolveCommandVisualKind(`/bin/zsh -lc 'rg -n "x" src'`)).toBe("search");
  });

  it("keeps listings, in-place edits and piped reads on the terminal glyph", () => {
    expect(resolveCommandVisualKind("ls -la src")).toBe("terminal");
    expect(resolveCommandVisualKind("ls")).toBe("terminal");
    expect(resolveCommandVisualKind("sed -i 's/a/b/' src/app.ts")).toBe("terminal");
    expect(resolveCommandVisualKind("cat a.txt && rm -rf dist")).toBe("terminal");
  });

  it("does not treat mutating or executing commands as inspections", () => {
    expect(resolveCommandVisualKind("git status")).toBe("git");
    expect(resolveCommandVisualKind("node build.js")).toBe("terminal");
    expect(resolveCommandVisualKind("rm -rf dist")).toBe("terminal");
    expect(resolveCommandVisualKind("mkdir foo")).toBe("terminal");
  });

  it("classifies git commands through shell and global-option wrappers", () => {
    expect(resolveCommandVisualKind("git status --short")).toBe("git");
    expect(resolveCommandVisualKind("git -C apps/web status --short")).toBe("git");
    expect(resolveCommandVisualKind(`/bin/zsh -lc "cd repo && git branch -vv"`)).toBe("git");
  });

  it("classifies GitHub CLI commands through env wrappers", () => {
    expect(resolveCommandVisualKind("gh pr view 274 --repo owner/repo")).toBe("github");
    expect(resolveCommandVisualKind("env -u GH_TOKEN gh pr status")).toBe("github");
    expect(resolveCommandVisualKind("hub pull-request -m test")).toBe("github");
  });
});
