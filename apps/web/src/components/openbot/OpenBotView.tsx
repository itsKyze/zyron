// FILE: OpenBotView.tsx
// Purpose: OpenBot coworkers surface inside Zyron - self-hostable AI coworkers with browser automation, tools, and multi-agent coordination.
// Layer: Web route view component

import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RouteInsetSurface } from "../RouteInsetSurface";
import { RouteSurface, RouteSurfaceHeader } from "../RouteSurface";
import { Button } from "~/components/ui/button";
import {
  BotIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PlayIcon,
  CheckIcon,
  SettingsIcon,
  EyeIcon,
} from "~/lib/icons";
import { openExternalLink } from "~/lib/linkChips";
import { cn } from "~/lib/utils";

interface CoworkerPreset {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: readonly string[];
  status: "idle" | "ready" | "connected";
}

const DEFAULT_COWORKERS: CoworkerPreset[] = [
  {
    id: "browser-agent",
    name: "Web Navigator",
    role: "Browser Automation",
    description:
      "Autonomously researches documentation, checks live web applications, and extracts structured datasets.",
    capabilities: ["Web Scraping", "Form Filling", "Human Approval"],
    status: "ready",
  },
  {
    id: "fullstack-coworker",
    name: "Code Reviewer",
    role: "Fullstack Assistant",
    description:
      "Reviews commits, drafts pull requests, verifies test coverage, and enforces repository best practices.",
    capabilities: ["Git Audits", "Test Verification", "Diff Inspection"],
    status: "ready",
  },
  {
    id: "research-bot",
    name: "Deep Researcher",
    role: "Knowledge Synthesis",
    description:
      "Synthesizes multi-source briefs, compares vendor benchmarks, and indexes internal documentation.",
    capabilities: ["Multi-source Query", "Report Export", "Citation Tracking"],
    status: "ready",
  },
];

const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    hint: "Enter your OpenAI platform API key starting with sk-",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
    hint: "Enter your Google AI Studio API key starting with AIza",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultModel: "claude-3-7-sonnet",
    models: ["claude-3-7-sonnet", "claude-3-5-sonnet", "claude-3-5-haiku"],
    hint: "Enter your Anthropic API key starting with sk-ant-",
  },
  {
    id: "local",
    name: "Local / Ollama",
    defaultModel: "llama3.3",
    models: ["llama3.3", "deepseek-r1", "qwen2.5-coder"],
    hint: "Uses your local Ollama or compatible OpenAI proxy endpoint",
  },
] as const;

const OPENBOT_BASE_URL = "http://127.0.0.1:3001";
const OPENBOT_INSTALL_TOKEN = "1b51c90286b2846212078c0f544eb35697b82fc092cf628312b8a6f9f1d9de4a";
const OPENBOT_AUTH_URL = `${OPENBOT_BASE_URL}/api/install/enter?token=${OPENBOT_INSTALL_TOKEN}&to=/`;

export default function OpenBotView() {
  const navigate = useNavigate();

  // Configuration persistence
  const [isConfigured, setIsConfigured] = useState<boolean>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("zyron-openbot-configured") === "true"
      : false;
  });

  const [viewMode, setViewMode] = useState<"app" | "setup" | "catalog">(() => {
    return typeof window !== "undefined" &&
      localStorage.getItem("zyron-openbot-configured") === "true"
      ? "app"
      : "setup";
  });

  // Setup wizard state
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [accountEmail, setAccountEmail] = useState<string>(() => {
    return typeof window !== "undefined"
      ? (localStorage.getItem("zyron-openbot-email") ?? "developer@zyron.workspace")
      : "developer@zyron.workspace";
  });
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    return typeof window !== "undefined"
      ? (localStorage.getItem("zyron-openbot-provider") ?? "openai")
      : "openai";
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return typeof window !== "undefined"
      ? (localStorage.getItem("zyron-openbot-model") ?? "gpt-4o")
      : "gpt-4o";
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return typeof window !== "undefined"
      ? (localStorage.getItem("zyron-openbot-apikey") ?? "")
      : "";
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedCoworker, setSelectedCoworker] = useState<string>(() => {
    return typeof window !== "undefined"
      ? (localStorage.getItem("zyron-openbot-coworker") ?? "browser-agent")
      : "browser-agent";
  });

  // Launch progression states
  const [launchProgress, setLaunchProgress] = useState<number>(0);
  const [launchStepText, setLaunchStepText] = useState<string>("");
  const [isLaunching, setIsLaunching] = useState(false);

  const [openBotAppUrl] = useState(OPENBOT_AUTH_URL);
  const [openBotServerUrl, setOpenBotServerUrl] = useState(OPENBOT_BASE_URL);

  const activeProviderMeta = PROVIDERS.find((p) => p.id === selectedProvider) ?? PROVIDERS[0];

  const handleProviderSelect = (provId: string) => {
    setSelectedProvider(provId);
    const meta = PROVIDERS.find((p) => p.id === provId);
    if (meta) {
      setSelectedModel(meta.defaultModel);
    }
  };

  const handleCompleteSetup = () => {
    setIsLaunching(true);
    setSetupStep(4);
    setLaunchProgress(15);
    setLaunchStepText("Verifying container runtime and local engine...");

    setTimeout(() => {
      setLaunchProgress(45);
      setLaunchStepText("Registering AI model credentials and encryption vault...");
    }, 700);

    setTimeout(() => {
      setLaunchProgress(80);
      setLaunchStepText("Connecting to OpenBot workspace server on port 3001...");
    }, 1400);

    setTimeout(() => {
      setLaunchProgress(100);
      setLaunchStepText("OpenBot workspace ready. Opening live interface...");

      // Save choices
      localStorage.setItem("zyron-openbot-configured", "true");
      localStorage.setItem("zyron-openbot-email", accountEmail);
      localStorage.setItem("zyron-openbot-provider", selectedProvider);
      localStorage.setItem("zyron-openbot-model", selectedModel);
      if (apiKey) localStorage.setItem("zyron-openbot-apikey", apiKey);
      localStorage.setItem("zyron-openbot-coworker", selectedCoworker);

      setIsConfigured(true);
      setIsLaunching(false);
      setViewMode("app");
    }, 2100);
  };

  const handleResetSetup = () => {
    setSetupStep(1);
    setViewMode("setup");
  };

  return (
    <RouteInsetSurface>
      <RouteSurface>
        <RouteSurfaceHeader>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: "/" })}
              className="h-8 gap-1 px-2 text-ui-sm text-muted-foreground hover:text-foreground shrink-0"
              title="Return to chats"
            >
              <ChevronLeftIcon className="size-4" />
              <span>Back</span>
            </Button>
            <div className="h-4 w-px bg-border/60 shrink-0" />
            <span className="text-ui font-medium text-foreground truncate">OpenBot Workspace</span>
            {isConfigured && viewMode === "app" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-ui-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Running</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={viewMode === "app" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("app")}
                className="h-7 px-2.5 text-ui-xs"
              >
                Live App
              </Button>
              <Button
                type="button"
                variant={viewMode === "setup" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("setup")}
                className="h-7 px-2.5 text-ui-xs"
              >
                Setup & Keys
              </Button>
              <Button
                type="button"
                variant={viewMode === "catalog" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("catalog")}
                className="h-7 px-2.5 text-ui-xs"
              >
                Coworkers
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openExternalLink(openBotAppUrl)}
              className="gap-1.5 h-8 text-ui-sm"
              title="Open full OpenBot interface in native browser tab"
            >
              <span>Browser</span>
              <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </RouteSurfaceHeader>

        {viewMode === "app" ? (
          <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
            <iframe
              src={openBotAppUrl}
              title="OpenBot Application"
              className="w-full h-full border-none bg-background"
              allow="clipboard-read; clipboard-write; microphone; camera; autoplay; encrypted-media; fullscreen"
              // eslint-disable-next-line react/iframe-missing-sandbox
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            />
          </div>
        ) : viewMode === "setup" ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start bg-background">
            <div className="w-full max-w-2xl flex flex-col gap-6 py-4">
              {/* Wizard header */}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1 shadow-sm">
                  <BotIcon className="size-6" />
                </div>
                <h2 className="text-ui-lg font-semibold text-foreground">
                  OpenBot Desktop Onboarding
                </h2>
                <p className="text-ui text-muted-foreground max-w-md">
                  Configure your autonomous coworker workspace with your AI model provider and
                  credentials.
                </p>

                {/* Stepper indicator */}
                <div className="flex items-center gap-2 mt-3">
                  {[
                    { num: 1, label: "Account" },
                    { num: 2, label: "Model & Key" },
                    { num: 3, label: "Coworker" },
                    { num: 4, label: "Start" },
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center text-ui-xs font-medium transition-colors",
                          setupStep === s.num
                            ? "bg-primary text-primary-foreground font-semibold"
                            : setupStep > s.num
                              ? "bg-muted text-foreground border border-border"
                              : "bg-muted/40 text-muted-foreground border border-border/40",
                        )}
                      >
                        {setupStep > s.num ? (
                          <CheckIcon className="size-3 text-emerald-500" />
                        ) : (
                          s.num
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-ui-xs",
                          setupStep === s.num
                            ? "text-foreground font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                      {s.num < 4 && <div className="w-4 h-px bg-border/60 mx-0.5" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Account */}
              {setupStep === 1 && (
                <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-ui font-semibold text-foreground">Workspace Account</h3>
                    <p className="text-ui-sm text-muted-foreground">
                      OpenBot runs on your machine and uses your local workspace identity.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-ui-xs font-medium text-foreground">
                      Account Email or Handle
                    </label>
                    <input
                      type="text"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full text-ui bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                      placeholder="developer@zyron.workspace"
                    />
                    <span className="text-ui-xs text-muted-foreground">
                      Used to isolate your local bots, memory, and personal session data.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                    <span className="text-ui-xs font-semibold text-foreground uppercase tracking-wider">
                      Edition & Deployment
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border-2 border-primary bg-primary/5 p-3.5 flex flex-col gap-1">
                        <span className="text-ui font-medium text-foreground">
                          Local Standalone
                        </span>
                        <span className="text-ui-xs text-muted-foreground">
                          Zero cloud telemetry. Runs directly in Docker containers on this computer.
                        </span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex flex-col gap-1 opacity-70">
                        <span className="text-ui font-medium text-foreground">Team Hub</span>
                        <span className="text-ui-xs text-muted-foreground">
                          Multi-user coordination with remote cloud relays and shared tools.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setSetupStep(2)}
                      className="gap-1.5 px-4 text-ui-sm"
                    >
                      <span>Continue to Model</span>
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Model & Key */}
              {setupStep === 2 && (
                <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-ui font-semibold text-foreground">AI Model Provider</h3>
                    <p className="text-ui-sm text-muted-foreground">
                      Choose which AI provider powers your coworkers' reasoning and code execution.
                    </p>
                  </div>

                  {/* Provider grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {PROVIDERS.map((p) => {
                      const isSel = selectedProvider === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleProviderSelect(p.id)}
                          className={cn(
                            "flex flex-col text-start p-3.5 rounded-xl border transition-all outline-none",
                            isSel
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 bg-muted/20 hover:border-border",
                          )}
                        >
                          <span className="text-ui font-medium text-foreground">{p.name}</span>
                          <span className="text-ui-xs text-muted-foreground mt-0.5 font-mono">
                            {p.defaultModel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Model dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-ui-xs font-medium text-foreground">Model Choice</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full text-ui bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {activeProviderMeta.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-ui-xs font-medium text-foreground">
                        {activeProviderMeta.name} API Key
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey((v) => !v)}
                        className="text-ui-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>{showApiKey ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full text-ui bg-background border border-border rounded-lg px-3 py-2 font-mono outline-none focus:border-primary transition-colors"
                      placeholder={
                        selectedProvider === "local"
                          ? "Optional for local endpoints"
                          : activeProviderMeta.hint
                      }
                    />
                    <span className="text-ui-xs text-muted-foreground">
                      {activeProviderMeta.hint}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSetupStep(1)}
                      className="gap-1 text-ui-sm text-muted-foreground"
                    >
                      <ChevronLeftIcon className="size-4" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setSetupStep(3)}
                      className="gap-1.5 px-4 text-ui-sm"
                    >
                      <span>Continue to Coworker</span>
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Coworker Selection */}
              {setupStep === 3 && (
                <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-ui font-semibold text-foreground">Default AI Coworker</h3>
                    <p className="text-ui-sm text-muted-foreground">
                      Pick your primary assistant persona. You can switch or add more anytime.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {DEFAULT_COWORKERS.map((coworker) => {
                      const isSel = selectedCoworker === coworker.id;
                      return (
                        <button
                          key={coworker.id}
                          type="button"
                          onClick={() => setSelectedCoworker(coworker.id)}
                          className={cn(
                            "flex items-start gap-3.5 p-4 rounded-xl border text-start transition-all outline-none",
                            isSel
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 bg-muted/20 hover:border-border",
                          )}
                        >
                          <div className="size-9 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                            <BotIcon className="size-4.5" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-ui font-medium text-foreground">
                                {coworker.name}
                              </span>
                              <span className="text-ui-xs text-muted-foreground font-mono">
                                {coworker.role}
                              </span>
                            </div>
                            <p className="text-ui-sm text-muted-foreground mt-1 line-clamp-2">
                              {coworker.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {coworker.capabilities.map((c) => (
                                <span
                                  key={c}
                                  className="text-ui-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 font-mono"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isSel && (
                            <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <CheckIcon className="size-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSetupStep(2)}
                      className="gap-1 text-ui-sm text-muted-foreground"
                    >
                      <ChevronLeftIcon className="size-4" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleCompleteSetup}
                      className="gap-1.5 px-5 text-ui-sm"
                    >
                      <PlayIcon className="size-3.5" />
                      <span>Start OpenBot</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Launching progress */}
              {setupStep === 4 && (
                <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/70 bg-card/40 p-8 shadow-sm text-center">
                  <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                    <BotIcon className="size-7" />
                  </div>

                  <div className="flex flex-col gap-2 max-w-sm">
                    <h3 className="text-ui-lg font-semibold text-foreground">Launching OpenBot</h3>
                    <p className="text-ui-sm text-muted-foreground font-mono">{launchStepText}</p>
                  </div>

                  <div className="w-full max-w-md bg-muted/60 rounded-full h-2 overflow-hidden border border-border/40">
                    <div
                      className="bg-primary h-full transition-all duration-500 rounded-full"
                      style={{ width: `${launchProgress}%` }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-ui-xs text-muted-foreground">
                    <span>Account: {accountEmail}</span>
                    <span>
                      Model: {selectedModel} ({activeProviderMeta.name})
                    </span>
                    <span>Endpoint: {openBotServerUrl}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
            {/* Header Banner */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <BotIcon className="size-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-ui-lg font-semibold text-foreground">OpenBot Workspace</h2>
                  <p className="text-ui text-muted-foreground leading-normal">
                    Production-ready AI coworkers running on your machine or cloud infrastructure.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetSetup}
                  className="gap-1.5 shrink-0 text-ui-sm"
                >
                  <SettingsIcon className="size-3.5" />
                  <span>Configure Keys</span>
                </Button>
              </div>
            </div>

            {/* Quick Connect & Docker Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gateway URL
                </span>
                <input
                  type="text"
                  value={openBotServerUrl}
                  onChange={(e) => setOpenBotServerUrl(e.target.value)}
                  className="w-full text-ui bg-background/60 border border-border/80 rounded-lg px-3 py-1.5 font-mono outline-none focus:border-primary"
                  placeholder="http://localhost:3001"
                />
                <span className="text-ui-xs text-muted-foreground">
                  Default OpenBot compose endpoint
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stack Status
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-ui font-medium text-foreground">LangGraph Engine</span>
                  <span className="text-ui-xs text-emerald-500 font-mono">v1.2.0</span>
                </div>
                <span className="text-ui-xs text-muted-foreground">
                  Multi-agent state machine ready
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browser Tooling
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-ui font-medium text-foreground">Playwright Sandboxed</span>
                  <span className="text-ui-xs text-primary font-mono">Active</span>
                </div>
                <span className="text-ui-xs text-muted-foreground">
                  Isolated container for web automation
                </span>
              </div>
            </div>

            {/* Coworkers Catalog */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-ui font-semibold text-foreground">Available AI Coworkers</h3>
                <span className="text-ui-xs text-muted-foreground">
                  Select a bot to view capabilities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEFAULT_COWORKERS.map((coworker) => {
                  const isSelected = selectedCoworker === coworker.id;
                  return (
                    <button
                      key={coworker.id}
                      type="button"
                      onClick={() => setSelectedCoworker(coworker.id)}
                      className={cn(
                        "flex flex-col text-start p-4 rounded-xl border transition-all relative overflow-hidden outline-none",
                        "hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-card/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 w-full">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-muted/60 border border-border/80 flex items-center justify-center text-foreground shrink-0">
                            <BotIcon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-ui font-medium truncate text-foreground">
                              {coworker.name}
                            </span>
                            <span className="text-ui-xs text-muted-foreground truncate">
                              {coworker.role}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <CheckIcon className="size-3" />
                          </div>
                        )}
                      </div>

                      <p className="text-ui-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                        {coworker.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {coworker.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded-md bg-muted/50 text-ui-xs text-muted-foreground border border-border/40 font-mono"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </RouteSurface>
    </RouteInsetSurface>
  );
}
