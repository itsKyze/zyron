// FILE: EmptyLandingQuickActions.tsx
// Purpose: Renders compact starter-prompt chips on the centered empty chat landing screen.
// Layer: Chat presentation

import { BookOpenIcon, BugIcon, CodeIcon, FlaskConicalIcon, type LucideIcon } from "~/lib/icons";
import { cn } from "~/lib/utils";

interface QuickStarterAction {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  readonly Icon: LucideIcon;
}

const QUICK_STARTER_ACTIONS: readonly QuickStarterAction[] = [
  {
    id: "explain",
    label: "Explain codebase",
    prompt: "Explain the architecture, entry points, and key modules of this project.",
    Icon: BookOpenIcon,
  },
  {
    id: "review",
    label: "Review changes",
    prompt: "Review the current working tree changes for bugs, edge cases, and code quality.",
    Icon: CodeIcon,
  },
  {
    id: "bugs",
    label: "Find & fix bugs",
    prompt: "Inspect the codebase for potential bugs, race conditions, or unhandled errors.",
    Icon: BugIcon,
  },
  {
    id: "tests",
    label: "Write tests",
    prompt: "Add or improve unit tests covering the core logic and edge cases.",
    Icon: FlaskConicalIcon,
  },
];

/**
 * Compact row of starter prompt pills shown below the empty-landing heading.
 * Clicking a chip populates the composer draft and focuses the input without sending.
 */
export function EmptyLandingQuickActions({
  onSelectPrompt,
  className,
}: {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center justify-center gap-2 [@media(max-height:580px)]:hidden",
        className,
      )}
    >
      {QUICK_STARTER_ACTIONS.map(({ id, label, prompt, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectPrompt(prompt)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-ui-xs font-medium text-muted-foreground backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-border hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-0 motion-reduce:transition-none"
        >
          <Icon className="size-3.5 shrink-0 opacity-80" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
