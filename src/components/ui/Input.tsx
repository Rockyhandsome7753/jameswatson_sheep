import type { InputHTMLAttributes, ReactNode } from "react";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Visually hides the label but keeps it for screen readers. */
  hideLabel?: boolean;
}

export function Input({
  label,
  hint,
  error,
  iconLeft,
  iconRight,
  hideLabel = false,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputId = id ?? (label ? `field-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={`field ${error ? "field--error" : ""} ${className}`.trim()}>
      {label && (
        <label
          className={hideLabel ? "visually-hidden" : "field__label"}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}

      <div className="field__control">
        {iconLeft && <span className="field__icon field__icon--left">{iconLeft}</span>}
        <input
          id={inputId}
          className={`field__input ${iconLeft ? "field__input--has-left" : ""} ${
            iconRight ? "field__input--has-right" : ""
          }`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {iconRight && <span className="field__icon field__icon--right">{iconRight}</span>}
      </div>

      {error ? (
        <p className="field__message field__message--error" id={`${inputId}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field__message" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
