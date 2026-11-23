// FILE: logo.tsx
// Purpose: Render the Zyron mark as an inline SVG that follows theme foreground color.
// Shared branding primitive used by the web app and the public profile page.
// Layer: profile-ui shared component.

import type { SVGProps } from "react";
import { cn } from "./cn";

// Shared SVG path data for the Zyron geometric mark (viewBox 0 0 1024 1024).
export const ZYRON_LOGO_PATHS = [
  // Top Wing
  "M255 364 L363 256 H675 C730 256 769 285 769 325 V364 H255 Z",
  // Middle Diagonal Bar
  "M551 394 H737 L477 624 H291 L551 394 Z",
  // Bottom Wing
  "M254 659 H768 L673 754 H348 C290 754 254 725 254 685 V659 Z",
] as const;

export function ZyronLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  const ariaLabel = props["aria-label"];

  return (
    <svg
      viewBox="246 240 531 531"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
      className={cn("shrink-0 text-foreground", className)}
    >
      {ZYRON_LOGO_PATHS.map((path) => (
        <path key={path} d={path} fill="currentColor" />
      ))}
    </svg>
  );
}
