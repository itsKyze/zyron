// FILE: Features.tsx
// Purpose: Renders homepage provider and product-system sections.
// Layer: Marketing UI section

import type { ComponentType } from "react";
import { SiOpenai } from "react-icons/si";
import {
  AntigravityIcon,
  ClaudeIcon,
  CursorIcon,
  DevinIcon,
  DroidIcon,
  GrokIcon,
  OpencodeIcon,
  PiIcon,
} from "@/components/BrandIcons";
import { SplitShowcase } from "@/components/SplitShowcase";
import { WorktreeMock } from "@/components/WorktreeMock";
import { MultiProjectShowcase } from "@/components/MultiProjectShowcase";
import { OneClickPrMock } from "@/components/OneClickPrMock";
import { PRODUCT_PILLARS } from "@/data/product";

type GenericIcon = ComponentType<{ className?: string }>;

const heading =
  "text-[1.65rem] font-medium leading-[1.12] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[2rem]";
const body = "mt-5 max-w-2xl text-[15px] leading-[1.7] text-[var(--text-secondary)] sm:text-[16px]";
const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

type Harness = {
  name: string;
  tagline: string;
  Icon: GenericIcon;
  accent: string;
  status: string;
};

const activeHarnesses: Harness[] = [
  {
    name: "Claude Code",
    tagline: "Use the Claude Code runtime and account already configured on your machine.",
    Icon: ClaudeIcon,
    accent: "text-[var(--text-primary)]",
    status: "CLI + account",
  },
  {
    name: "Codex",
    tagline:
      "Run Codex tasks with the authenticated CLI, repository, and review surfaces together.",
    Icon: SiOpenai,
    accent: "text-[var(--text-primary)]",
    status: "CLI + account",
  },
  {
    name: "OpenCode",
    tagline: "Bring OpenCode and its configured provider catalog into the same task system.",
    Icon: OpencodeIcon,
    accent: "text-[var(--text-primary)]",
    status: "Configured models",
  },
  {
    name: "Cursor",
    tagline: "Use Cursor Agent beside other runtimes without moving the work to another workspace.",
    Icon: CursorIcon,
    accent: "text-[var(--text-primary)]",
    status: "Agent CLI",
  },
  {
    name: "Antigravity",
    tagline: "Run Antigravity with its own account, models, permissions, and session behavior.",
    Icon: AntigravityIcon,
    accent: "",
    status: "agy CLI",
  },
  {
    name: "Grok Build",
    tagline: "Use Grok Build through its local runtime and Agent Client Protocol integration.",
    Icon: GrokIcon,
    accent: "text-[var(--text-primary)]",
    status: "grok CLI",
  },
  {
    name: "Devin CLI",
    tagline:
      "Run Devin locally through ACP with its account, models, commands, plan mode, and compaction.",
    Icon: DevinIcon,
    accent: "text-[var(--text-primary)]",
    status: "ACP + account",
  },
  {
    name: "Pi",
    tagline: "Run Pi with its provider registry, thinking levels, skills, and native steering.",
    Icon: PiIcon,
    accent: "text-[var(--text-primary)]",
    status: "Model registry",
  },
  {
    name: "Factory Droid",
    tagline: "Use Droid through its authenticated runtime, model controls, and ACP session.",
    Icon: DroidIcon,
    accent: "text-[var(--text-primary)]",
    status: "droid CLI",
  },
];

export default function Features() {
  return (
    <div>
      <section className="border-t border-[var(--divide)] py-14 sm:py-20">
        <div className={container}>
          <p className="font-mono text-[12px] leading-relaxed uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
            Provider portability
          </p>
          <h2 className={`${heading} mt-3`}>Keep the runtimes you already trust.</h2>
          <p className={body}>
            Zyron sits around your coding agents rather than replacing them. Each provider keeps its
            own authentication, models, tools, and permissions while Zyron gives the work a
            consistent task, environment, review, and delivery layer.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeHarnesses.map(({ name, tagline, Icon, accent, status }) => (
              <div
                key={name}
                className="group/item relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--divide)] bg-[var(--block-elevated)]/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:bg-[var(--block-elevated)]/80 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-black/[0.02] shadow-sm transition-transform duration-300 group-hover/item:scale-110 dark:border-white/10 dark:bg-white/[0.05]">
                        <Icon className={`size-5 ${accent}`} aria-hidden="true" />
                      </span>
                      <span className="truncate text-[15px] font-medium text-[var(--text-primary)]">
                        {name}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-mono text-[var(--text-secondary)] dark:border-white/10 dark:bg-white/[0.05]">
                      {status}
                    </span>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)] sm:text-[13.5px]">
                    {tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--divide)] py-14 sm:py-20">
        <div className={container}>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Durable task ownership
          </p>
          <h2 className={`${heading} mt-3 max-w-2xl`}>
            One workspace. Separate tasks. Shared control.
          </h2>
          <p className={body}>
            A coding agent is only one part of the job. Zyron keeps the objective, environment, live
            processes, verification evidence, and delivery state attached to the work from first
            prompt to pull request.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PRODUCT_PILLARS.map(({ title, description }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--divide)] bg-[var(--block-elevated)]/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-black/20 hover:bg-[var(--block-elevated)]/70 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04] sm:p-7"
              >
                <h3 className="text-[16px] font-medium text-[var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <SplitShowcase
            kicker="01 / delivery"
            title="Deliver from the same task"
            description="Review the final diff, run the required checks, commit the intended changes, and open the pull request without reconstructing the work in another tool."
            reverse={false}
          >
            <OneClickPrMock />
          </SplitShowcase>

          <SplitShowcase
            kicker="02 / parallel work"
            title="Isolate concurrent work"
            description="Give parallel tasks separate Git worktrees so each agent has a clear branch, working directory, and ownership boundary."
            reverse
          >
            <WorktreeMock />
          </SplitShowcase>
        </div>
      </section>

      <MultiProjectShowcase />
    </div>
  );
}
