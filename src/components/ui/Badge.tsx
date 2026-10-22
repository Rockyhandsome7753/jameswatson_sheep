import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

type Tone = "neutral" | "primary" | "navy" | "success" | "warning" | "danger";
type Size = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  /** Leading dot — good for status indicators. */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const classes = ["badge", `badge--${tone}`, `badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
