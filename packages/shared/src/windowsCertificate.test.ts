// FILE: windowsCertificate.test.ts
// Purpose: Keeps Windows signer identity matching consistent across desktop and release checks.
// Layer: Shared utility tests

import { describe, expect, it } from "vitest";

import { matchesDistinguishedName, parseDistinguishedName } from "./windowsCertificate";

describe("windowsCertificate", () => {
  it("parses quoted and escaped distinguished-name values", () => {
    const parsed = parseDistinguishedName('CN=Zyron, O="Acme, Inc.", OU=Tools\\2C Desktop');

    expect(parsed.get("CN")).toBe("Zyron");
    expect(parsed.get("O")).toBe("Acme, Inc.");
    expect(parsed.get("OU")).toBe("Tools, Desktop");
  });

  it("matches expected fields independent of order and extra certificate fields", () => {
    expect(
      matchesDistinguishedName(
        "CN=Zyron, O=Acme Tools",
        "C=US, O=Acme Tools, CN=Zyron, SERIALNUMBER=1234",
      ),
    ).toBe(true);
  });

  it("rejects incomplete pins and mismatched signer fields", () => {
    expect(matchesDistinguishedName("CN=Zyron", "CN=Zyron, O=Acme Tools")).toBe(false);
    expect(matchesDistinguishedName("CN=Zyron, O=Acme Tools", "CN=Zyron, O=Other Tools")).toBe(
      false,
    );
  });
});
