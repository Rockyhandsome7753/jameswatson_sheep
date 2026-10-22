import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Stretch to the full width of the container. */
  block?: boolean;
  /** Leading adornment, usually an <Icon />. */
  iconLeft?: ReactNode;
  /** Trailing adornment, usually an <Icon />. */
  iconRight?: ReactNode;
  /** Show a spinner and block interaction. */
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  iconLeft,
  iconRight,
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    block && "btn--block",
    loading && "btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && iconLeft && <span className="btn__icon">{iconLeft}</span>}
      {children && <span className="btn__label">{children}</span>}
      {!loading && iconRight && <span className="btn__icon">{iconRight}</span>}
    </button>
  );
}
