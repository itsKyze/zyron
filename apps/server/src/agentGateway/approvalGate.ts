import type { ProviderKind } from "@zyron/contracts";

/** Providers without a native per-call gate. Computer tools use Zyron-owned
 * approval cards for these providers (background full-access can bypass them).
 * Device tools still refuse approval-required actions without a native gate.
 */
export const PROVIDERS_WITHOUT_APPROVAL_GATE: ReadonlySet<ProviderKind> = new Set<ProviderKind>([
  "antigravity",
  "pi",
]);
