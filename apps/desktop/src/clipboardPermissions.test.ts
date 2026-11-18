import { describe, expect, it } from "vitest";
import { isClipboardWritePermission } from "./clipboardPermissions";

const requester = (url = "https://example.com/page", focused = true, destroyed = false) => ({
  getURL: () => url,
  isFocused: () => focused,
  isDestroyed: () => destroyed,
});
describe("clipboard permissions", () => {
  it.each([
    "https://example.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
  ])("allows foreground copy buttons on %s", (url) => {
    expect(
      isClipboardWritePermission(
        requester(url),
        "clipboard-sanitized-write",
        { isMainFrame: true, requestingUrl: url, embeddingOrigin: new URL(url).origin },
        url,
      ),
    ).toBe(true);
  });
  it.each([
    "zyron://app",
    "zyron-canary://app",
    "zyron-cua://app",
    "zyron-beta://app",
    "zyron-remote://app",
  ])("allows foreground copy buttons on the %s desktop origin", (origin) => {
    const url = `${origin}/index.html`;
    expect(
      isClipboardWritePermission(
        requester(url),
        "clipboard-sanitized-write",
        { isMainFrame: true, requestingUrl: url, embeddingOrigin: origin },
        origin,
      ),
    ).toBe(true);
  });
  it.each([
    "zyron-beta://app",
    "zyron-remote://evil.test",
    "zyron-remote://app:8080",
    "zyron-remote://user@app",
  ])("rejects foreign clipboard request metadata from %s", (origin) => {
    const page = requester("zyron-remote://app/index.html");
    expect(isClipboardWritePermission(page, "clipboard-sanitized-write", {}, origin)).toBe(false);
    expect(
      isClipboardWritePermission(page, "clipboard-sanitized-write", { requestingUrl: origin }),
    ).toBe(false);
    expect(
      isClipboardWritePermission(page, "clipboard-sanitized-write", { embeddingOrigin: origin }),
    ).toBe(false);
  });
  it.each(["clipboard-read", "deprecated-sync-clipboard-read", "media", "unknown"])(
    "does not grant %s",
    (permission) => {
      expect(isClipboardWritePermission(requester(), permission, {})).toBe(false);
    },
  );
  it("leaves document focus to Chromium but rejects destroyed, insecure and foreign-frame requests", () => {
    for (const source of [
      null,
      requester(undefined, true, true),
      requester("http://example.com"),
      requester("file:///tmp/page.html"),
      requester("bad-url"),
      requester("zyron-remote://evil.test"),
      requester("zyron-remote://app.evil.test"),
      requester("zyron-remote://app:8080"),
      requester("zyron-remote://user@app"),
      requester("zyron-remotes://app"),
    ])
      expect(isClipboardWritePermission(source, "clipboard-sanitized-write", {})).toBe(false);
    for (const details of [
      { isMainFrame: false },
      { embeddingOrigin: "https://other.test" },
      { requestingUrl: "https://other.test" },
      { requestingUrl: "invalid" },
    ])
      expect(isClipboardWritePermission(requester(), "clipboard-sanitized-write", details)).toBe(
        false,
      );
    expect(
      isClipboardWritePermission(
        requester(),
        "clipboard-sanitized-write",
        {},
        "https://other.test",
      ),
    ).toBe(false);
    expect(isClipboardWritePermission(requester(), "clipboard-sanitized-write", {})).toBe(true);
    expect(
      isClipboardWritePermission(requester(undefined, false), "clipboard-sanitized-write", {}),
    ).toBe(true);
  });
});
