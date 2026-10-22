import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + pointer affordance for clickable cards. */
  interactive?: boolean;
  /** Removes default padding when the card manages its own layout. */
  flush?: boolean;
  children?: ReactNode;
}

export function Card({
  interactive = false,
  flush = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = [
    "card",
    interactive && "card--interactive",
    flush && "card--flush",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned slot for actions. */
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <header className={`card__header ${className}`.trim()}>
      <div className="card__heading">
        <h3 className="card__title">{title}</h3>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card__action">{action}</div>}
    </header>
  );
}

export function CardBody({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`card__body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <footer className={`card__footer ${className}`.trim()}>{children}</footer>;
}
