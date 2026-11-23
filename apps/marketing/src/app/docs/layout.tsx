import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type * as PageTree from "fumadocs-core/page-tree";
import { SiOpenai } from "react-icons/si";
import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  BookOpen,
  Bot,
  Bug,
  CheckCircle2,
  Columns3,
  Compass,
  Cpu,
  Download,
  Eye,
  FileCode,
  FileSearch,
  FlaskConical,
  FolderGit2,
  FolderTree,
  GitBranch,
  GitFork,
  GitPullRequest,
  HelpCircle,
  Home,
  Kanban,
  Keyboard,
  KeyRound,
  Layers,
  LayoutGrid,
  MessageSquare,
  Monitor,
  PenTool,
  Plug,
  Puzzle,
  RotateCw,
  Server,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Target,
  Terminal,
  Upload,
  Wrench,
} from "lucide-react";
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
import { docsSource } from "@/lib/docs";
import { docsLayoutOptions } from "@/lib/docsLayout";
import { DocsA11yLabels } from "@/components/docs/DocsA11yLabels";
import { DocsSmoothScroll } from "@/components/docs/DocsSmoothScroll";

const DOCS_ICONS: Record<string, ReactNode> = {
  // Root / Home
  "/docs": <Home className="size-3.5 shrink-0 text-current" aria-hidden="true" />,

  // Getting Started
  "/docs/getting-started/quickstart": (
    <Sparkles className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/getting-started/core-concepts": (
    <BookOpen className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/getting-started/installation": (
    <Download className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/getting-started/providers": (
    <LayoutGrid className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/getting-started/first-task": (
    <CheckCircle2 className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),

  // Providers
  "/docs/providers": <LayoutGrid className="size-3.5 shrink-0 text-current" aria-hidden="true" />,
  "/docs/providers/claude-code": <ClaudeIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/codex": (
    <SiOpenai className="size-3.5 shrink-0 text-current" aria-hidden="true" role="presentation" />
  ),
  "/docs/providers/opencode": <OpencodeIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/cursor": <CursorIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/antigravity": <AntigravityIcon className="size-3.5 shrink-0" />,
  "/docs/providers/grok": <GrokIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/devin": <DevinIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/pi": <PiIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/factory-droid": <DroidIcon className="size-3.5 shrink-0 text-current" />,
  "/docs/providers/omp": <PiIcon className="size-3.5 shrink-0 text-current" />,

  // Workflows
  "/docs/workflows": <GitBranch className="size-3.5 shrink-0 text-current" aria-hidden="true" />,
  "/docs/workflows/best-practices": (
    <Sparkles className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/parallel-agents": (
    <Columns3 className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/worktrees": (
    <GitFork className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/forks": (
    <GitFork className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/handoffs": (
    <ArrowLeftRight className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/debugging": (
    <Bug className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/browser-verification": (
    <Compass className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/headless-server": (
    <Server className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/pull-requests": (
    <GitPullRequest className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/automations": (
    <RotateCw className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/studio": (
    <Layers className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/agent-gateway": (
    <ShieldCheck className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/workflows/external-mcp": (
    <Puzzle className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),

  // Features
  "/docs/features/overview": (
    <LayoutGrid className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/zyron-beta": (
    <FlaskConical className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/hubs": <Layers className="size-3.5 shrink-0 text-current" aria-hidden="true" />,
  "/docs/features/tasks-and-inbox": (
    <Kanban className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/provider-accounts": (
    <KeyRound className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/computer-use": (
    <Monitor className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/project-import": (
    <Upload className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/multi-folder-projects": (
    <FolderTree className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/composer": (
    <PenTool className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/inline-visuals": (
    <Eye className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/connectors": (
    <Plug className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/subagents": <Bot className="size-3.5 shrink-0 text-current" aria-hidden="true" />,
  "/docs/features/conversation-history": (
    <MessageSquare className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/thread-goals": (
    <Target className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/organize": (
    <FolderGit2 className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/workspace-editor": (
    <FileCode className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/terminal-panels": (
    <Terminal className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/browser-sessions": (
    <Compass className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/ios-simulator": (
    <Smartphone className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/automations": (
    <RotateCw className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/features/customization": (
    <Sliders className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),

  // Reference
  "/docs/reference/slash-commands": (
    <Terminal className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/reference/keyboard-shortcuts": (
    <Keyboard className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/reference/main-preview": (
    <Sparkles className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),

  // Troubleshooting
  "/docs/troubleshooting": <Wrench className="size-3.5 shrink-0 text-current" aria-hidden="true" />,
  "/docs/troubleshooting/desktop-and-updates": (
    <Download className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/providers": (
    <Cpu className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/tasks-and-runtime": (
    <Activity className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/git-and-worktrees": (
    <GitFork className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/browser": (
    <Compass className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/automations-and-integrations": (
    <RotateCw className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/diagnostics": (
    <FileSearch className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/faq": (
    <HelpCircle className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
  "/docs/troubleshooting/report-a-problem": (
    <AlertCircle className="size-3.5 shrink-0 text-current" aria-hidden="true" />
  ),
};

function enrichTreeWithIcons(root: PageTree.Root): PageTree.Root {
  function mapNode(node: PageTree.Node): PageTree.Node {
    if (node.type === "page" && node.url && DOCS_ICONS[node.url]) {
      return {
        ...node,
        icon: DOCS_ICONS[node.url],
      };
    }
    if (node.type === "folder" && "children" in node && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(mapNode),
      };
    }
    return node;
  }

  return {
    ...root,
    children: root.children.map(mapNode),
  };
}

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  const tree = enrichTreeWithIcons(docsSource.getPageTree());

  return (
    <>
      <DocsLayout
        {...docsLayoutOptions()}
        tree={tree}
        // Folder triggers are hidden via CSS (flat shadcn-style tree), so every
        // level must render expanded or nested pages would be unreachable.
        sidebar={{ collapsible: true, defaultOpenLevel: 6, prefetch: false }}
        tabs={false}
      >
        {children}
      </DocsLayout>
      <DocsA11yLabels />
      <DocsSmoothScroll />
    </>
  );
}
