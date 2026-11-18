import * as NodeServices from "@effect/platform-node/NodeServices";
import {
  ZYRON_BETA_BUNDLE_ID,
  ZYRON_DESKTOP_BUNDLE_ID_ENV,
  ZYRON_PRODUCTION_BUNDLE_ID,
} from "@zyron/shared/desktopIdentity";
import { Effect, FileSystem, Layer } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServerConfig } from "../../config";
import { ServerEnvironment } from "../Services/ServerEnvironment";
import { ServerEnvironmentLive } from "./ServerEnvironment";

const makeLayer = (baseDir: string) =>
  ServerEnvironmentLive.pipe(Layer.provide(ServerConfig.layerTest(process.cwd(), baseDir)));

describe("ServerEnvironmentLive", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("persists the environment id across service restarts", async () => {
    await Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "zyron-server-environment-test-",
      });

      const first = yield* Effect.gen(function* () {
        const serverEnvironment = yield* ServerEnvironment;
        return yield* serverEnvironment.getDescriptor;
      }).pipe(Effect.provide(makeLayer(baseDir)));

      const second = yield* Effect.gen(function* () {
        const serverEnvironment = yield* ServerEnvironment;
        return yield* serverEnvironment.getDescriptor;
      }).pipe(Effect.provide(makeLayer(baseDir)));

      expect(first.environmentId).toBe(second.environmentId);
      expect(first.serverVersion).toMatch(/^\d+\.\d+\.\d+/);
      expect(second.capabilities.repositoryIdentity).toBe(true);
    }).pipe(Effect.provide(NodeServices.layer), Effect.scoped, Effect.runPromise);
  });

  it.each([ZYRON_PRODUCTION_BUNDLE_ID, ZYRON_BETA_BUNDLE_ID])(
    "advertises composer predictions in the desktop app (%s)",
    async (bundleId) => {
      vi.stubEnv(ZYRON_DESKTOP_BUNDLE_ID_ENV, bundleId);
      vi.resetModules();
      const environmentModule = await import("./ServerEnvironment");
      const servicesModule = await import("../Services/ServerEnvironment");
      const configModule = await import("../../config");

      const descriptor = await Effect.gen(function* () {
        const fileSystem = yield* FileSystem.FileSystem;
        const baseDir = yield* fileSystem.makeTempDirectoryScoped({
          prefix: "zyron-server-environment-test-",
        });
        return yield* Effect.gen(function* () {
          const serverEnvironment = yield* servicesModule.ServerEnvironment;
          return yield* serverEnvironment.getDescriptor;
        }).pipe(
          Effect.provide(
            environmentModule.ServerEnvironmentLive.pipe(
              Layer.provide(configModule.ServerConfig.layerTest(process.cwd(), baseDir)),
            ),
          ),
        );
      }).pipe(Effect.provide(NodeServices.layer), Effect.scoped, Effect.runPromise);

      expect(descriptor.capabilities.composerPredictions).toBe(true);
    },
  );
});
