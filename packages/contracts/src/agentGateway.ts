/**
 * Public contracts for the Zyron agent-control gateway.
 *
 * New gateway tools decode these schemas before doing any work. Keeping the
 * limits here ensures the MCP surface, server implementation, and tests share
 * the same definition of an exact creation/wait plan.
 */
import { Schema } from "effect";

import { EnvironmentId, ProjectId, ThreadId, TurnId } from "./baseSchemas";
import { ModelSelection, ProviderKind, RuntimeMode } from "./orchestration";
import { ProviderModelDescriptor } from "./providerDiscovery";
import { ProviderInstanceId } from "./providerInstance";
import { ServerProviderAuthStatus } from "./server";

export const ZYRON_GATEWAY_MAX_THREADS_PER_OPERATION = 20;
export const ZYRON_GATEWAY_MAX_REQUEST_ID_LENGTH = 256;
export const ZYRON_GATEWAY_MAX_WAIT_MS = 60_000;

export const ZyronGatewayErrorCode = Schema.Literals([
  "caller_session_inactive",
  "caller_turn_inactive",
  "capability_denied",
  "provider_unavailable",
  "model_unavailable",
  "model_option_unavailable",
  "idempotency_conflict",
  "creation_plan_locked",
  "creation_limit_exceeded",
  "thread_not_found",
  "wait_timed_out",
  "operation_failed",
  "remote_unavailable",
]);
export type ZyronGatewayErrorCode = typeof ZyronGatewayErrorCode.Type;

export const ZyronGatewayError = Schema.Struct({
  code: ZyronGatewayErrorCode,
  message: Schema.String,
  details: Schema.optional(Schema.Unknown),
});
export type ZyronGatewayError = typeof ZyronGatewayError.Type;

export const ZyronGatewayErrorResult = Schema.Struct({
  error: ZyronGatewayError,
});
export type ZyronGatewayErrorResult = typeof ZyronGatewayErrorResult.Type;

export const ZyronContextResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  harness: Schema.Struct({
    name: Schema.Literal("Zyron"),
    policyVersion: Schema.String,
  }),
  caller: Schema.Struct({
    environmentId: Schema.optional(EnvironmentId),
    threadId: ThreadId,
    turnId: Schema.NullOr(TurnId),
    provider: ProviderKind,
    projectId: ProjectId,
  }),
  capabilities: Schema.Struct({
    threadRead: Schema.Boolean,
    threadCreate: Schema.Boolean,
    threadWait: Schema.Boolean,
    automations: Schema.Boolean,
  }),
});
export type ZyronContextResult = typeof ZyronContextResult.Type;

export const ZyronCreateThreadSpec = Schema.Struct({
  prompt: Schema.String.check(Schema.isNonEmpty()),
  contextMessageIds: Schema.optional(
    Schema.Array(Schema.String.check(Schema.isNonEmpty())).check(Schema.isMaxLength(16)),
  ),
  notifyCreatorOnComplete: Schema.optional(Schema.Boolean),
  title: Schema.optional(Schema.String.check(Schema.isNonEmpty())),
  target: ModelSelection,
  projectId: Schema.optional(ProjectId),
  environment: Schema.optional(Schema.Literals(["local", "worktree"])),
  baseRef: Schema.optional(Schema.String.check(Schema.isNonEmpty())),
  // Legacy inputs remain decodable for replay/backward compatibility, but the
  // MCP catalog no longer advertises branch-backed worktree creation.
  baseBranch: Schema.optional(Schema.String.check(Schema.isNonEmpty())),
  branchName: Schema.optional(Schema.String.check(Schema.isNonEmpty())),
  runtimeMode: Schema.optional(Schema.Literals(["approval-required", "full-access"])),
  // External integrations need the "computer:control" scope; provider sessions
  // cannot delegate computer control to created threads.
  enableComputerControl: Schema.optional(Schema.Boolean),
  // Proposed identity of one task inside a Hub request. The coordinator may
  // propose it; the Hub routing service freezes the normalized key at the first
  // persisted decision, so a retry reuses the same worker instead of creating a
  // second one. Ignored outside Hubs.
  taskKey: Schema.optional(Schema.String.check(Schema.isNonEmpty()).check(Schema.isMaxLength(128))),
  // Short reason recorded with the routing decision and shown on the task card.
  // It authorizes nothing and is not part of task identity.
  routingReason: Schema.optional(Schema.String.check(Schema.isMaxLength(500))),
});
export type ZyronCreateThreadSpec = typeof ZyronCreateThreadSpec.Type;

const ZyronGatewayRequestId = Schema.String.check(Schema.isNonEmpty()).check(
  Schema.isMaxLength(ZYRON_GATEWAY_MAX_REQUEST_ID_LENGTH),
);

export const ZyronCreateThreadsInput = Schema.Struct({
  requestId: ZyronGatewayRequestId,
  threads: Schema.Array(ZyronCreateThreadSpec)
    .check(Schema.isMinLength(1))
    .check(Schema.isMaxLength(ZYRON_GATEWAY_MAX_THREADS_PER_OPERATION)),
}).annotate({ parseOptions: { onExcessProperty: "error" } });
export type ZyronCreateThreadsInput = typeof ZyronCreateThreadsInput.Type;

export const ZyronProviderInstanceCatalog = Schema.Struct({
  instanceId: ProviderInstanceId,
  displayName: Schema.String.check(Schema.isNonEmpty()),
  isDefault: Schema.Boolean,
  enabled: Schema.Boolean,
});
export type ZyronProviderInstanceCatalog = typeof ZyronProviderInstanceCatalog.Type;

export const ZyronProviderCatalog = Schema.Struct({
  provider: ProviderKind,
  defaultModel: Schema.NullOr(Schema.String),
  models: Schema.Array(ProviderModelDescriptor),
  // Optional for older MCP clients that decode a capability response from a
  // server predating provider-instance discovery. Current servers always emit
  // the field, including an empty array when no extra instances are configured.
  instances: Schema.optional(Schema.Array(ZyronProviderInstanceCatalog)),
  enabled: Schema.Boolean,
  available: Schema.Boolean,
  authStatus: Schema.optional(ServerProviderAuthStatus),
  source: Schema.optional(Schema.String),
  error: Schema.optional(Schema.String),
});
export type ZyronProviderCatalog = typeof ZyronProviderCatalog.Type;

export const ZyronGatewayTargetOptionValue = Schema.Union([
  Schema.String,
  Schema.Number,
  Schema.Boolean,
]);
export type ZyronGatewayTargetOptionValue = typeof ZyronGatewayTargetOptionValue.Type;

export const ZyronGatewayTargetOptionRule = Schema.Struct({
  key: Schema.String,
  valueType: Schema.Literals(["string", "number", "boolean"]),
  allowedValues: Schema.Array(ZyronGatewayTargetOptionValue),
  allowedValuesSource: Schema.Literals(["provider-contract", "model-discovery"]),
});
export type ZyronGatewayTargetOptionRule = typeof ZyronGatewayTargetOptionRule.Type;

export const ZyronGatewayTargetConstruction = Schema.Struct({
  modelValueSource: Schema.Literal("providers[].models[].slug"),
  primaryOptionKey: Schema.String,
  alternativeOptionKeys: Schema.Array(Schema.String),
  optionSelectionRule: Schema.String,
  providerOptions: Schema.Array(ZyronGatewayTargetOptionRule),
  optionsByModel: Schema.Record(Schema.String, Schema.Array(ZyronGatewayTargetOptionRule)),
  exampleTarget: Schema.NullOr(ModelSelection),
});
export type ZyronGatewayTargetConstruction = typeof ZyronGatewayTargetConstruction.Type;

export const ZyronCapabilitiesResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  targetConstruction: Schema.Record(Schema.String, ZyronGatewayTargetConstruction),
  providers: Schema.Array(ZyronProviderCatalog),
  limits: Schema.Struct({
    maxThreadsPerOperation: Schema.Int,
    maxWaitMs: Schema.Int,
    oneCreationPlanPerActiveTurn: Schema.Boolean,
  }),
});
export type ZyronCapabilitiesResult = typeof ZyronCapabilitiesResult.Type;

export const ZyronCreatedThreadResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  index: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  threadId: ThreadId,
  projectId: ProjectId,
  title: Schema.String,
  target: ModelSelection,
  provider: ProviderKind,
  model: Schema.String,
  runtimeMode: RuntimeMode,
  environment: Schema.Literals(["local", "worktree"]),
  branch: Schema.NullOr(Schema.String),
  worktreePath: Schema.NullOr(Schema.String),
  /** Ready-to-use markdown link target for the created thread
   * (`thread://<threadId>`) — renders as a clickable thread link. */
  link: Schema.optional(Schema.String),
  status: Schema.Literal("task_dispatched"),
});
export type ZyronCreatedThreadResult = typeof ZyronCreatedThreadResult.Type;

export const ZyronCreateThreadsResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  operationId: Schema.String,
  requestId: ZyronGatewayRequestId,
  requestedCount: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
  createdCount: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  threadIds: Schema.Array(ThreadId),
  threads: Schema.Array(ZyronCreatedThreadResult),
});
export type ZyronCreateThreadsResult = typeof ZyronCreateThreadsResult.Type;

export const ZyronWaitForThreadsInput = Schema.Struct({
  threadIds: Schema.Array(ThreadId)
    .check(Schema.isMinLength(1))
    .check(Schema.isMaxLength(ZYRON_GATEWAY_MAX_THREADS_PER_OPERATION)),
  runIds: Schema.optional(
    Schema.Array(Schema.NullOr(TurnId)).check(
      Schema.isMaxLength(ZYRON_GATEWAY_MAX_THREADS_PER_OPERATION),
    ),
  ),
  timeoutMs: Schema.optional(
    Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)).check(
      Schema.isLessThanOrEqualTo(ZYRON_GATEWAY_MAX_WAIT_MS),
    ),
  ),
}).annotate({ parseOptions: { onExcessProperty: "error" } });
export type ZyronWaitForThreadsInput = typeof ZyronWaitForThreadsInput.Type;

export const ZyronWaitedThreadResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  threadId: ThreadId,
  runId: Schema.NullOr(TurnId),
  state: Schema.Literals(["idle", "pending", "running", "completed", "error", "interrupted"]),
  terminal: Schema.Boolean,
  timedOut: Schema.Boolean,
  summary: Schema.NullOr(Schema.String),
  summaryTruncated: Schema.Boolean,
  error: Schema.NullOr(Schema.String),
  readThread: Schema.Struct({
    tool: Schema.Literal("zyron_read_thread"),
    arguments: Schema.Struct({ threadId: ThreadId, environmentId: Schema.optional(EnvironmentId) }),
  }),
});
export type ZyronWaitedThreadResult = typeof ZyronWaitedThreadResult.Type;

export const ZyronWaitForThreadsResult = Schema.Struct({
  environmentId: Schema.optional(EnvironmentId),
  callerThreadId: ThreadId,
  runIds: Schema.Array(Schema.NullOr(TurnId)),
  allTerminal: Schema.Boolean,
  timedOut: Schema.Boolean,
  threads: Schema.Array(ZyronWaitedThreadResult),
});
export type ZyronWaitForThreadsResult = typeof ZyronWaitForThreadsResult.Type;
