// FILE: trustedOrigins.test.ts
// Purpose: Pins which browser origins can use local-data HTTP/WS surfaces.
// Layer: Server utility tests

import { describe, expect, it } from "vitest";

import type { ServerConfigShape } from "./config";
import {
  isTrustedAppOrigin,
  normalizeCorsOrigin,
  requiresWebSocketAuthentication,
  shouldRejectAuthMutationOrigin,
  shouldRejectUntrustedRequestOrigin,
} from "./trustedOrigins";

// SAFETY: Tests that exercise host, publicUrl, or authToken spread this fixture
// and override that field; the base only relies on devUrl plus undefined-safe checks.
const config = {
  devUrl: new URL("http://localhost:5173/"),
} as ServerConfigShape;

describe("trustedOrigins", () => {
  it("trusts same-origin, configured dev, and desktop app origins", () => {
    expect(
      isTrustedAppOrigin({
        origin: "http://127.0.0.1:58090",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "http://localhost:5173",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "zyron://app",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "zyron-canary://app",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "zyron-cua://app",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "zyron-beta://app",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
  });

  it("rejects unrelated browser origins but allows non-browser requests without Origin", () => {
    expect(
      isTrustedAppOrigin({
        origin: "https://example.test",
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(false);
    expect(
      isTrustedAppOrigin({
        origin: null,
        requestOrigin: "http://127.0.0.1:58090",
        config,
      }),
    ).toBe(true);
  });

  it("trusts same-origin hosts only when local, configured, or wildcard-bound", () => {
    expect(
      isTrustedAppOrigin({
        origin: "http://evil.test:3773",
        requestOrigin: "http://evil.test:3773",
        config,
      }),
    ).toBe(false);
    expect(
      isTrustedAppOrigin({
        origin: "http://192.168.1.50:3773",
        requestOrigin: "http://192.168.1.50:3773",
        config: { ...config, host: "192.168.1.50" },
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "http://192.168.1.50:3773",
        requestOrigin: "http://192.168.1.50:3773",
        config: { ...config, host: "0.0.0.0" },
      }),
    ).toBe(true);
  });

  it("trusts only the HTTPS public origin for browser traffic in proxy-backed remote mode", () => {
    const remoteConfig = {
      ...config,
      host: "0.0.0.0",
      publicUrl: new URL("https://zyron.example.test/"),
    };
    expect(
      isTrustedAppOrigin({
        origin: "https://zyron.example.test",
        requestOrigin: "http://zyron.example.test",
        config: remoteConfig,
      }),
    ).toBe(true);
    expect(
      isTrustedAppOrigin({
        origin: "http://192.168.1.50:3773",
        requestOrigin: "http://192.168.1.50:3773",
        config: remoteConfig,
      }),
    ).toBe(false);
  });

  it("normalizes desktop origins and single Origin-header arrays", () => {
    expect(normalizeCorsOrigin(["http://localhost:5173"])).toBe("http://localhost:5173");
    expect(normalizeCorsOrigin("zyron://app/")).toBe("zyron://app");
    expect(normalizeCorsOrigin("zyron-canary://app/")).toBe("zyron-canary://app");
    expect(normalizeCorsOrigin("zyron-cua://app/")).toBe("zyron-cua://app");
    expect(normalizeCorsOrigin("zyron-beta://app/")).toBe("zyron-beta://app");
    expect(normalizeCorsOrigin("zyron-remote://app/")).toBe("zyron-remote://app");
  });

  it("trusts every packaged desktop flavor at the request gate and rejects lookalikes", () => {
    for (const rawOrigin of [
      "zyron://app",
      "zyron-beta://app",
      "zyron-canary://app",
      "zyron-cua://app",
      "zyron-remote://app",
    ]) {
      expect(
        shouldRejectUntrustedRequestOrigin({
          rawOrigin,
          requestOrigin: "http://127.0.0.1:58090",
          config,
        }),
      ).toBe(false);
    }
    for (const rawOrigin of [
      "zyron://evil.test",
      "zyron-beta://evil.test",
      "zyron-beta://app.evil.test",
      "zyron-betas://app",
      "zyron-canary://evil.test",
      "zyron-cua://evil.test",
      "zyron-remote://evil.test",
      "zyron-remote://app.evil.test",
      "zyron-remote://app:8080",
      "zyron-remote://user@app",
      "zyron-remotes://app",
    ]) {
      expect(
        shouldRejectUntrustedRequestOrigin({
          rawOrigin,
          requestOrigin: "http://127.0.0.1:58090",
          config,
        }),
      ).toBe(true);
    }
  });

  it("rejects present but untrusted request origins for websocket-style gates", () => {
    const duplicateOrigins = ["http://localhost:5173", "https://example.test"];
    expect(normalizeCorsOrigin(duplicateOrigins)).toBeNull();
    for (const [rawOrigin, rejected] of [
      [undefined, false],
      ["null", true],
      ["https://example.test", true],
      ["http://localhost:5173", false],
      [duplicateOrigins, true],
    ] as const) {
      expect(
        shouldRejectUntrustedRequestOrigin({
          rawOrigin,
          requestOrigin: "http://127.0.0.1:58090",
          config,
        }),
      ).toBe(rejected);
    }
    expect(
      shouldRejectUntrustedRequestOrigin({
        rawOrigin: "http://192.168.1.50:3773",
        requestOrigin: "http://192.168.1.50:3773",
        config: { ...config, host: "0.0.0.0" },
      }),
    ).toBe(false);
  });

  it("requires websocket authentication for every non-loopback exposure", () => {
    expect(
      requiresWebSocketAuthentication({
        host: "127.0.0.1",
        authToken: undefined,
        publicUrl: undefined,
      }),
    ).toBe(false);
    expect(
      requiresWebSocketAuthentication({ host: "::1", authToken: undefined, publicUrl: undefined }),
    ).toBe(false);
    expect(
      requiresWebSocketAuthentication({
        host: "0.0.0.0",
        authToken: undefined,
        publicUrl: undefined,
      }),
    ).toBe(true);
    expect(
      requiresWebSocketAuthentication({ host: "::", authToken: undefined, publicUrl: undefined }),
    ).toBe(true);
    expect(
      requiresWebSocketAuthentication({
        host: "192.168.1.50",
        authToken: undefined,
        publicUrl: undefined,
      }),
    ).toBe(true);
    expect(
      requiresWebSocketAuthentication({
        host: "127.0.0.1",
        authToken: "secret",
        publicUrl: undefined,
      }),
    ).toBe(true);
    expect(
      requiresWebSocketAuthentication({
        host: "127.0.0.1",
        authToken: undefined,
        publicUrl: new URL("https://zyron.example.test/"),
      }),
    ).toBe(true);
  });

  it("withdraws local trust while an SSH forward is enabled", () => {
    // sshd's forwarded socket is indistinguishable from a same-machine
    // process, so anyone who can SSH in could `ssh -L` to the MAIN port and
    // skip the credential the dedicated forward port requires. Enabling a
    // forward must therefore require auth server-wide, not just on that port.
    expect(
      requiresWebSocketAuthentication({
        host: "127.0.0.1",
        authToken: undefined,
        publicUrl: undefined,
        sshForwardPort: 7071,
      }),
    ).toBe(true);
    expect(
      requiresWebSocketAuthentication({
        host: "127.0.0.1",
        authToken: undefined,
        publicUrl: undefined,
        sshForwardPort: undefined,
      }),
    ).toBe(false);
  });

  it("requires browser mutations to have a trusted origin or explicit bearer provenance", () => {
    expect(
      shouldRejectAuthMutationOrigin({
        rawOrigin: undefined,
        requestOrigin: "http://127.0.0.1:58090",
        config,
        credentialSource: "cookie",
      }),
    ).toBe(true);
    expect(
      shouldRejectAuthMutationOrigin({
        rawOrigin: undefined,
        requestOrigin: "http://127.0.0.1:58090",
        config,
        credentialSource: "bearer",
      }),
    ).toBe(false);
    expect(
      shouldRejectAuthMutationOrigin({
        rawOrigin: "http://localhost:5173",
        requestOrigin: "http://127.0.0.1:58090",
        config,
        credentialSource: "cookie",
      }),
    ).toBe(false);
    for (const rawOrigin of ["null", "not a url", "https://example.test"]) {
      expect(
        shouldRejectAuthMutationOrigin({
          rawOrigin,
          requestOrigin: "http://127.0.0.1:58090",
          config,
          credentialSource: "bearer",
        }),
      ).toBe(true);
    }
  });
});
