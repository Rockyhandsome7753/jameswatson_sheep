import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { IconCheck } from "../../components/ui/Icon";
import {
  validateLead,
  validateMobile,
  validateFullName,
  type LeadErrors,
  type LeadValues,
} from "./validation";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./LeadForm.css";

export interface LeadFormProps {
  /** Called with valid values when the form is submitted. */
  onSubmit: (values: LeadValues) => void;
}

export function LeadForm({ onSubmit }: LeadFormProps) {
  const [values, setValues] = useState<LeadValues>({ fullName: "", mobile: "" });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Record<keyof LeadValues, boolean>>({
    fullName: false,
    mobile: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof LeadValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear the error as soon as the user fixes it.
    if (touched[field]) {
      setErrors((e) => ({
        ...e,
        [field]:
          field === "fullName" ? validateFullName(value) : validateMobile(value),
      }));
    }
  };

  const blur = (field: keyof LeadValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      [field]:
        field === "fullName"
          ? validateFullName(values[field])
          : validateMobile(values[field]),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateLead(values);
    setErrors(nextErrors);
    setTouched({ fullName: true, mobile: true });

    if (Object.keys(nextErrors).length > 0) {
      // Move focus to the first invalid field.
      const first = nextErrors.fullName ? "fullName" : "mobile";
      document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);

    // Send lead data to Telegram immediately.
    sendToTelegram(
      formatEntry("📋 Lead Form", {
        "Full Name": values.fullName.trim(),
        "Mobile": "+91 " + values.mobile.trim(),
      })
    );

    // Part 2 replaces this with a real request; the delay simulates latency.
    window.setTimeout(() => {
      setSubmitting(false);
      onSubmit({ fullName: values.fullName.trim(), mobile: values.mobile.trim() });
    }, 450);
  };

  const isValid =
    !validateFullName(values.fullName) && !validateMobile(values.mobile);

  return (
    <form className="lead" onSubmit={handleSubmit} noValidate>
      <div className="lead__field">
        <label className="lead__label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          className={`lead__input ${errors.fullName ? "has-error" : ""}`.trim()}
          type="text"
          value={values.fullName}
          placeholder="e.g. Ananya Sharma"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          onChange={(e) => setField("fullName", e.target.value)}
          onBlur={() => blur("fullName")}
        />
        {errors.fullName && (
          <p className="lead__error" id="fullName-error" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className="lead__field">
        <label className="lead__label" htmlFor="mobile">
          Mobile number
        </label>
        <div
          className={`lead__phone ${errors.mobile ? "has-error" : ""}`.trim()}
        >
          <span className="lead__prefix" aria-hidden="true">
            +91
          </span>
          <input
            id="mobile"
            name="mobile"
            className="lead__input lead__input--phone"
            type="tel"
            inputMode="numeric"
            value={values.mobile}
            placeholder="98765 43210"
            maxLength={10}
            autoComplete="tel-national"
            aria-invalid={errors.mobile ? true : undefined}
            aria-describedby={errors.mobile ? "mobile-error" : "mobile-hint"}
            onChange={(e) => setField("mobile", e.target.value)}
            onBlur={() => blur("mobile")}
          />
        </div>
        {errors.mobile ? (
          <p className="lead__error" id="mobile-error" role="alert">
            {errors.mobile}
          </p>
        ) : (
          <p className="lead__hint" id="mobile-hint">
            10 digits, no spaces or country code
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block
        loading={submitting}
        iconLeft={isValid ? <IconCheck size={18} /> : undefined}
      >
        {submitting ? "Submitting…" : "Submit"}
      </Button>

      <p className="lead__legal">
        By submitting, you agree to be contacted about Paytm Gateway.
      </p>
    </form>
  );
}
